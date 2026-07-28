<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\QuickBooksToken;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuickBooksPurchaseSyncService
{
    public function retryFailedEligiblePurchases(int $limit = 25): int
    {
        $purchases = Purchase::query()
            ->with('brand')
            ->where(function ($query) {
                $query->where('quickbooks_sync_status', 'failed')
                    ->orWhere('quickbooks_sync_status', 'pending_connection')
                    ->orWhereNull('quickbooks_sync_status');
            })
            ->whereRaw('LOWER(status) IN (?, ?, ?, ?)', ['approve', 'approved', 'active', 'shipped'])
            ->orderByDesc('id')
            ->limit(max(1, $limit))
            ->get();

        $syncedCount = 0;

        foreach ($purchases as $purchase) {
            $this->syncApprovedPurchaseIfEligible($purchase);

            $purchase->refresh();
            if ((string) $purchase->quickbooks_sync_status === 'success') {
                $syncedCount++;
            }
        }

        return $syncedCount;
    }

    public function syncApprovedPurchaseIfEligible(Purchase $purchase): void
    {
        $purchase->loadMissing('brand');

        if (! $this->isApprovedStatus((string) $purchase->status)) {
            return;
        }

        if (! $this->isQuickBooksTargetBrand($purchase)) {
            return;
        }

        if ((string) ($purchase->quickbooks_sync_status ?? '') === 'success') {
            return;
        }

        $token = QuickBooksToken::query()->latest('updated_at')->first();
        if (! $token) {
            $this->markSyncPendingConnection($purchase, 'QuickBooks is not connected.');
            return;
        }

        try {
            $accessToken = $this->getValidAccessToken($token);
            $vendorId = $this->resolveVendorId($accessToken, (string) $token->realm_id, $purchase);
            $expenseAccountId = $this->resolveExpenseAccountId($accessToken, (string) $token->realm_id);
            $billResponse = $this->createBill($accessToken, (string) $token->realm_id, $purchase, $vendorId, $expenseAccountId);

            $txnId = (string) data_get($billResponse, 'Bill.Id', '');

            $purchase->forceFill([
                'quickbooks_sync_status' => 'success',
                'quickbooks_synced_at' => now(),
                'quickbooks_txn_id' => $txnId !== '' ? $txnId : null,
                'quickbooks_last_error' => null,
            ])->save();
        } catch (\Throwable $e) {
            if (stripos($e->getMessage(), 'Duplicate Document Number Error') !== false) {
                $purchase->forceFill([
                    'quickbooks_sync_status' => 'success',
                    'quickbooks_synced_at' => now(),
                    'quickbooks_last_error' => null,
                ])->save();

                return;
            }

            Log::error('QuickBooks purchase sync failed', [
                'purchase_id' => $purchase->id,
                'message' => $e->getMessage(),
            ]);

            $this->markSyncFailure($purchase, $e->getMessage());
        }
    }

    private function isQuickBooksTargetBrand(Purchase $purchase): bool
    {
        if ((int) ($purchase->brand_id ?? 0) === 2|| (int) ($purchase->brand_id ?? 0) === 3) {
            return true;
        }

        $brandName = strtolower(trim((string) ($purchase->brand?->name ?? '')));

        return in_array($brandName, ['1971', '1971co', '1971 co'], true);
    }

    private function isApprovedStatus(string $status): bool
    {
        return in_array(strtolower($status), ['approve', 'approved', 'active', 'shipped'], true);
    }

    private function markSyncFailure(Purchase $purchase, string $message): void
    {
        $purchase->forceFill([
            'quickbooks_sync_status' => 'failed',
            'quickbooks_last_error' => mb_substr($message, 0, 65535),
        ])->save();
    }

    private function markSyncPendingConnection(Purchase $purchase, string $message): void
    {
        $purchase->forceFill([
            'quickbooks_sync_status' => 'pending_connection',
            'quickbooks_last_error' => mb_substr($message, 0, 65535),
        ])->save();
    }

    private function getValidAccessToken(QuickBooksToken $token): string
    {
        $accessTokenExpiresAt = $token->access_token_expires_at;

        if ($accessTokenExpiresAt && $accessTokenExpiresAt->greaterThan(now()->addMinute())) {
            return (string) $token->access_token;
        }

        // Always refresh using the *current* refresh_token stored for this realm.
        // If the stored refresh_token is stale, Intuit returns invalid_grant.
        $response = Http::asForm()
            ->withBasicAuth(
                (string) config('services.quickbooks_test1.client_id'),
                (string) config('services.quickbooks_test1.client_secret')
            )
            ->post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', [
                'grant_type' => 'refresh_token',
                'refresh_token' => (string) $token->refresh_token,
            ]);

        if ($response->failed()) {
            $body = (string) $response->body();
            throw new \RuntimeException('QuickBooks token refresh failed: '.$body);
        }

        $data = (array) $response->json();

        $newAccessToken = (string) ($data['access_token'] ?? '');
        $newRefreshToken = (string) ($data['refresh_token'] ?? '');

        if ($newAccessToken === '' || $newRefreshToken === '') {
            throw new \RuntimeException('QuickBooks token refresh failed: missing access_token or refresh_token in response.');
        }

        $token->forceFill([
            'access_token' => $newAccessToken,
            // IMPORTANT: Intuit rotates refresh tokens. Persist the new one immediately.
            'refresh_token' => $newRefreshToken,
            'access_token_expires_at' => now()->addSeconds((int) ($data['expires_in'] ?? 0)),
            'refresh_token_expires_at' => now()->addSeconds((int) ($data['x_refresh_token_expires_in'] ?? 0)),
        ])->save();

        return $newAccessToken;
    }

    private function resolveVendorId(string $accessToken, string $realmId, Purchase $purchase): string
    {
        $brandName = trim((string) ($purchase->brand?->name ?? ''));
        $vendorName = $brandName !== '' ? $brandName : 'Inventory Supplier';

        $query = "select Id, DisplayName from Vendor where DisplayName = '".$this->escapeQuickBooksString($vendorName)."'";
        $vendorResult = $this->query($accessToken, $realmId, $query);

        $existingVendorId = (string) data_get($vendorResult, 'QueryResponse.Vendor.0.Id', '');
        if ($existingVendorId !== '') {
            return $existingVendorId;
        }

        $createResponse = $this->request(
            $accessToken,
            $realmId,
            'post',
            '/vendor',
            ['DisplayName' => $vendorName]
        );

        $vendorId = (string) data_get($createResponse, 'Vendor.Id', '');

        if ($vendorId === '') {
            throw new \RuntimeException('Unable to resolve QuickBooks vendor for purchase sync.');
        }

        return $vendorId;
    }

    private function resolveExpenseAccountId(string $accessToken, string $realmId): string
    {
        $query = "select Id, Name from Account where Classification = 'Expense' and Active = true";
        $result = $this->query($accessToken, $realmId, $query);
        $accountId = (string) data_get($result, 'QueryResponse.Account.0.Id', '');

        if ($accountId === '') {
            throw new \RuntimeException('No active Expense account found in QuickBooks.');
        }

        return $accountId;
    }

    private function createBill(string $accessToken, string $realmId, Purchase $purchase, string $vendorId, string $expenseAccountId): array
    {
        $totalAmount = max(0, (float) ($purchase->total_amount ?? 0));
        if ($totalAmount <= 0) {
            throw new \RuntimeException('Purchase total amount is zero; nothing to sync to QuickBooks.');
        }

        $lineDescription = $this->buildPurchaseDescription($purchase);

        $payload = [
            'VendorRef' => ['value' => $vendorId],
            'DocNumber' => (string) $purchase->po_number,
            'TxnDate' => now()->toDateString(),
            'PrivateNote' => 'Synced from Inventory Purchase #'.((string) $purchase->po_number),
            'Line' => [
                [
                    'Amount' => $totalAmount,
                    'Description' => $lineDescription,
                    'DetailType' => 'AccountBasedExpenseLineDetail',
                    'AccountBasedExpenseLineDetail' => [
                        'AccountRef' => ['value' => $expenseAccountId],
                    ],
                ],
            ],
        ];

        return $this->request($accessToken, $realmId, 'post', '/bill', $payload);
    }

    private function buildPurchaseDescription(Purchase $purchase): string
    {
        $items = is_array($purchase->products) ? $purchase->products : [];
        $parts = [];

        foreach ($items as $item) {
            $productId = (int) ($item['product_id'] ?? 0);
            $qty = (int) ($item['quantity'] ?? 0);
            if ($productId <= 0 || $qty <= 0) {
                continue;
            }

            $productName = (string) optional(Product::query()->find($productId))->name;
            $parts[] = $productName !== '' ? ($productName.' x'.$qty) : ('Product '.$productId.' x'.$qty);
        }

        if ($parts === []) {
            return 'Purchase Order #'.((string) $purchase->po_number);
        }

        return mb_substr(implode(', ', $parts), 0, 4000);
    }

    private function query(string $accessToken, string $realmId, string $query): array
    {
        return $this->request($accessToken, $realmId, 'get', '/query', [], ['query' => $query]);
    }

    private function request(
        string $accessToken,
        string $realmId,
        string $method,
        string $path,
        array $payload = [],
        array $query = []
    ): array {
        $url = rtrim($this->resolveApiBaseUrl(), '/').'/v3/company/'.$realmId.$path;
        $query = array_merge(['minorversion' => '73'], $query);

        $request = Http::withToken($accessToken)
            ->acceptJson()
            ->withHeaders([
                'Content-Type' => 'application/json',
            ]);

        $response = strtolower($method) === 'get'
            ? $request->get($url, $query)
            : $request->post($url.'?'.http_build_query($query), $payload);

        if ($response->successful()) {
            return (array) $response->json();
        }

        $status = $response->status();
        $jsonBody = $response->json();
        $body = is_array($jsonBody) ? $jsonBody : [];

        $message = (string) data_get($body, 'Fault.Error.0.Message', '');
        $detail = (string) data_get($body, 'Fault.Error.0.Detail', '');
        $raw = trim((string) $response->body());

        if ($message === '' && $detail === '') {
            $fallback = $raw !== '' ? mb_substr($raw, 0, 500) : 'QuickBooks request failed';
            $message = $fallback;
        }

        $trackingId = (string) ($response->header('intuit_tid') ?? $response->header('x-intuit-tid') ?? '');
        $errorMessage = trim($message.($detail !== '' ? ': '.$detail : ''));
        $errorMessage = 'QuickBooks request failed (HTTP '.$status.'): '.$errorMessage;
        if ($trackingId !== '') {
            $errorMessage .= ' [intuit_tid: '.$trackingId.']';
        }

        throw new \RuntimeException($errorMessage);
    }

    private function resolveApiBaseUrl(): string
    {
        $configured = trim((string) config('services.quickbooks_test1.api_base'));
        if ($configured !== '') {
            return $configured;
        }

        $environment = strtolower(trim((string) config('services.quickbooks_test1.environment', 'production')));

        if ($environment === 'sandbox') {
            return 'https://sandbox-quickbooks.api.intuit.com';
        }

        return 'https://quickbooks.api.intuit.com';
    }

    private function escapeQuickBooksString(string $value): string
    {
        return str_replace("'", "\\'", $value);
    }
}
