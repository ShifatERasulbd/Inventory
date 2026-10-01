<?php

namespace App\Services;

use App\Models\RemoteOrder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RemoteOrderSyncService
{
    /**
     * Each entry describes one upstream store to sync orders from. 'order_from_values' scopes
     * the local max(remote_id) lookup (since remote_id is only unique within a single store's
     * own id sequence), and 'forced_order_from' overrides the source tag for stores that don't
     * send an "orders_from" field of their own (e.g. the standalone 1971co store).
     */
    private function stores(): array
    {
        return [
            'viveren' => [
                'config_key' => 'main_store',
                'order_from_values' => ['website', 'joor'],
                'forced_order_from' => null,
            ],
            '1971co' => [
                'config_key' => 'store_1971co',
                'order_from_values' => ['1971co'],
                'forced_order_from' => '1971co',
            ],
        ];
    }

    private function configFor(string $configKey): array
    {
        return (array) config('services.'.$configKey);
    }

    /**
     * Resolve which store's config to use for a given locally-stored order's "order_from" tag.
     */
    private function configForOrderFrom(string $orderFrom): array
    {
        foreach ($this->stores() as $storeDef) {
            if (in_array($orderFrom, $storeDef['order_from_values'], true)) {
                return $this->configFor($storeDef['config_key']);
            }
        }

        return $this->configFor('main_store');
    }

    public function saveOrderPayload(array $order, ?string $forcedOrderFrom = null): ?RemoteOrder
    {
        $remoteId = (int) ($order['id'] ?? 0);
        if ($remoteId <= 0) {
            return null;
        }

        $orderFrom = $forcedOrderFrom ?? $this->normalizeOrderSource($order['orders_from'] ?? null);

        $existing = RemoteOrder::query()
            ->where('remote_id', $remoteId)
            ->where('order_from', $orderFrom)
            ->first();
        $payload = $this->mapOrderPayload($order, $remoteId, $orderFrom);

        if ($existing) {
            // Preserve locally-managed booking data; it's never sent to or stored by the main store.
            $existingRawPayload = is_array($existing->raw_payload) ? $existing->raw_payload : [];
            if (isset($existingRawPayload['veeqo_booking'])) {
                $payload['raw_payload']['veeqo_booking'] = $existingRawPayload['veeqo_booking'];
            }

            $existing->fill($payload);
            if ($existing->isDirty()) {
                $existing->save();
            }

            return $existing;
        }

        return RemoteOrder::query()->create($payload);
    }

    private function mapOrderPayload(array $order, int $remoteId, string $orderFrom): array
    {
        return [
            'remote_id' => $remoteId,
            'order_number' => (string) ($order['order_number'] ?? ''),
            'order_from' => $orderFrom,
            'customer_name' => trim(
                Str::of((string) ($order['first_name'] ?? ''))
                    ->append(' ')
                    ->append((string) ($order['last_name'] ?? ''))
                    ->value()
            ),
            'stripe_payment_id' => $order['stripe_payment_id'] ?? null,
            'total' => (float) ($order['total'] ?? 0),
            'state_tax' => $this->extractAmount($order, ['state_tax', 'stateTax', 'tax']),
            'stripe_charge' => $this->extractAmount($order, ['stripe_charge', 'stripeCharge', 'stripe_chartge']),
            'delivery_cost' => $this->extractAmount($order, ['delivery_cost', 'deliveryCost', 'shipping_cost', 'shippingCost']),
            'processing_fee' => $this->extractAmount($order, ['processing_fee', 'processingFee']),
            'status' => (string) ($order['status'] ?? 'pending'),
            'raw_payload' => $order,
        ];
    }

    /**
     * Normalize the main store's "orders_from" value to one of the sources the
     * Inventory sidebar splits orders into: 'website' (viveren) or 'joor'.
     */
    private function normalizeOrderSource(?string $source): string
    {
        $normalized = strtolower(trim((string) $source));

        return $normalized === 'joor' ? 'joor' : 'website';
    }

    private function extractAmount(array $order, array $keys): float
    {
        foreach ($keys as $key) {
            if (! array_key_exists($key, $order)) {
                continue;
            }

            $value = $order[$key];

            if (is_numeric($value)) {
                return (float) $value;
            }

            if (is_string($value)) {
                $sanitized = preg_replace('/[^0-9.\-]/', '', $value);
                if ($sanitized !== '' && is_numeric($sanitized)) {
                    return (float) $sanitized;
                }
            }
        }

        return 0.0;
    }

    private function storeRequest(array $config, string $method, string $path, array $query = [], array $json = [])
    {
        $baseUrl = trim((string) ($config['url'] ?? ''));
        $apiKey = trim((string) ($config['api_key'] ?? ''));
        $token = trim((string) ($config['token'] ?? ''));

        if ($baseUrl === '') {
            throw new \RuntimeException('Store API URL is not configured.');
        }

        if ($apiKey === '' && $token === '') {
            throw new \RuntimeException('Either the store API key or API token must be configured.');
        }

        // Keep scheme separator (http://) intact while collapsing accidental duplicate slashes.
        $baseUrl = (string) preg_replace('#(?<!:)/{2,}#', '/', $baseUrl);
        $baseUrl = rtrim($baseUrl, '/');
        $normalizedPath = '/'.ltrim($path, '/');
        $url = $baseUrl.$normalizedPath;

        try {
            return Http::acceptJson()
                ->connectTimeout(5)
                ->timeout(8)
                ->retry(1, 200)
                ->when($apiKey !== '', fn ($request) => $request->withHeaders(['X-API-Key' => $apiKey]))
                ->when($apiKey === '' && $token !== '', fn ($request) => $request->withToken($token))
                ->send($method, $url, $json !== [] ? ['json' => $json] : ['query' => $query]);
        } catch (ConnectionException $e) {
            throw new \RuntimeException("Unable to connect to store API at {$baseUrl}. Check the URL and server accessibility.");
        }
    }

    /**
     * Push a status change to the order's source store (e.g. approved -> processing).
     */
    public function pushStatusUpdate(int $remoteOrderId, string $status, string $orderFrom = 'website'): void
    {
        $config = $this->configForOrderFrom($orderFrom);
        $response = $this->storeRequest($config, 'PUT', '/orders-feed/'.$remoteOrderId.'/status', [], ['status' => $status]);

        if ($response->failed()) {
            $this->throwMainStoreFailure($response);
        }
    }

    /**
     * Translate an Inventory-side status into the vocabulary the origin store's
     * orders-feed status endpoint accepts (pending, approved, processing, shipped,
     * delivered, cancelled, refunded).
     */
    public function mapStatusForStore(string $localStatus): string
    {
        $normalized = strtolower(trim($localStatus));

        return match ($normalized) {
            'waiting for shipment', 'waiting-for-shipment' => 'approved',
            'ready for shipment', 'ready-for-shipment' => 'processing',
            'canceled' => 'cancelled',
            '' => 'pending',
            default => $normalized,
        };
    }

    private function throwMainStoreFailure($response): never
    {
        $payload = $response->json();
        $message = (string) ($payload['message'] ?? 'Store request failed.');

        throw new \RuntimeException(
            'Store request failed with status '.$response->status().': '.$message
        );
    }

    /**
     * Sync recent orders from every configured store (viveren + the standalone 1971co store).
     * Each store keeps its own remote_id cursor since the two stores have independent id sequences.
     */
    public function syncRecent(?int $sinceId = null, int $limit = 100): array
    {
        $synced = 0;
        $maxRemoteId = 0;
        $batchRequests = 0;
        $perStore = [];

        foreach ($this->stores() as $storeKey => $storeDef) {
            $config = $this->configFor($storeDef['config_key']);

            if (trim((string) ($config['url'] ?? '')) === '') {
                // Store not configured; skip it instead of failing the whole sync.
                continue;
            }

            $result = $this->syncStoreRecent($config, $storeDef, $sinceId, $limit);

            $synced += $result['synced_count'];
            $maxRemoteId = max($maxRemoteId, $result['latest_remote_id']);
            $batchRequests += $result['batch_requests'];
            $perStore[$storeKey] = $result;
        }

        return [
            'success' => true,
            'requested_since_id' => $sinceId,
            'latest_remote_id' => $maxRemoteId,
            'synced_count' => $synced,
            'batch_requests' => $batchRequests,
            'stores' => $perStore,
        ];
    }

    private function syncStoreRecent(array $config, array $storeDef, ?int $sinceId, int $limit): array
    {
        $startFromId = $sinceId;
        if ($startFromId === null) {
            $startFromId = (int) (RemoteOrder::query()
                ->whereIn('order_from', $storeDef['order_from_values'])
                ->max('remote_id') ?? 0);
        }

        $perPage = max(1, min(200, (int) $limit));
        $cursorSinceId = max(0, (int) $startFromId);

        $synced = 0;
        $maxRemoteId = (int) $startFromId;
        $batchRequests = 0;
        $maxBatchRequests = 1000;

        while ($batchRequests < $maxBatchRequests) {
            $response = $this->storeRequest($config, 'GET', '/orders-feed', [
                'since_id' => $cursorSinceId,
                'per_page' => $perPage,
            ]);

            if ($response->failed()) {
                $this->throwMainStoreFailure($response);
            }

            $payload = $response->json();
            $orders = Arr::get($payload, 'orders', []);

            if (! is_array($orders) || $orders === []) {
                break;
            }

            $batchRequests++;
            $batchCount = 0;
            $batchMaxRemoteId = $cursorSinceId;

            foreach ($orders as $order) {
                if (! is_array($order)) {
                    continue;
                }

                $remoteId = (int) ($order['id'] ?? 0);
                if ($remoteId <= 0) {
                    continue;
                }

                $savedOrder = $this->saveOrderPayload($order, $storeDef['forced_order_from']);
                if ($savedOrder && $savedOrder->wasRecentlyCreated) {
                    $synced++;
                }
                $batchCount++;
                $maxRemoteId = max($maxRemoteId, $remoteId);
                $batchMaxRemoteId = max($batchMaxRemoteId, $remoteId);
            }

            // Stop if API returned malformed IDs or if no valid order was processed.
            if ($batchCount === 0 || $batchMaxRemoteId <= $cursorSinceId) {
                break;
            }

            $cursorSinceId = $batchMaxRemoteId;

            // Last page reached.
            if ($batchCount < $perPage) {
                break;
            }
        }

        return [
            'success' => true,
            'requested_since_id' => (int) $startFromId,
            'latest_remote_id' => (int) $maxRemoteId,
            'synced_count' => $synced,
            'batch_requests' => $batchRequests,
        ];
    }

    /**
     * Fetch a single order by id, trying each configured store since a bare id doesn't
     * indicate which store it came from.
     */
    public function syncSingle(int $remoteOrderId): ?RemoteOrder
    {
        if ($remoteOrderId <= 0) {
            throw new \InvalidArgumentException('Remote order id must be a positive integer.');
        }

        foreach ($this->stores() as $storeDef) {
            $config = $this->configFor($storeDef['config_key']);

            if (trim((string) ($config['url'] ?? '')) === '') {
                continue;
            }

            $response = $this->storeRequest($config, 'GET', '/orders-feed/'.$remoteOrderId);

            if ($response->status() === 404) {
                $response = $this->storeRequest($config, 'GET', '/orders/'.$remoteOrderId);
            }

            if ($response->status() === 404 || $response->failed()) {
                continue;
            }

            $order = Arr::get($response->json(), 'order');
            if (! is_array($order) || (int) ($order['id'] ?? 0) <= 0) {
                continue;
            }

            return $this->saveOrderPayload($order, $storeDef['forced_order_from']);
        }

        return null;
    }
}