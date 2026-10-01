<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VeeqoService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected bool $verifySsl;

    public function __construct()
    {
        $this->apiKey = (string) config('services.veeqo.key');
        $this->baseUrl = rtrim((string) config('services.veeqo.url', 'https://api.veeqo.com'), '/');
        $this->verifySsl = (bool) config('services.veeqo.verify_ssl', true);
    }

    protected function client(): PendingRequest
    {
        return Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])
            ->withOptions(['verify' => $this->verifySsl])
            ->connectTimeout(5)
            ->timeout(10);
    }

    /**
     * POST with a couple of retries on transient Veeqo 5xx errors before giving up.
     */
    protected function postWithRetry(string $url, array $payload, int $attempts = 3): \Illuminate\Http\Client\Response
    {
        $response = $this->client()->post($url, $payload);

        for ($attempt = 2; $attempt <= $attempts && $response->serverError(); $attempt++) {
            Log::warning('Veeqo server error, retrying', [
                'url' => $url,
                'attempt' => $attempt,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            usleep(500000 * ($attempt - 1));
            $response = $this->client()->post($url, $payload);
        }

        return $response;
    }

    public function createOrder(array $orderPayload): array
    {
        Log::info('Veeqo create order payload', $orderPayload);

        $response = $this->postWithRetry("{$this->baseUrl}/orders", $orderPayload);

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [POST /orders, status {$response->status()}]: " . $response->body());
        }

        return (array) $response->json();
    }

    /**
     * Fetch a single order, e.g. to read its up-to-date "allocations" array after allocating it.
     */
    public function getOrder(int $orderId): array
    {
        $response = $this->client()->get("{$this->baseUrl}/orders/{$orderId}");

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [GET /orders/{$orderId}, status {$response->status()}]: " . $response->body());
        }

        return (array) $response->json();
    }

    public function getDeliveryMethods(): array
    {
        $response = $this->client()->get("{$this->baseUrl}/delivery_methods", ['page_size' => 100]);

        if ($response->failed()) {
            throw new Exception('Veeqo API Error: ' . $response->body());
        }

        return (array) $response->json();
    }

    public function getWarehouses(): array
    {
        $response = $this->client()->get("{$this->baseUrl}/warehouses", ['page_size' => 100]);

        if ($response->failed()) {
            throw new Exception('Veeqo API Error: ' . $response->body());
        }

        return (array) $response->json();
    }

    /**
     * Resolve the Veeqo warehouse ID whose address matches the ship-from origin
     * configured via VEEQO_ORIGIN_* env vars, so orders can be explicitly
     * allocated from it (this is what makes "Ship From" appear in Veeqo).
     */
    public function resolveOriginWarehouseId(): ?int
    {
        $city = trim((string) config('services.veeqo.origin.city'));
        $state = trim((string) config('services.veeqo.origin.state'));
        $zip = trim((string) config('services.veeqo.origin.zip'));

        if ($city === '' || $zip === '') {
            return null;
        }

        return Cache::remember('veeqo_origin_warehouse_id', now()->addHours(6), function () use ($city, $state, $zip) {
            foreach ($this->getWarehouses() as $warehouse) {
                $warehousePostCode = trim((string) ($warehouse['post_code'] ?? ''));
                $cityMatches = strcasecmp(trim((string) ($warehouse['city'] ?? '')), $city) === 0;
                $zipMatches = $warehousePostCode !== '' && str_starts_with($warehousePostCode, $zip);
                $stateMatches = $state === '' || strcasecmp(trim((string) ($warehouse['region'] ?? '')), $state) === 0;

                if ($cityMatches && $zipMatches && $stateMatches) {
                    return (int) $warehouse['id'];
                }
            }

            return null;
        });
    }

    /**
     * Explicitly allocate an order's line items to a warehouse, which is what
     * makes Veeqo populate the "Ship From" address on the order/shipment.
     */
    public function createAllocation(int $orderId, int $warehouseId, array $lineItems): array
    {
        $response = $this->postWithRetry("{$this->baseUrl}/orders/{$orderId}/allocations", [
            'allocation' => [
                'warehouse_id' => $warehouseId,
                'line_items_attributes' => array_map(
                    fn (array $item) => [
                        'sellable_id' => $item['sellable_id'],
                        'quantity' => $item['quantity'],
                    ],
                    $lineItems
                ),
            ],
        ]);

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [POST /orders/{$orderId}/allocations, status {$response->status()}]: " . $response->body());
        }

        return (array) $response->json();
    }

    public function createProduct(array $productPayload): array
    {
        $response = $this->postWithRetry("{$this->baseUrl}/products", $productPayload);

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [POST /products, status {$response->status()}]: " . $response->body());
        }

        return (array) $response->json();
    }

    /**
     * Cancel an order in Veeqo (PUT /orders/{id}/cancel per Veeqo's documented API).
     */
    public function cancelOrder(int $orderId, string $reason = 'Cancelled from inventory'): array
    {
        $response = $this->client()->put("{$this->baseUrl}/orders/{$orderId}/cancel", [
            'id' => $orderId,
            'send_veeqo_email' => false,
            'cancel_reason' => $reason,
        ]);

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [PUT /orders/{$orderId}/cancel, status {$response->status()}]: " . $response->body());
        }

        return $response->body() !== '' ? (array) $response->json() : [];
    }

    public function getChannels(): array
    {
        $response = $this->client()->get("{$this->baseUrl}/channels");

        if ($response->failed()) {
            throw new Exception('Veeqo API Error: ' . $response->body());
        }

        return (array) $response->json();
    }

    /**
     * Resolve a usable sales channel ID, preferring an active manual/"direct" channel
     * (e.g. Veeqo's built-in "Phone" channel) over storefront channels like Amazon.
     */
    public function resolveChannelId(): int
    {
        return Cache::remember('veeqo_channel_id', now()->addHours(6), function () {
            $channels = $this->getChannels();

            $direct = array_values(array_filter(
                $channels,
                fn (array $c) => ($c['type_code'] ?? '') === 'direct' && ($c['state'] ?? '') === 'active'
            ));
            if ($direct !== []) {
                return (int) $direct[0]['id'];
            }

            $active = array_values(array_filter($channels, fn (array $c) => ($c['state'] ?? '') === 'active'));
            if ($active !== []) {
                return (int) $active[0]['id'];
            }

            if ($channels === []) {
                throw new Exception('No sales channel is configured in Veeqo.');
            }

            return (int) $channels[0]['id'];
        });
    }

    /**
     * Find an existing Veeqo customer by email, or create a new one with a billing address.
     */
    public function findOrCreateCustomer(string $email, array $address): int
    {
        $email = trim($email);
        if ($email !== '') {
            $response = $this->client()->get("{$this->baseUrl}/customers", ['query' => $email]);
            if ($response->successful()) {
                foreach ((array) $response->json() as $customer) {
                    if (strcasecmp((string) ($customer['email'] ?? ''), $email) === 0) {
                        return (int) $customer['id'];
                    }
                }
            }
        }

        $response = $this->client()->post("{$this->baseUrl}/customers", [
            'customer' => [
                'email' => $email !== '' ? $email : 'retail-pos+' . uniqid() . '@example.com',
                'customer_type' => 'retail',
                'phone' => (string) ($address['phone'] ?? ''),
                'billing_address_attributes' => $address,
            ],
        ]);

        if ($response->failed()) {
            throw new Exception('Veeqo API Error: ' . $response->body());
        }

        return (int) $response->json('id');
    }

    /**
     * Resolve the Veeqo delivery method (carrier) ID by name, e.g. "UPS Ground",
     * creating it in Veeqo on the fly if it doesn't exist yet.
     */
    public function resolveDeliveryMethodId(string $name): int
    {
        $cacheKey = 'veeqo_delivery_method_id:' . strtolower($name);

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($name) {
            foreach ($this->getDeliveryMethods() as $method) {
                if (strcasecmp((string) ($method['name'] ?? ''), $name) === 0) {
                    return (int) $method['id'];
                }
            }

            $response = $this->client()->post("{$this->baseUrl}/delivery_methods", ['name' => $name]);

            if ($response->failed()) {
                throw new Exception("Veeqo delivery method \"{$name}\" was not found and could not be created: " . $response->body());
            }

            return (int) $response->json('id');
        });
    }

    /**
     * Find a Veeqo product variant (sellable) ID by matching its SKU code.
     */
    public function findSellableIdBySku(string $sku): ?int
    {
        $sku = trim($sku);
        if ($sku === '') {
            return null;
        }

        $cacheKey = 'veeqo_sellable_id:' . strtolower($sku);
        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return (int) $cached;
        }

        $response = $this->client()->get("{$this->baseUrl}/products", [
            'query' => $sku,
            'page_size' => 10,
        ]);

        if ($response->failed()) {
            throw new Exception('Veeqo API Error: ' . $response->body());
        }

        foreach ((array) $response->json() as $product) {
            foreach ((array) ($product['sellables'] ?? []) as $sellable) {
                if (strcasecmp((string) ($sellable['sku_code'] ?? ''), $sku) === 0) {
                    $sellableId = (int) $sellable['id'];
                    Cache::put($cacheKey, $sellableId, now()->addHours(6));

                    return $sellableId;
                }
            }
        }

        return null;
    }

    /**
     * Cache a sellable ID against a SKU, e.g. right after auto-creating it in Veeqo.
     */
    public function rememberSellableId(string $sku, int $sellableId): void
    {
        Cache::put('veeqo_sellable_id:' . strtolower(trim($sku)), $sellableId, now()->addHours(6));
    }

    /**
     * Get the available shipping rates/quotes for an allocation (GET /shipping/rates/{allocation_id}).
     */
    public function getShippingRates(int $allocationId): array
    {
        $response = $this->client()->get(
            "{$this->baseUrl}/shipping/rates/{$allocationId}",
            ['from_allocation_package' => 'true']
        );

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [GET /shipping/rates/{$allocationId}, status {$response->status()}]: " . $response->body());
        }

        return (array) $response->json();
    }

    /**
     * Purchase a shipping label for an allocation (POST /shipping/shipments).
     */
    public function purchaseShippingLabel(array $payload): array
    {
        Log::info('Veeqo purchase label payload', $payload);

        $response = $this->postWithRetry("{$this->baseUrl}/shipping/shipments", $payload);

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [POST /shipping/shipments, status {$response->status()}]: " . $response->body());
        }

        return (array) $response->json();
    }

    /**
     * Download the printable shipping label file for one or more purchased shipments
     * (GET /shipping/labels.{format}?shipment_ids[]=...), per Veeqo's "Retrieve Shipping
     * Labels" API. Returns the raw file bytes plus its content type.
     */
    public function getShippingLabel(array $shipmentIds, string $format = 'png'): array
    {
        $format = strtolower(trim($format, '. '));
        $accept = match ($format) {
            'pdf' => 'application/pdf',
            'jpeg', 'jpg' => 'image/jpeg',
            'zpl' => 'application/zpl',
            default => 'image/png',
        };

        $query = implode('&', array_map(
            fn ($id) => 'shipment_ids[]=' . urlencode((string) $id),
            $shipmentIds
        ));

        $response = Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'Accept' => $accept,
        ])
            ->withOptions(['verify' => $this->verifySsl])
            ->connectTimeout(5)
            ->timeout(20)
            ->get("{$this->baseUrl}/shipping/labels.{$format}?{$query}");

        if ($response->failed()) {
            throw new Exception("Veeqo API Error [GET /shipping/labels.{$format}, status {$response->status()}]: " . $response->body());
        }

        return [
            'content' => $response->body(),
            'content_type' => $response->header('Content-Type') ?: $accept,
        ];
    }
}