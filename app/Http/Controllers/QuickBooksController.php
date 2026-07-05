<?php
namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\QuickBooksToken;
use App\Models\RetailSale;
use App\Services\QuickBooksPurchaseSyncService;
use App\Services\QuickBooksRetailSaleSyncService;
use Illuminate\Support\Str;

class QuickBooksController extends Controller
{
    private const CALLBACK_REDIRECT_PATH = '/cartoons/add';

    // Step 1: Generate Authorization URL for React
    public function getAuthUrl(Request $request)
    {
        $clientId = trim((string) config('services.quickbooks_test1.client_id'));
        $redirectUri = trim((string) config('services.quickbooks_test1.redirect_uri'));

        if (!$clientId || !$redirectUri) {
            return response()->json([
                'message' => 'QuickBooks credentials are not configured.',
            ], 500);
        }

        if (!filter_var($redirectUri, FILTER_VALIDATE_URL)) {
            Log::error('QuickBooks redirect URI is invalid', ['redirect_uri' => $redirectUri]);

            return response()->json([
                'message' => 'QuickBooks redirect URI is invalid.',
            ], 500);
        }

        $state = Str::random(40);
        $request->session()->put('quickbooks_oauth_state', $state);

        $query = http_build_query([
            'client_id' => $clientId,
            'response_type' => 'code',
            'scope' => 'com.intuit.quickbooks.accounting',
            'redirect_uri' => $redirectUri,
            'state' => $state,
        ], '', '&', PHP_QUERY_RFC3986);

        $url = "https://appcenter.intuit.com/connect/oauth2?{$query}";

        return response()->json(['url' => $url]);
    }

    public function getConnectionStatus(): \Illuminate\Http\JsonResponse
    {
        $status = $this->resolveConnectionStatus(true);

        return response()->json([
            'connected' => $status['connected'],
            'realm_id' => $status['realm_id'],
            'expires_at' => $status['expires_at'],
            'refreshed' => $status['refreshed'],
            'message' => $status['message'],
        ]);
    }

    public function reconnect(Request $request): \Illuminate\Http\JsonResponse
    {
        return $this->getAuthUrl($request);
    }

    public function troubleshoot(): \Illuminate\Http\JsonResponse
    {
        $clientId = trim((string) config('services.quickbooks_test1.client_id'));
        $clientSecret = trim((string) config('services.quickbooks_test1.client_secret'));
        $redirectUri = trim((string) config('services.quickbooks_test1.redirect_uri'));
        $environment = strtolower(trim((string) config('services.quickbooks_test1.environment', 'production')));
        $token = QuickBooksToken::query()->latest('updated_at')->first();

        $issues = [];

        if ($clientId === '') {
            $issues[] = 'Missing QB_TEST1_CLIENT_ID in environment configuration.';
        }

        if ($clientSecret === '') {
            $issues[] = 'Missing QB_TEST1_CLIENT_SECRET in environment configuration.';
        }

        if ($redirectUri === '') {
            $issues[] = 'Missing QB_TEST1_REDIRECT_URI in environment configuration.';
        } elseif (!filter_var($redirectUri, FILTER_VALIDATE_URL)) {
            $issues[] = 'QB_TEST1_REDIRECT_URI is not a valid URL.';
        }

        if ($token === null) {
            $issues[] = 'No QuickBooks token record found. Reconnect is required.';
        }

        $status = $this->resolveConnectionStatus(true);

        if (! $status['connected'] && $status['message'] !== null) {
            $issues[] = $status['message'];
        }

        $pendingPurchases = Purchase::query()->where('quickbooks_sync_status', 'pending_connection')->count();
        $pendingRetailSales = RetailSale::query()->where('quickbooks_sync_status', 'pending_connection')->count();

        return response()->json([
            'connected' => $status['connected'],
            'refreshed' => $status['refreshed'],
            'message' => $status['message'],
            'configuration' => [
                'client_id_configured' => $clientId !== '',
                'client_secret_configured' => $clientSecret !== '',
                'redirect_uri' => $redirectUri !== '' ? $redirectUri : null,
                'redirect_uri_valid' => $redirectUri !== '' ? (bool) filter_var($redirectUri, FILTER_VALIDATE_URL) : false,
                'environment' => $environment,
            ],
            'token' => [
                'exists' => $token !== null,
                'realm_id' => $status['realm_id'],
                'access_token_expires_at' => $token?->access_token_expires_at?->toIso8601String(),
                'refresh_token_expires_at' => $token?->refresh_token_expires_at?->toIso8601String(),
                'updated_at' => $token?->updated_at?->toIso8601String(),
            ],
            'pending_sync' => [
                'purchases' => $pendingPurchases,
                'retail_sales' => $pendingRetailSales,
            ],
            'issues' => array_values(array_unique($issues)),
        ]);
    }

    public function retryRetailSalesSync(Request $request): \Illuminate\Http\JsonResponse
    {
        $limit = max(1, min((int) $request->query('limit', 200), 1000));

        $synced = app(QuickBooksRetailSaleSyncService::class)->retryRecentRetailSales($limit);

        return response()->json([
            'message' => 'Retail sales sync retry completed.',
            'synced_count' => $synced,
            'checked_limit' => $limit,
        ]);
    }

    // Step 2: Handle the Callback from QuickBooks
    public function handleCallback(Request $request)
    {
        if ($request->filled('error')) {
            Log::warning('QuickBooks OAuth callback returned error', [
                'error' => $request->query('error'),
                'error_description' => $request->query('error_description'),
                'state' => $request->query('state'),
            ]);

            $reason = (string) $request->query('error');
            $description = (string) $request->query('error_description');
            $query = http_build_query([
                'status' => 'error',
                'reason' => $reason ?: 'oauth_error',
                'description' => $description,
            ], '', '&', PHP_QUERY_RFC3986);

            return redirect(self::CALLBACK_REDIRECT_PATH . '?' . $query);
        }

        $state = (string) $request->query('state', '');
        $expectedState = (string) $request->session()->pull('quickbooks_oauth_state', '');

        if ($expectedState !== '') {
            if ($state === '' || ! hash_equals($expectedState, $state)) {
                Log::warning('QuickBooks OAuth state validation failed', [
                    'received_state_present' => $state !== '',
                    'expected_state_present' => true,
                ]);

                return redirect(self::CALLBACK_REDIRECT_PATH . '?status=error&reason=invalid_state');
            }
        } else {
            // Some SPA/API auth flows may not preserve the session used during connect step.
            // In that case, continue token exchange if code + realmId are present.
            Log::warning('QuickBooks OAuth callback received without session state; proceeding with token exchange.', [
                'received_state_present' => $state !== '',
            ]);
        }

        $code = $request->query('code');
        $realmId = $request->query('realmId');

        if (!$code || !$realmId) {
            return redirect(self::CALLBACK_REDIRECT_PATH . '?status=error&reason=auth_failed');
        }

        // Exchange Authorization Code for Access & Refresh Tokens
        $response = Http::asForm()
            ->withBasicAuth(
                config('services.quickbooks_test1.client_id'),
                config('services.quickbooks_test1.client_secret')
            )
            ->post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => config('services.quickbooks_test1.redirect_uri'),
            ]);

        if ($response->failed()) {
            Log::error('QuickBooks token exchange failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return redirect(self::CALLBACK_REDIRECT_PATH . '?status=error&reason=token_exchange_failed');
        }

        $data = $response->json();

        // Save tokens into your database matching this specific realmId
        QuickBooksToken::updateOrCreate(
            ['realm_id' => $realmId],
            [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'],
                'access_token_expires_at' => now()->addSeconds($data['expires_in']),
                'refresh_token_expires_at' => now()->addSeconds($data['x_refresh_token_expires_in']),
            ]
        );

        // Replay failed eligible purchase syncs now that QuickBooks is connected.
        app(QuickBooksPurchaseSyncService::class)->retryFailedEligiblePurchases();

        // Replay recent POS retail sales so missed sales are sent to QuickBooks income.
        app(QuickBooksRetailSaleSyncService::class)->retryRecentRetailSales();

        // Redirect to cartoon create section after QuickBooks callback completes.
        return redirect(self::CALLBACK_REDIRECT_PATH . '?status=success&realmId=' . urlencode((string) $realmId));
    }

    private function resolveConnectionStatus(bool $attemptRefresh): array
    {
        $token = QuickBooksToken::query()->latest('updated_at')->first();

        if (! $token) {
            return [
                'connected' => false,
                'realm_id' => null,
                'expires_at' => null,
                'refreshed' => false,
                'message' => 'QuickBooks is not connected.',
            ];
        }

        if ($token->access_token && $token->access_token_expires_at && $token->access_token_expires_at->greaterThan(now())) {
            return [
                'connected' => true,
                'realm_id' => (string) $token->realm_id,
                'expires_at' => $token->access_token_expires_at?->toIso8601String(),
                'refreshed' => false,
                'message' => null,
            ];
        }

        if (! $attemptRefresh) {
            return [
                'connected' => false,
                'realm_id' => (string) $token->realm_id,
                'expires_at' => $token->access_token_expires_at?->toIso8601String(),
                'refreshed' => false,
                'message' => 'QuickBooks access token has expired.',
            ];
        }

        if (! $token->refresh_token || ! $token->refresh_token_expires_at || $token->refresh_token_expires_at->lessThanOrEqualTo(now())) {
            return [
                'connected' => false,
                'realm_id' => (string) $token->realm_id,
                'expires_at' => $token->access_token_expires_at?->toIso8601String(),
                'refreshed' => false,
                'message' => 'QuickBooks refresh token is missing or expired. Reconnect is required.',
            ];
        }

        try {
            $this->refreshToken($token);

            return [
                'connected' => true,
                'realm_id' => (string) $token->realm_id,
                'expires_at' => $token->access_token_expires_at?->toIso8601String(),
                'refreshed' => true,
                'message' => 'QuickBooks token refreshed successfully.',
            ];
        } catch (\Throwable $e) {
            Log::error('QuickBooks token refresh during status check failed', [
                'realm_id' => $token->realm_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'connected' => false,
                'realm_id' => (string) $token->realm_id,
                'expires_at' => $token->access_token_expires_at?->toIso8601String(),
                'refreshed' => false,
                'message' => 'QuickBooks refresh failed: '.$e->getMessage(),
            ];
        }
    }

    private function refreshToken(QuickBooksToken $token): void
    {
        $response = Http::asForm()
            ->withBasicAuth(
                (string) config('services.quickbooks_test1.client_id'),
                (string) config('services.quickbooks_test1.client_secret')
            )
            ->post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $token->refresh_token,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Token refresh failed (HTTP '.$response->status().').');
        }

        $payload = $response->json();
        $accessToken = (string) ($payload['access_token'] ?? '');

        if ($accessToken === '') {
            throw new \RuntimeException('Token refresh response did not include access_token.');
        }

        $refreshToken = (string) ($payload['refresh_token'] ?? $token->refresh_token);
        $expiresIn = (int) ($payload['expires_in'] ?? 3600);
        $refreshExpiresIn = (int) ($payload['x_refresh_token_expires_in'] ?? 0);

        $token->update([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'access_token_expires_at' => now()->addSeconds(max(1, $expiresIn)),
            'refresh_token_expires_at' => $refreshExpiresIn > 0
                ? now()->addSeconds($refreshExpiresIn)
                : $token->refresh_token_expires_at,
        ]);

        $token->refresh();
    }
}
