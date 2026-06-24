<?php

namespace App\Services;

use App\Models\QuickBooksToken;
use App\Models\RetailSale;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuickBooksRetailSaleSyncService
{
    public function retryRecentRetailSales(int $limit = 200): int
    {
        $sales = RetailSale::query()
            ->where(function ($query) {
                $query->where('quickbooks_sync_status', 'failed')
                    ->orWhere('quickbooks_sync_status', 'pending_connection')
                    ->orWhereNull('quickbooks_sync_status');
            })
            ->orderByDesc('id')
            ->limit(max(1, $limit))
            ->get();

        $syncedCount = 0;

        foreach ($sales as $sale) {
            if ($this->syncRetailSaleAsIncome($sale)) {
                $syncedCount++;
            }
        }

        return $syncedCount;
    }

    public function syncRetailSaleAsIncome(RetailSale $sale): bool
    {
        $sale->loadMissing(['brand:id,name', 'warehouse:id,name', 'seller:id,name']);

        $totalAmount = max(0, (float) ($sale->total_amount ?? 0));
        if ($totalAmount <= 0) {
            $this->markSyncFailure($sale, 'Retail sale total amount is zero; nothing to sync to QuickBooks.');
            return false;
        }

        $token = QuickBooksToken::query()->latest('updated_at')->first();
        if (! $token) {
            $this->markSyncPendingConnection($sale, 'QuickBooks is not connected.');

            Log::warning('QuickBooks retail sale sync skipped: no QuickBooks connection', [
                'retail_sale_id' => $sale->id,
                'reference_number' => $sale->reference_number,
            ]);

            return false;
        }

        try {
            $accessToken = $this->getValidAccessToken($token);
            $realmId = (string) $token->realm_id;

            $customerId = $this->resolveCustomerId($accessToken, $realmId, $sale);
            $incomeAccountId = $this->resolveIncomeAccountId($accessToken, $realmId);
            $serviceItemId = $this->resolveServiceItemId($accessToken, $realmId, $incomeAccountId);

            $response = $this->createSalesReceipt(
                $accessToken,
                $realmId,
                $sale,
                $customerId,
                $serviceItemId,
                $totalAmount
            );

            Log::info('QuickBooks retail sale sync success', [
                'retail_sale_id' => $sale->id,
                'reference_number' => $sale->reference_number,
                'quickbooks_sales_receipt_id' => (string) data_get($response, 'SalesReceipt.Id', ''),
            ]);

            $this->markSyncSuccess($sale, (string) data_get($response, 'SalesReceipt.Id', ''));

            return true;
        } catch (\Throwable $e) {
            // Duplicate document number means the transaction is already present in QuickBooks.
            if (stripos($e->getMessage(), 'Duplicate Document Number Error') !== false) {
                try {
                    $accessToken = $this->getValidAccessToken($token);
                    $realmId = (string) $token->realm_id;
                    $customerId = $this->resolveCustomerId($accessToken, $realmId, $sale);

                    $existingId = $this->updateExistingSalesReceiptCustomerByDocNumber(
                        $accessToken,
                        $realmId,
                        (string) $sale->reference_number,
                        $customerId
                    );

                    $this->markSyncSuccess($sale, $existingId);
                } catch (\Throwable $updateError) {
                    $this->markSyncFailure($sale, $updateError->getMessage());

                    Log::error('QuickBooks retail sale duplicate update failed', [
                        'retail_sale_id' => $sale->id,
                        'reference_number' => $sale->reference_number,
                        'message' => $updateError->getMessage(),
                    ]);

                    return false;
                }

                Log::info('QuickBooks retail sale sync skipped: duplicate DocNumber', [
                    'retail_sale_id' => $sale->id,
                    'reference_number' => $sale->reference_number,
                ]);

                return true;
            }

            if ($this->isConnectionFailure($e->getMessage())) {
                $this->markSyncPendingConnection($sale, $e->getMessage());

                Log::warning('QuickBooks retail sale sync pending connection', [
                    'retail_sale_id' => $sale->id,
                    'reference_number' => $sale->reference_number,
                    'message' => $e->getMessage(),
                ]);

                return false;
            }

            Log::error('QuickBooks retail sale sync failed', [
                'retail_sale_id' => $sale->id,
                'reference_number' => $sale->reference_number,
                'message' => $e->getMessage(),
            ]);

            $this->markSyncFailure($sale, $e->getMessage());

            return false;
        }
    }

    private function markSyncSuccess(RetailSale $sale, ?string $txnId = null): void
    {
        $sale->forceFill([
            'quickbooks_sync_status' => 'success',
            'quickbooks_synced_at' => now(),
            'quickbooks_txn_id' => $txnId !== '' ? $txnId : null,
            'quickbooks_last_error' => null,
        ])->save();
    }

    private function markSyncFailure(RetailSale $sale, string $message): void
    {
        $sale->forceFill([
            'quickbooks_sync_status' => 'failed',
            'quickbooks_last_error' => mb_substr($message, 0, 65535),
        ])->save();
    }

    private function markSyncPendingConnection(RetailSale $sale, string $message): void
    {
        $sale->forceFill([
            'quickbooks_sync_status' => 'pending_connection',
            'quickbooks_last_error' => mb_substr($message, 0, 65535),
        ])->save();
    }

    private function resolveCustomerId(string $accessToken, string $realmId, RetailSale $sale): string
    {
        $brandName = trim((string) ($sale->brand?->name ?? ''));
        $preferredName = $brandName !== '' ? $brandName : 'Walk-in Customer';

        // Keep brand as customer display name where possible; fallback names avoid
        // QuickBooks global NameList conflicts (e.g., same name already used by Vendor).
        $candidateNames = array_values(array_unique(array_filter([
            $preferredName,
            $brandName !== '' ? $brandName.' Customer' : null,
            $brandName !== '' ? $brandName.' Retail Customer' : null,
        ])));

        foreach ($candidateNames as $candidateName) {
            $customerId = $this->findCustomerIdByDisplayName($accessToken, $realmId, $candidateName);
            if ($customerId !== '') {
                return $customerId;
            }

            try {
                $createResponse = $this->request(
                    $accessToken,
                    $realmId,
                    'post',
                    '/customer',
                    ['DisplayName' => mb_substr($candidateName, 0, 100)]
                );

                $customerId = (string) data_get($createResponse, 'Customer.Id', '');
                if ($customerId !== '') {
                    return $customerId;
                }
            } catch (\Throwable $e) {
                $message = $e->getMessage();

                // Continue trying alternate names if QuickBooks rejects duplicate NameList.
                if (stripos($message, 'Duplicate Name Exists Error') !== false || stripos($message, 'name supplied already exists') !== false) {
                    continue;
                }

                throw $e;
            }
        }

        throw new \RuntimeException('Unable to resolve QuickBooks customer for retail sale sync.');
    }

    private function findCustomerIdByDisplayName(string $accessToken, string $realmId, string $displayName): string
    {
        $query = "select Id, DisplayName from Customer where DisplayName = '".$this->escapeQuickBooksString($displayName)."'";
        $result = $this->query($accessToken, $realmId, $query);

        return (string) data_get($result, 'QueryResponse.Customer.0.Id', '');
    }

    private function resolveIncomeAccountId(string $accessToken, string $realmId): string
    {
        $query = "select Id, Name from Account where Classification = 'Revenue' and Active = true";
        $result = $this->query($accessToken, $realmId, $query);
        $accountId = (string) data_get($result, 'QueryResponse.Account.0.Id', '');

        if ($accountId === '') {
            throw new \RuntimeException('No active Revenue account found in QuickBooks.');
        }

        return $accountId;
    }

    private function resolveServiceItemId(string $accessToken, string $realmId, string $incomeAccountId): string
    {
        $itemName = 'POS Retail Sale';

        $query = "select Id, Name, Type from Item where Name = '".$this->escapeQuickBooksString($itemName)."'";
        $result = $this->query($accessToken, $realmId, $query);
        $itemId = (string) data_get($result, 'QueryResponse.Item.0.Id', '');

        if ($itemId !== '') {
            return $itemId;
        }

        $createResponse = $this->request($accessToken, $realmId, 'post', '/item', [
            'Name' => $itemName,
            'Type' => 'Service',
            'IncomeAccountRef' => ['value' => $incomeAccountId],
        ]);

        $itemId = (string) data_get($createResponse, 'Item.Id', '');
        if ($itemId === '') {
            throw new \RuntimeException('Unable to resolve QuickBooks item for retail sale sync.');
        }

        return $itemId;
    }

    private function createSalesReceipt(
        string $accessToken,
        string $realmId,
        RetailSale $sale,
        string $customerId,
        string $serviceItemId,
        float $totalAmount
    ): array {
        $description = $this->buildSaleDescription($sale);

        $payload = [
            'DocNumber' => (string) $sale->reference_number,
            'TxnDate' => ($sale->created_at ?? now())->toDateString(),
            'CustomerRef' => ['value' => $customerId],
            'PrivateNote' => mb_substr(
                'POS Retail Sale #'.((string) $sale->reference_number)
                .' | Warehouse: '.((string) ($sale->warehouse?->name ?? $sale->warehouse_id))
                .' | Brand: '.((string) ($sale->brand?->name ?? 'N/A'))
                .' | Payment: '.((string) ($sale->payment_method ?? 'N/A')),
                0,
                4000
            ),
            'Line' => [
                [
                    'Amount' => round($totalAmount, 2),
                    'Description' => $description,
                    'DetailType' => 'SalesItemLineDetail',
                    'SalesItemLineDetail' => [
                        'ItemRef' => ['value' => $serviceItemId],
                        'Qty' => 1,
                        'UnitPrice' => round($totalAmount, 2),
                    ],
                ],
            ],
        ];

        return $this->request($accessToken, $realmId, 'post', '/salesreceipt', $payload);
    }

    private function updateExistingSalesReceiptCustomerByDocNumber(
        string $accessToken,
        string $realmId,
        string $docNumber,
        string $customerId
    ): ?string {
        $query = "select Id, SyncToken from SalesReceipt where DocNumber = '".$this->escapeQuickBooksString($docNumber)."'";
        $result = $this->query($accessToken, $realmId, $query);

        $salesReceipt = data_get($result, 'QueryResponse.SalesReceipt.0');
        if (! is_array($salesReceipt)) {
            return null;
        }

        $id = (string) ($salesReceipt['Id'] ?? '');
        $syncToken = (string) ($salesReceipt['SyncToken'] ?? '');

        if ($id === '' || $syncToken === '') {
            return null;
        }

        $payload = [
            'sparse' => true,
            'Id' => $id,
            'SyncToken' => $syncToken,
            'CustomerRef' => ['value' => $customerId],
        ];

        $this->request($accessToken, $realmId, 'post', '/salesreceipt', $payload, ['operation' => 'update']);

        return $id;
    }

    private function buildSaleDescription(RetailSale $sale): string
    {
        $items = is_array($sale->items) ? $sale->items : [];
        $parts = [];

        foreach ($items as $item) {
            $name = trim((string) ($item['product_name'] ?? ''));
            $qty = (int) ($item['quantity'] ?? 0);

            if ($qty <= 0) {
                continue;
            }

            $parts[] = ($name !== '' ? $name : 'Item').' x'.$qty;
        }

        if ($parts === []) {
            return 'Retail Sale #'.((string) $sale->reference_number);
        }

        return mb_substr(implode(', ', $parts), 0, 4000);
    }

    private function getValidAccessToken(QuickBooksToken $token): string
    {
        $accessTokenExpiresAt = $token->access_token_expires_at;

        if ($accessTokenExpiresAt && $accessTokenExpiresAt->greaterThan(now()->addMinute())) {
            return (string) $token->access_token;
        }

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
            throw new \RuntimeException('QuickBooks token refresh failed: '.$response->body());
        }

        $data = $response->json();

        $token->forceFill([
            'access_token' => (string) ($data['access_token'] ?? ''),
            'refresh_token' => (string) ($data['refresh_token'] ?? $token->refresh_token),
            'access_token_expires_at' => now()->addSeconds((int) ($data['expires_in'] ?? 0)),
            'refresh_token_expires_at' => now()->addSeconds((int) ($data['x_refresh_token_expires_in'] ?? 0)),
        ])->save();

        return (string) $token->access_token;
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

    private function isConnectionFailure(string $message): bool
    {
        $normalized = strtolower($message);

        return str_contains($normalized, 'quickbooks token refresh failed')
            || str_contains($normalized, 'invalid_grant')
            || str_contains($normalized, 'authenticationfailed')
            || str_contains($normalized, 'unauthorized')
            || str_contains($normalized, 'http 401');
    }
}
