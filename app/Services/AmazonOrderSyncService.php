<?php

namespace App\Services;

use App\Models\Product;
use App\Models\RemoteOrder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Syncs orders from the Amazon Selling Partner API (Orders v0) into the local `remote_orders`
 * table with order_from = 'amazon', in the same raw_payload.items shape used by every other
 * order source (see RemoteOrderSyncService::mapOrderPayload / RemoteOrderController::store).
 */
class AmazonOrderSyncService
{
    private const CURSOR_CACHE_KEY = 'amazon_sp_api_last_updated_after';

    private const NEXT_TOKEN_CACHE_KEY = 'amazon_sp_api_orders_next_token';

    // getOrderItems is rate-limited to ~0.5 req/sec by SP-API; stay well under that.
    private const ORDER_ITEMS_THROTTLE_SECONDS = 2.2;

    // Cap wall-clock time spent fetching order-item details in a single sync tick so the
    // (synchronous, frontend-triggered) request doesn't hang - remaining new orders are picked
    // up on the next auto-sync tick since the LastUpdatedAfter cursor only advances once the
    // whole page is processed.
    private const MAX_SECONDS_PER_RUN = 45;

    public function __construct(private AmazonSpApiService $api)
    {
    }

    public function syncRecent(int $limit = 50): array
    {
        if (! $this->api->isConfigured()) {
            return [
                'success' => true,
                'skipped' => true,
                'message' => 'Amazon SP-API credentials are not configured.',
                'synced_count' => 0,
                'latest_remote_id' => (int) (RemoteOrder::query()->where('order_from', 'amazon')->max('remote_id') ?? 0),
                'batch_requests' => 0,
            ];
        }

        $startedAt = microtime(true);
        $maxResultsPerPage = max(1, min(100, $limit));

        $nextToken = Cache::get(self::NEXT_TOKEN_CACHE_KEY);

        if ($nextToken) {
            $response = $this->api->getOrders(['NextToken' => $nextToken]);
        } else {
            $lastUpdatedAfter = Cache::get(self::CURSOR_CACHE_KEY);
            $createdOrUpdatedAfter = $lastUpdatedAfter ?: Carbon::now()->subDays(30)->toAtomString();

            $response = $this->api->getOrders([
                'LastUpdatedAfter' => $createdOrUpdatedAfter,
                'MaxResultsPerPage' => $maxResultsPerPage,
            ]);
        }

        $orders = (array) Arr::get($response, 'payload.Orders', []);
        $responseNextToken = Arr::get($response, 'payload.NextToken');

        $syncedCount = 0;
        $skippedItemFetch = 0;

        foreach ($orders as $amazonOrder) {
            if (! is_array($amazonOrder) || empty($amazonOrder['AmazonOrderId'])) {
                continue;
            }

            $amazonOrderId = (string) $amazonOrder['AmazonOrderId'];
            $existing = RemoteOrder::query()
                ->where('order_from', 'amazon')
                ->where('order_number', $amazonOrderId)
                ->first();

            $items = null;
            if (! $existing) {
                if ((microtime(true) - $startedAt) < self::MAX_SECONDS_PER_RUN) {
                    $items = $this->fetchOrderItems($amazonOrderId);
                    usleep((int) (self::ORDER_ITEMS_THROTTLE_SECONDS * 1_000_000));
                } else {
                    $skippedItemFetch++;
                    continue; // pick this order up on the next tick instead of saving it item-less
                }
            }

            $order = $this->upsertAmazonOrder($amazonOrder, $existing, $items);
            if ($order->wasRecentlyCreated) {
                $syncedCount++;
            }
        }

        if ($responseNextToken) {
            Cache::put(self::NEXT_TOKEN_CACHE_KEY, $responseNextToken, now()->addHours(6));
        } else {
            Cache::forget(self::NEXT_TOKEN_CACHE_KEY);
            // Only advance the cursor once a full page (no further NextToken) has been consumed.
            Cache::put(self::CURSOR_CACHE_KEY, Carbon::now()->subMinutes(2)->toAtomString(), now()->addDays(60));
        }

        return [
            'success' => true,
            'synced_count' => $syncedCount,
            'fetched_count' => count($orders),
            'skipped_pending_next_run' => $skippedItemFetch,
            'has_more' => (bool) $responseNextToken,
            'latest_remote_id' => (int) (RemoteOrder::query()->where('order_from', 'amazon')->max('remote_id') ?? 0),
            'batch_requests' => 1,
        ];
    }

    private function fetchOrderItems(string $amazonOrderId): array
    {
        $items = [];
        $nextToken = null;
        $pages = 0;

        do {
            $response = $this->api->getOrderItems($amazonOrderId, $nextToken);
            $items = array_merge($items, (array) Arr::get($response, 'payload.OrderItems', []));
            $nextToken = Arr::get($response, 'payload.NextToken');
            $pages++;

            if ($nextToken && $pages < 5) {
                usleep((int) (self::ORDER_ITEMS_THROTTLE_SECONDS * 1_000_000));
            }
        } while ($nextToken && $pages < 5);

        return $items;
    }

    private function upsertAmazonOrder(array $amazonOrder, ?RemoteOrder $existing, ?array $amazonItems): RemoteOrder
    {
        $amazonOrderId = (string) $amazonOrder['AmazonOrderId'];
        $shipping = (array) ($amazonOrder['ShippingAddress'] ?? []);
        $buyer = (array) ($amazonOrder['BuyerInfo'] ?? []);

        $fullName = trim((string) ($buyer['BuyerName'] ?? $shipping['Name'] ?? ''));
        $nameParts = $fullName !== '' ? preg_split('/\s+/', $fullName, 2) : ['', ''];
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $total = (float) Arr::get($amazonOrder, 'OrderTotal.Amount', 0);

        $items = $amazonItems !== null
            ? $this->mapItems($amazonItems)
            : (is_array($existing?->raw_payload['items'] ?? null) ? $existing->raw_payload['items'] : []);

        $rawPayload = [
            'order_number' => $amazonOrderId,
            'orders_from' => 'amazon',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => (string) ($buyer['BuyerEmail'] ?? ''),
            'phone' => (string) ($shipping['Phone'] ?? ''),
            'address_line_1' => (string) ($shipping['AddressLine1'] ?? ''),
            'address_line_2' => (string) ($shipping['AddressLine2'] ?? ''),
            'city' => (string) ($shipping['City'] ?? ''),
            'state' => (string) ($shipping['StateOrRegion'] ?? ''),
            'postal_code' => (string) ($shipping['PostalCode'] ?? ''),
            'country' => (string) ($shipping['CountryCode'] ?? ''),
            'notes' => '',
            'total' => $total,
            'items' => $items,
            'manually_created' => false,
            'amazon_order_status' => $amazonOrder['OrderStatus'] ?? null,
            'fulfillment_channel' => $amazonOrder['FulfillmentChannel'] ?? null,
            'purchase_date' => $amazonOrder['PurchaseDate'] ?? null,
            'last_update_date' => $amazonOrder['LastUpdateDate'] ?? null,
        ];

        $customerName = trim($firstName.' '.$lastName);

        if ($existing) {
            $rawPayload['id'] = $existing->remote_id;
            $rawPayload['status'] = $existing->raw_payload['status'] ?? $existing->status;

            // Preserve locally-managed booking data + local workflow status; Amazon's own
            // OrderStatus is kept separately as `amazon_order_status` instead of overwriting it.
            $existingRawPayload = is_array($existing->raw_payload) ? $existing->raw_payload : [];
            if (isset($existingRawPayload['veeqo_booking'])) {
                $rawPayload['veeqo_booking'] = $existingRawPayload['veeqo_booking'];
            }

            $existing->fill([
                'customer_name' => $customerName !== '' ? $customerName : $existing->customer_name,
                'total' => $total,
                'raw_payload' => $rawPayload,
            ]);

            if ($existing->isDirty()) {
                $existing->save();
            }

            return $existing;
        }

        $status = $this->mapInitialStatus((string) ($amazonOrder['OrderStatus'] ?? ''));
        $rawPayload['status'] = $status;

        $remoteId = ((int) RemoteOrder::query()->where('order_from', 'amazon')->lockForUpdate()->max('remote_id')) + 1;
        $rawPayload['id'] = $remoteId;

        return RemoteOrder::query()->create([
            'remote_id' => $remoteId,
            'order_number' => $amazonOrderId,
            'order_from' => 'amazon',
            'customer_name' => $customerName !== '' ? $customerName : 'Amazon Customer',
            'total' => $total,
            'status' => $status,
            'raw_payload' => $rawPayload,
        ]);
    }

    /**
     * @param array<int, array> $amazonItems raw OrderItems from getOrderItems
     */
    private function mapItems(array $amazonItems): array
    {
        $skus = array_values(array_filter(array_map(
            static fn (array $item) => trim((string) ($item['SellerSKU'] ?? '')),
            $amazonItems
        )));

        $productIdsBySku = $skus !== []
            ? Product::query()->whereIn('sku', $skus)->pluck('id', 'sku')
            : collect();

        return array_values(array_map(function (array $item, int $index) use ($productIdsBySku) {
            $sku = trim((string) ($item['SellerSKU'] ?? ''));
            $quantity = (int) ($item['QuantityOrdered'] ?? 1);
            $itemPrice = (float) Arr::get($item, 'ItemPrice.Amount', 0);

            return [
                'lineId' => $index + 1,
                'productId' => $sku !== '' ? ($productIdsBySku[$sku] ?? null) : null,
                'name' => (string) ($item['Title'] ?? 'Amazon Item'),
                'priceValue' => $quantity > 0 ? round($itemPrice / $quantity, 2) : $itemPrice,
                'quantity' => max(1, $quantity),
                'weight' => null,
                'image' => null,
                'selectedColor' => null,
                'selectedSize' => null,
                'sku' => $sku ?: null,
                'asin' => $item['ASIN'] ?? null,
            ];
        }, $amazonItems, array_keys($amazonItems)));
    }

    private function mapInitialStatus(string $amazonStatus): string
    {
        return match ($amazonStatus) {
            'Pending', 'PendingAvailability' => 'pending',
            'Unshipped', 'PartiallyShipped' => 'approved',
            'Shipped' => 'shipped',
            'Canceled' => 'canceled',
            'Unfulfillable' => 'canceled',
            default => Str::snake($amazonStatus ?: 'pending'),
        };
    }
}
