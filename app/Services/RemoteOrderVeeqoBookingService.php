<?php

namespace App\Services;

use App\Exceptions\RemoteOrderBookingException;
use App\Models\Product;
use App\Models\RemoteOrder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class RemoteOrderVeeqoBookingService
{
    private const CARRIER = 'UPS Ground';

    private const DELIVERY_METHOD_NAME = 'Default delivery method';

    public function __construct(private VeeqoService $veeqo)
    {
    }

    /**
     * Book the given remote order with Veeqo, always using the UPS Ground carrier.
     */
    public function book(RemoteOrder $order): array
    {
        $raw = is_array($order->raw_payload) ? $order->raw_payload : [];

        if (strtolower((string) $order->order_from) === 'amazon') {
            return $this->bookExistingAmazonOrder($order, $raw);
        }

        $firstName = trim((string) ($raw['first_name'] ?? ''));
        $lastName = trim((string) ($raw['last_name'] ?? ''));
        if ($firstName === '' && $lastName === '') {
            [$firstName, $lastName] = $this->splitCustomerName((string) ($order->customer_name ?? ''));
        }

        $address1 = trim((string) ($raw['address_line_1'] ?? ''));
        if ($address1 === '') {
            throw new RemoteOrderBookingException('Cannot book with Veeqo: shipping address is missing on this order.');
        }

        $items = is_array($raw['items'] ?? null) ? $raw['items'] : [];
        if ($items === []) {
            throw new RemoteOrderBookingException('Cannot book with Veeqo: this order has no line items.');
        }

        $address = [
            'first_name' => $firstName !== '' ? $firstName : 'Customer',
            'last_name' => $lastName,
            'address1' => $address1,
            'address2' => (string) ($raw['address_line_2'] ?? ''),
            'city' => (string) ($raw['city'] ?? ''),
            'state' => (string) ($raw['state'] ?? ''),
            'zip' => (string) ($raw['postal_code'] ?? ''),
            'country' => (string) ($raw['country'] ?? 'US'),
            'phone' => (string) ($raw['phone'] ?? ''),
        ];

        $lineItems = array_map(fn (array $item) => $this->buildLineItem($item), $items);

        // Reuse the order already created in Veeqo from a prior attempt instead of creating a duplicate
        // if only the allocation step failed last time.
        $existingVeeqoOrderId = (int) ($raw['veeqo_booking']['veeqo_order_id'] ?? 0);

        if ($existingVeeqoOrderId > 0) {
            $response = ['id' => $existingVeeqoOrderId];
            $deliveryMethodId = $raw['veeqo_booking']['delivery_method_id'] ?? null;
        } else {
            $deliveryMethodId = $this->veeqo->resolveDeliveryMethodId(self::DELIVERY_METHOD_NAME);
            $channelId = $this->veeqo->resolveChannelId();
            $customerId = $this->veeqo->findOrCreateCustomer((string) ($raw['email'] ?? ''), $address);

            $payload = [
                'order' => [
                    'channel_id' => $channelId,
                    'customer_id' => $customerId,
                    'number' => (string) ($order->order_number ?: $order->remote_id),
                    'delivery_method_id' => $deliveryMethodId,
                    'due_date' => Carbon::now()->format('d/m/Y'),
                    'deliver_to_attributes' => array_merge($address, [
                        'customer_id' => $customerId,
                        'email' => (string) ($raw['email'] ?? ''),
                    ]),
                    'line_items_attributes' => $lineItems,
                ],
            ];

            $response = $this->veeqo->createOrder($payload);

            // Persist the Veeqo order id right away so a retry (if allocation fails below) won't create a duplicate order.
            $raw['veeqo_booking'] = [
                'veeqo_order_id' => $response['id'] ?? null,
                'veeqo_customer_id' => $customerId,
                'carrier' => self::CARRIER,
                'delivery_method_id' => $deliveryMethodId,
                'booked_at' => Carbon::now()->toIso8601String(),
            ];
            $order->raw_payload = $raw;
            $order->save();
        }

        $warehouseId = $this->veeqo->resolveOriginWarehouseId();
        $allocationId = null;
        if ($warehouseId !== null && isset($response['id'])) {
            $this->veeqo->createAllocation((int) $response['id'], $warehouseId, $lineItems);
            $allocationId = $this->resolveAllocationId((int) $response['id']);
        }

        $raw['veeqo_booking']['warehouse_id'] = $warehouseId;
        $raw['veeqo_booking']['booked_at'] = Carbon::now()->toIso8601String();
        $order->raw_payload = $raw;
        $order->save();

        if ($allocationId !== null) {
            $this->purchaseLabel($order, $allocationId);
        }

        return $response;
    }

    /**
     * Amazon orders are already imported into Veeqo, so only purchase a label for
     * their existing allocation rather than creating a duplicate order.
     */
    private function bookExistingAmazonOrder(RemoteOrder $order, array $raw): array
    {
        $booking = is_array($raw['veeqo_booking'] ?? null) ? $raw['veeqo_booking'] : [];
        $veeqoOrderId = (int) ($booking['veeqo_order_id'] ?? 0);

        if ($veeqoOrderId <= 0) {
            $existingOrder = $this->veeqo->findOrderByNumber((string) $order->order_number);
            $veeqoOrderId = (int) ($existingOrder['id'] ?? 0);

            if ($veeqoOrderId <= 0) {
                throw new RemoteOrderBookingException(
                    'Cannot buy a Veeqo shipping label: no existing Veeqo order matches this Amazon order number.'
                );
            }
        }

        $allocationId = $this->resolveAllocationId($veeqoOrderId);

        if ($allocationId === null) {
            throw new RemoteOrderBookingException(
                'Cannot buy a Veeqo shipping label: the existing Amazon order has no allocation in Veeqo.'
            );
        }

        $booking['veeqo_order_id'] = $veeqoOrderId;
        $booking['allocation_id'] = $allocationId;
        $booking['carrier'] = self::CARRIER;
        $booking['booked_at'] = $booking['booked_at'] ?? Carbon::now()->toIso8601String();
        $raw['veeqo_booking'] = $booking;
        $order->raw_payload = $raw;
        $order->save();

        $this->purchaseLabel($order, $allocationId);

        return ['id' => $veeqoOrderId];
    }

    /**
     * Fetch shipping rates for the allocation, pick the best match for our carrier
     * (falling back to the cheapest available rate), and buy the label from Veeqo.
     */
    private function purchaseLabel(RemoteOrder $order, int $allocationId): void
    {
        $rates = $this->veeqo->getShippingRates($allocationId);
        $available = is_array($rates['available'] ?? null) ? $rates['available'] : [];

        if ($available === []) {
            throw new RuntimeException('No shipping rates were returned by Veeqo for this allocation.');
        }

        $rate = $this->selectRate($available);

        $shipment = [
            'allocation_id' => $allocationId,
            'carrier_id' => '',
            'remote_shipment_id' => (string) ($rate['remote_shipment_id'] ?? ''),
            'service_type' => (string) ($rate['name'] ?? $rate['title'] ?? ''),
            'notify_customer' => false,
            'sub_carrier_id' => (string) ($rate['sub_carrier_id'] ?? ''),
            'service_carrier' => (string) ($rate['service_carrier'] ?? ''),
            'payment_method_id' => null,
            // Purchases a return label alongside the outbound one, retrievable later from the same shipment id.
            'try_inbound_label' => true,
            'total_net_charge' => (string) ($rate['total_net_charge'] ?? ''),
            'base_rate' => (string) ($rate['base_rate'] ?? ''),
        ];

        // Each value-added service the rate offers must be echoed back with a chosen value.
        foreach ((array) ($rate['shipping_service_options'] ?? []) as $option) {
            $key = (string) ($option['key'] ?? '');
            $values = is_array($option['values'] ?? null) ? $option['values'] : [];
            if ($key === '' || $values === []) {
                continue;
            }
            $shipment[$key] = (string) ($values[0]['value'] ?? '');
        }

        $response = $this->veeqo->purchaseShippingLabel([
            'carrier' => (string) ($rate['carrier'] ?? ''),
            'shipment' => $shipment,
        ]);

        $serviceTitle = (string) ($rate['title'] ?? $rate['name'] ?? '');
        // Prefer the human-readable carrier name (e.g. "UPS") over the internal carrier code used in the API payload.
        $carrierLabel = (string) ($rate['sub_carrier_id'] ?? $rate['service_carrier'] ?? $rate['carrier'] ?? self::CARRIER);
        $labelUrl = $this->resolveLabelUrl($response['label_url'] ?? null);
        $shipmentId = (int) ($response['id'] ?? 0);
        $labelFilePath = $shipmentId > 0 ? $this->downloadLabelFile($order, $shipmentId) : null;

        $raw = is_array($order->raw_payload) ? $order->raw_payload : [];
        $raw['veeqo_booking']['label'] = [
            'id' => $response['id'] ?? null,
            'tracking_url' => $response['tracking_url'] ?? null,
            'label_url' => $labelUrl,
            'label_file_path' => $labelFilePath,
            'service_title' => $serviceTitle,
            'carrier' => $carrierLabel,
            'purchased_at' => Carbon::now()->toIso8601String(),
        ];

        $order->fill([
            'shipping_carrier' => $carrierLabel,
            'shipping_service' => $serviceTitle,
            'tracking_url' => $response['tracking_url'] ?? null,
            'label_url' => $labelUrl,
            'label_file_path' => $labelFilePath,
            'label_purchased_at' => Carbon::now(),
            'raw_payload' => $raw,
        ]);
        $order->save();
    }

    /**
     * Fetch the actual printable label file from Veeqo (per the "Retrieve Shipping Labels"
     * API) and save it under public/uploads so it can be displayed/printed from our own
     * app instead of relying on Veeqo's dashboard link. The label file isn't always ready
     * the instant the shipment is purchased, so retry briefly on a 404/empty response
     * before giving up.
     */
    private function downloadLabelFile(RemoteOrder $order, int $shipmentId): ?string
    {
        $label = null;
        $lastError = null;

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                $candidate = $this->veeqo->getShippingLabel([$shipmentId], 'png');
                if ((string) ($candidate['content'] ?? '') !== '') {
                    $label = $candidate;
                    break;
                }
                $lastError = 'Veeqo returned an empty label file.';
            } catch (\Throwable $e) {
                $lastError = $e->getMessage();
            }

            if ($attempt < 3) {
                usleep(1000000);
            }
        }

        if ($label === null) {
            Log::warning('Failed to download Veeqo shipping label file', [
                'remote_order_id' => $order->id,
                'shipment_id' => $shipmentId,
                'message' => $lastError,
            ]);

            return null;
        }

        $extension = match (true) {
            str_contains($label['content_type'], 'pdf') => 'pdf',
            str_contains($label['content_type'], 'jpeg') => 'jpg',
            str_contains($label['content_type'], 'zpl') => 'zpl',
            default => 'png',
        };

        $directory = public_path('uploads/shipping-labels');
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $fileName = "order-{$order->id}-shipment-{$shipmentId}.{$extension}";
        file_put_contents($directory . DIRECTORY_SEPARATOR . $fileName, $label['content']);

        return 'uploads/shipping-labels/' . $fileName;
    }

    /**
     * Veeqo returns label_url as a path relative to its web dashboard, not the API host,
     * so it must be made absolute before it can be opened directly in a browser.
     */
    private function resolveLabelUrl(?string $labelUrl): ?string
    {
        $labelUrl = trim((string) $labelUrl);
        if ($labelUrl === '') {
            return null;
        }

        if (str_starts_with($labelUrl, 'http://') || str_starts_with($labelUrl, 'https://')) {
            return $labelUrl;
        }

        $dashboardUrl = rtrim((string) config('services.veeqo.dashboard_url', 'https://app.veeqo.com'), '/');

        return $dashboardUrl . '/' . ltrim($labelUrl, '/');
    }

    /**
     * Prefer a rate matching our default UPS Ground carrier; otherwise pick the cheapest quote.
     */
    private function selectRate(array $rates): array
    {
        foreach ($rates as $rate) {
            $carrier = strtolower((string) ($rate['service_carrier'] ?? $rate['sub_carrier_id'] ?? ''));
            $title = strtolower((string) ($rate['title'] ?? $rate['name'] ?? ''));
            if (str_contains($carrier, 'ups') && str_contains($title, 'ground')) {
                return $rate;
            }
        }

        usort($rates, fn (array $a, array $b) => (float) ($a['total_net_charge'] ?? PHP_FLOAT_MAX) <=> (float) ($b['total_net_charge'] ?? PHP_FLOAT_MAX));

        return $rates[0];
    }

    /**
     * Re-fetch the order per Veeqo's documented flow and read its allocation ID off it,
     * retrying briefly since the allocation may not be reflected immediately after creation.
     */
    private function resolveAllocationId(int $veeqoOrderId): ?int
    {
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $veeqoOrder = $this->veeqo->getOrder($veeqoOrderId);
            $allocationId = (int) (data_get($veeqoOrder, 'allocations.0.id') ?? 0);

            if ($allocationId > 0) {
                return $allocationId;
            }

            if ($attempt < 3) {
                usleep(700000);
            }
        }

        return null;
    }

    /**
     * Cancel the Veeqo order tied to this remote order, if one was ever booked.
     */
    public function cancel(RemoteOrder $order): void
    {
        $raw = is_array($order->raw_payload) ? $order->raw_payload : [];
        $veeqoOrderId = (int) ($raw['veeqo_booking']['veeqo_order_id'] ?? 0);

        if ($veeqoOrderId <= 0) {
            return;
        }

        $this->veeqo->cancelOrder($veeqoOrderId);

        $raw['veeqo_booking']['cancelled_at'] = Carbon::now()->toIso8601String();
        $order->raw_payload = $raw;
        $order->save();
    }

    private function buildLineItem(array $item): array
    {
        $productId = (int) ($item['productId'] ?? 0);
        $product = $productId > 0 ? Product::find($productId) : null;
        $sku = trim((string) ($product->sku ?? ''));
        $name = (string) ($item['name'] ?? 'Unknown product');
        $color = (string) ($item['selectedColor'] ?? '');
        $size = (string) ($item['selectedSize'] ?? '');
        $price = (float) ($item['priceValue'] ?? 0);
        $weight = $item['weight'] ?? null;
        $length = $item['length'] ?? null;
        $width = $item['width'] ?? null;
        $height = $item['height'] ?? null;

        if ($sku === '') {
            throw new RemoteOrderBookingException("Cannot book with Veeqo: no SKU found locally for product \"{$name}\".");
        }

        $sellableId = $this->veeqo->findSellableIdBySku($sku)
            ?? $this->createSellable($sku, $name, $color, $size, $price, $weight, $length, $width, $height);

        $descriptionParts = array_filter([
            "Product: {$name}",
            $color !== '' ? "Color: {$color}" : null,
            $size !== '' ? "Size: {$size}" : null,
            $weight !== null && $weight !== '' ? "Weight: {$weight}" : null,
            $length !== null && $length !== '' ? "Length: {$length}" : null,
            $width !== null && $width !== '' ? "Width: {$width}" : null,
            $height !== null && $height !== '' ? "Height: {$height}" : null,
        ]);

        return [
            'sellable_id' => $sellableId,
            'quantity' => max(1, (int) ($item['quantity'] ?? 1)),
            'price_per_unit' => $price,
            'additional_options' => implode(' | ', $descriptionParts),
            'remote_id' => (string) ($item['lineId'] ?? $productId),
        ];
    }

    /**
     * Auto-create the product/variant in Veeqo when its SKU has never been synced there.
     */
    private function createSellable(string $sku, string $name, string $color, string $size, float $price, $weight, $length = null, $width = null, $height = null): int
    {
        $variantTitle = trim(implode(' ', array_filter([$color, $size]))) ?: 'Default';

        $response = $this->veeqo->createProduct([
            'product' => [
                'title' => $name,
                'product_variants_attributes' => [[
                    'title' => $variantTitle,
                    'sku_code' => $sku,
                    'price' => (string) $price,
                    'cost_price' => '0',
                    'weight_grams' => is_numeric($weight) ? (int) round((float) $weight) : 0,
                    'weight_unit' => 'g',
                    'length' => is_numeric($length) ? (float) $length : 0,
                    'width' => is_numeric($width) ? (float) $width : 0,
                    'height' => is_numeric($height) ? (float) $height : 0,
                ]],
            ],
        ]);

        $sellableId = (int) data_get($response, 'sellables.0.id');
        if ($sellableId <= 0) {
            throw new RemoteOrderBookingException("Cannot book with Veeqo: failed to auto-create SKU \"{$sku}\" ({$name}).");
        }

        $this->veeqo->rememberSellableId($sku, $sellableId);

        return $sellableId;
    }

    private function splitCustomerName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name), 2) ?: [];

        return [$parts[0] ?? '', $parts[1] ?? ''];
    }
}
