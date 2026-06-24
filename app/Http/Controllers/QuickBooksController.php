<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\QuickBooksToken;
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
        $token = QuickBooksToken::query()->latest('updated_at')->first();

        $isConnected = $token
            && $token->access_token
            && $token->access_token_expires_at
            && $token->access_token_expires_at->greaterThan(now());

        return response()->json([
            'connected' => (bool) $isConnected,
            'realm_id' => $isConnected ? (string) $token->realm_id : null,
            'expires_at' => $isConnected ? $token->access_token_expires_at?->toIso8601String() : null,
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
}
