<?php

namespace App\Services;

use App\Models\RemoteOrder;
use App\Models\ReturnRequest;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class ReturnRequestShippingLabelService
{
    public function __construct(private VeeqoService $veeqo)
    {
    }

    public function resolve(ReturnRequest $returnRequest, ?RemoteOrder $remoteOrder = null, bool $createIfMissing = true): ?string
    {
        if ($remoteOrder && $remoteOrder->order_from !== '1971co') {
            throw new RuntimeException('Return labels are only supported for 1971co orders.');
        }

        $orderPayload = $remoteOrder && is_array($remoteOrder->raw_payload)
            ? $remoteOrder->raw_payload
            : (is_array($returnRequest->raw_payload) ? $returnRequest->raw_payload : []);
        $bookingLabel = is_array($orderPayload['veeqo_booking']['label'] ?? null)
            ? $orderPayload['veeqo_booking']['label']
            : [];
        $returnLabel = is_array($returnRequest->raw_payload['veeqo_return_label'] ?? null)
            ? $returnRequest->raw_payload['veeqo_return_label']
            : [];

        if (
            $returnRequest->return_label_file_path
            && (($returnLabel['source'] ?? null) === 'rate_shopping' || ($bookingLabel['has_return_label'] ?? false) === true)
        ) {
            $path = public_path($returnRequest->return_label_file_path);
            if (is_file($path)) {
                $content = file_get_contents($path);
                if ($content !== false && $content !== '') {
                    return $content;
                }
            }
        }

        if (! empty($returnLabel['shipment_id'])) {
            return $this->downloadStandaloneReturnLabel($returnRequest, (string) $returnLabel['shipment_id']);
        }

        if (($bookingLabel['has_return_label'] ?? false) === true) {
            $shipmentId = (int) ($bookingLabel['id'] ?? 0);
            if ($shipmentId <= 0) {
                throw new RuntimeException('Veeqo marked this shipment as having a return label but did not provide its shipment ID.');
            }

            try {
                $label = $this->veeqo->getShippingLabel([$shipmentId], 'pdf');
            } catch (Throwable $exception) {
                throw new RuntimeException('Could not download the existing Veeqo return label: '.$exception->getMessage(), previous: $exception);
            }

            $content = (string) ($label['content'] ?? '');
            if ($content === '') {
                throw new RuntimeException('Veeqo returned an empty existing return label.');
            }

            $this->saveLabel($returnRequest, $content, [
                'source' => 'original_shipment',
                'shipment_id' => (string) $shipmentId,
            ]);

            return $content;
        }

        if (! $createIfMissing) {
            return null;
        }

        return $this->createStandaloneReturnLabel($returnRequest, $remoteOrder, $orderPayload);
    }

    private function createStandaloneReturnLabel(
        ReturnRequest $returnRequest,
        ?RemoteOrder $remoteOrder,
        array $orderPayload
    ): string {
        $veeqoOrder = $this->loadVeeqoOrder((string) $returnRequest->order_number, $orderPayload);
        $requestPayload = $this->buildRateRequest($returnRequest, $remoteOrder, $orderPayload, $veeqoOrder);

        Log::info('Veeqo return label rate request', [
            'order_number' => $returnRequest->order_number,
            'payload' => $this->sanitizeForLog($requestPayload),
        ]);
        $ratesResponse = $this->veeqo->getStandaloneShippingRates($requestPayload);
        Log::info('Veeqo return label rate response', [
            'order_number' => $returnRequest->order_number,
            'response' => $this->sanitizeForLog($ratesResponse),
        ]);
        $quotes = $ratesResponse['quotes'] ?? $ratesResponse['rates'] ?? $ratesResponse['available'] ?? [];
        $quote = $this->selectAvailableQuote((array) $quotes);
        $quote['remote_shipment_id'] = $quote['remote_shipment_id'] ?? $ratesResponse['remote_shipment_id'] ?? null;
        $quote['request_token'] = $quote['request_token'] ?? $ratesResponse['request_token'] ?? null;
        $shipmentId = trim((string) ($quote['remote_shipment_id'] ?? ''));
        $rateId = trim((string) ($quote['rate_id'] ?? ''));

        if ($shipmentId === '' || $rateId === '') {
            throw new RuntimeException('Veeqo did not return a bookable shipping rate for this return.');
        }

        $shipment = [
            'remote_shipment_id' => $shipmentId,
            'rate_id' => $rateId,
            'label_format' => 'PDF',
        ];

        foreach ((array) ($quote['shipping_service_options'] ?? []) as $option) {
            $key = trim((string) ($option['key'] ?? ''));
            $values = is_array($option['values'] ?? null) ? $option['values'] : [];
            $value = (string) ($values[0]['value'] ?? '');
            if ($key !== '' && $value !== '') {
                $shipment[$key] = $value;
            }
        }

        $bookingPayload = [
            'label_format' => 'PDF',
            'shipments' => [$shipment],
        ];
        $requestToken = $quote['request_token'] ?? $ratesResponse['request_token'] ?? null;
        if (is_string($requestToken) && $requestToken !== '') {
            $bookingPayload['request_token'] = $requestToken;
        }

        Log::info('Veeqo return label booking request', [
            'order_number' => $returnRequest->order_number,
            'payload' => $this->sanitizeForLog($bookingPayload),
        ]);
        $bookingResponse = $this->veeqo->bookStandaloneShipment($bookingPayload);
        Log::info('Veeqo return label booking response', [
            'order_number' => $returnRequest->order_number,
            'response' => $this->sanitizeForLog($bookingResponse),
        ]);
        $bookedShipment = $bookingResponse['successful'][$shipmentId] ?? null;
        if (! is_array($bookedShipment)) {
            $errors = $bookingResponse['failed'][$shipmentId]['errors'] ?? [];
            throw new RuntimeException(
                'Veeqo could not purchase the return label'.($errors !== [] ? ': '.implode('; ', $errors) : '.')
            );
        }

        $rawPayload = is_array($returnRequest->raw_payload) ? $returnRequest->raw_payload : [];
        $rawPayload['veeqo_return_label'] = [
            'source' => 'rate_shopping',
            'shipment_id' => $shipmentId,
            'tracking_number' => $bookedShipment['tracking_number'] ?? null,
            'service_name' => $bookedShipment['service_name'] ?? $quote['service_name'] ?? null,
            'booked_at' => now()->toIso8601String(),
        ];
        $returnRequest->update(['raw_payload' => $rawPayload]);

        $encodedContent = (string) ($bookedShipment['label_content'] ?? '');
        $content = $encodedContent !== '' ? base64_decode($encodedContent, true) : false;
        if (! is_string($content) || $content === '') {
            $label = $this->veeqo->getStandaloneShippingLabel($shipmentId, 'pdf');
            $content = (string) ($label['content'] ?? '');
            Log::info('Veeqo return label file response', [
                'order_number' => $returnRequest->order_number,
                'shipment_id' => $shipmentId,
                'content_type' => $label['content_type'] ?? null,
                'content_bytes' => strlen($content),
                'content' => '[redacted]',
            ]);
        }

        if ($content === '') {
            throw new RuntimeException("Veeqo purchased return shipment {$shipmentId} but returned an empty label.");
        }

        $this->saveLabel($returnRequest, $content, $rawPayload['veeqo_return_label']);

        return $content;
    }

    private function downloadStandaloneReturnLabel(ReturnRequest $returnRequest, string $shipmentId): string
    {
        $label = $this->veeqo->getStandaloneShippingLabel($shipmentId, 'pdf');
        $content = (string) ($label['content'] ?? '');
        Log::info('Veeqo return label file response', [
            'order_number' => $returnRequest->order_number,
            'shipment_id' => $shipmentId,
            'content_type' => $label['content_type'] ?? null,
            'content_bytes' => strlen($content),
            'content' => '[redacted]',
        ]);
        if ($content === '') {
            throw new RuntimeException("Veeqo returned an empty label for return shipment {$shipmentId}.");
        }

        $rawPayload = is_array($returnRequest->raw_payload) ? $returnRequest->raw_payload : [];
        $metadata = is_array($rawPayload['veeqo_return_label'] ?? null)
            ? $rawPayload['veeqo_return_label']
            : [];
        $metadata['source'] = 'rate_shopping';
        $metadata['shipment_id'] = $shipmentId;
        $this->saveLabel($returnRequest, $content, $metadata);

        return $content;
    }

    private function loadVeeqoOrder(string $orderNumber, array $orderPayload): array
    {
        $veeqoOrderId = (int) ($orderPayload['veeqo_booking']['veeqo_order_id'] ?? 0);
        if ($veeqoOrderId <= 0) {
            $existingOrder = $this->veeqo->findOrderByNumber($orderNumber);
            $veeqoOrderId = (int) ($existingOrder['id'] ?? 0);
        }

        if ($veeqoOrderId <= 0) {
            throw new RuntimeException("No matching Veeqo order was found for order #{$orderNumber}.");
        }

        return $this->veeqo->getOrder($veeqoOrderId);
    }

    private function buildRateRequest(
        ReturnRequest $returnRequest,
        ?RemoteOrder $remoteOrder,
        array $orderPayload,
        array $veeqoOrder
    ): array {
        $origin = (array) config('services.veeqo.origin', []);
        $originCountry = $this->countryCode((string) ($origin['country'] ?? ''), 'US');
        $deliverTo = is_array($veeqoOrder['deliver_to'] ?? null) ? $veeqoOrder['deliver_to'] : [];
        $sourcePayload = is_array($orderPayload['order'] ?? null) ? $orderPayload['order'] : $orderPayload;

        $fromAddress = $this->buildAddress([
            'name' => trim((string) (($deliverTo['first_name'] ?? $sourcePayload['first_name'] ?? '').' '.($deliverTo['last_name'] ?? $sourcePayload['last_name'] ?? ''))),
            'phone' => $deliverTo['phone'] ?? $sourcePayload['phone'] ?? null,
            'email' => $deliverTo['email'] ?? $sourcePayload['email'] ?? null,
            'line1' => $deliverTo['address1'] ?? $sourcePayload['address_line_1'] ?? null,
            'line2' => $deliverTo['address2'] ?? $sourcePayload['address_line_2'] ?? null,
            'town' => $deliverTo['city'] ?? $sourcePayload['city'] ?? null,
            'postcode' => $deliverTo['zip'] ?? $sourcePayload['postal_code'] ?? null,
            'country_code' => $this->countryCode((string) ($deliverTo['country'] ?? $sourcePayload['country'] ?? ''), $originCountry),
            'county' => $deliverTo['state'] ?? $sourcePayload['state'] ?? null,
        ], 'customer');

        $toAddress = $this->buildAddress([
            'name' => (string) config('app.name', '1971Co Returns'),
            'company' => (string) config('app.name', '1971Co Returns'),
            'line1' => $origin['address1'] ?? null,
            'town' => $origin['city'] ?? null,
            'postcode' => $origin['zip'] ?? null,
            'country_code' => $originCountry,
            'county' => $origin['state'] ?? null,
        ], 'return destination');

        $parcel = $this->resolveParcel($veeqoOrder, $sourcePayload);
        $request = [
            'from_address' => $fromAddress,
            'to_address' => $toAddress,
            'parcels' => [$parcel],
            'inbound' => true,
            'customer_reference' => (string) $returnRequest->order_number,
            'contents' => 'Returned merchandise',
        ];

        $value = $sourcePayload['total'] ?? $remoteOrder?->total;
        if (is_numeric($value) && (float) $value > 0) {
            $request['estimated_value'] = number_format((float) $value, 2, '.', '');
            $request['currency_code'] = strtoupper((string) ($sourcePayload['currency_code'] ?? 'USD'));
        }

        if ($fromAddress['country_code'] !== $toAddress['country_code']) {
            $request['channel_items'] = $this->buildCustomsItems($sourcePayload);
        }

        return $request;
    }

    private function buildAddress(array $address, string $label): array
    {
        $required = ['line1', 'town', 'postcode', 'country_code'];
        foreach ($required as $field) {
            if (trim((string) ($address[$field] ?? '')) === '') {
                throw new RuntimeException("Cannot create the Veeqo return label: {$label} address is missing {$field}.");
            }
        }

        return array_filter($address, fn ($value) => $value !== null && trim((string) $value) !== '');
    }

    private function resolveParcel(array $veeqoOrder, array $sourcePayload): array
    {
        foreach ((array) ($veeqoOrder['allocations'] ?? []) as $allocation) {
            $package = is_array($allocation['allocation_package'] ?? null)
                ? $allocation['allocation_package']
                : [];
            $weight = $package['weight'] ?? null;

            if (is_numeric($weight) && (float) $weight > 0) {
                $parcel = [
                    'weight' => $this->weightInPounds((float) $weight, (string) ($package['weight_unit'] ?? 'g')),
                    'weight_unit' => 'lb',
                ];
                $this->addParcelDimensions($parcel, $package);

                return $parcel;
            }
        }

        $weightGrams = 0.0;
        foreach ((array) ($sourcePayload['items'] ?? []) as $item) {
            if (! is_array($item) || ! is_numeric($item['weight'] ?? null)) {
                continue;
            }
            $weightGrams += (float) $item['weight'] * max(1, (int) ($item['quantity'] ?? 1));
        }

        if ($weightGrams <= 0) {
            foreach ((array) ($veeqoOrder['line_items'] ?? []) as $item) {
                $sellable = is_array($item['sellable'] ?? null) ? $item['sellable'] : [];
                if (is_numeric($sellable['weight_grams'] ?? null)) {
                    $weightGrams += (float) $sellable['weight_grams'] * max(1, (int) ($item['quantity'] ?? 1));
                }
            }
        }

        if ($weightGrams <= 0) {
            throw new RuntimeException('Cannot create the Veeqo return label because the order has no usable package or item weight.');
        }

        return [
            'weight' => $this->weightInPounds($weightGrams, 'g'),
            'weight_unit' => 'lb',
        ];
    }

    private function addParcelDimensions(array &$parcel, array $package): void
    {
        $dimensions = [
            'height' => $package['height'] ?? null,
            'width' => $package['width'] ?? null,
            'length' => $package['depth'] ?? null,
        ];

        foreach ($dimensions as $dimension => $value) {
            if (! is_numeric($value) || (float) $value <= 0) {
                return;
            }
        }

        $unit = strtolower(trim((string) ($package['dimensions_unit'] ?? 'in')));
        $unit = $unit !== '' ? $unit : 'in';
        foreach ($dimensions as $dimension => $value) {
            $parcel[$dimension] = $this->dimensionInInches((float) $value, $unit);
        }
        $parcel['dimension_unit'] = 'in';
    }

    private function buildCustomsItems(array $orderPayload): array
    {
        $items = [];
        foreach ((array) ($orderPayload['items'] ?? []) as $item) {
            if (! is_array($item)) {
                continue;
            }

            $description = trim((string) preg_replace('/[^A-Za-z0-9 ]/', '', (string) ($item['name'] ?? 'Merchandise')));
            $items[] = [
                'description' => substr($description !== '' ? $description : 'Merchandise', 0, 40),
                'quantity' => max(1, (int) ($item['quantity'] ?? 1)),
                'value' => number_format((float) ($item['priceValue'] ?? $item['price'] ?? 1), 2, '.', ''),
                'currency_code' => strtoupper((string) ($orderPayload['currency_code'] ?? 'USD')),
            ];
        }

        if ($items === []) {
            throw new RuntimeException('Cannot create an international Veeqo return label because the order has no customs item details.');
        }

        return $items;
    }

    private function selectAvailableQuote(array $quotes): array
    {
        $available = array_values(array_filter($quotes, function ($quote) {
            return is_array($quote)
                && ! empty($quote['rate_id'])
                && empty($quote['unavailable_reasons']);
        }));

        if ($available === []) {
            $count = count($quotes);
            throw new RuntimeException(
                $count === 0
                    ? 'Veeqo returned no shipping quotes for this return shipment. Check the Veeqo rate-response log for carrier or address errors.'
                    : "Veeqo returned {$count} quotes, but none included a usable rate ID or all were marked unavailable. Check the Veeqo rate-response log."
            );
        }

        // Automatically sort by cheapest charge and select the best rate
        usort($available, fn (array $a, array $b) => (float) ($a['total_charge'] ?? PHP_FLOAT_MAX) <=> (float) ($b['total_charge'] ?? PHP_FLOAT_MAX));

        return $available[0];
    }

    private function weightInPounds(float $weight, string $unit): float
    {
        $unit = strtolower(trim($unit));

        $pounds = match ($unit) {
            'g', 'gram', 'grams' => $weight / 453.59237,
            'kg', 'kilogram', 'kilograms' => $weight * 2.20462262185,
            'oz', 'ounce', 'ounces' => $weight / 16,
            'lb', 'lbs', 'pound', 'pounds' => $weight,
            default => throw new RuntimeException("Cannot create the Veeqo return label because weight unit \"{$unit}\" is not supported."),
        };

        return round($pounds, 4);
    }

    private function dimensionInInches(float $dimension, string $unit): float
    {
        $inches = match ($unit) {
            'in', 'inch', 'inches' => $dimension,
            'cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres' => $dimension / 2.54,
            'ft', 'foot', 'feet' => $dimension * 12,
            'm', 'meter', 'meters', 'metre', 'metres' => $dimension * 39.3700787402,
            default => throw new RuntimeException("Cannot create the Veeqo return label because dimension unit \"{$unit}\" is not supported."),
        };

        return round($inches, 2);
    }

    private function sanitizeForLog(array $data): array
    {
        $sensitiveKeys = [
            'name',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address1',
            'address2',
            'line1',
            'line2',
            'city',
            'town',
            'state',
            'region',
            'country',
            'country_code',
            'postcode',
            'post_code',
            'postal_code',
            'zip',
            'county',
            'request_token',
        ];

        foreach ($data as $key => $value) {
            if (in_array(strtolower((string) $key), $sensitiveKeys, true)) {
                $data[$key] = '[redacted]';
            } elseif (strtolower((string) $key) === 'label_content' && is_string($value)) {
                $data[$key] = '[redacted; '.strlen($value).' base64 characters]';
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitizeForLog($value);
            }
        }

        return $data;
    }

    private function countryCode(string $country, string $fallback): string
    {
        $country = strtoupper(trim($country));
        if (preg_match('/^[A-Z]{2}$/', $country) === 1) {
            return $country;
        }

        return $fallback;
    }

    private function saveLabel(ReturnRequest $returnRequest, string $content, array $metadata): void
    {
        $directory = public_path('uploads/return-labels');
        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            throw new RuntimeException('Could not create the local return-label directory.');
        }

        $safeOrderNumber = preg_replace('/[^A-Za-z0-9_-]/', '-', (string) $returnRequest->order_number) ?: 'order';
        $fileName = "return-label-{$safeOrderNumber}-{$returnRequest->id}.pdf";
        $relativePath = 'uploads/return-labels/'.$fileName;
        $written = file_put_contents(public_path($relativePath), $content);
        if ($written === false || $written === 0) {
            throw new RuntimeException('Could not save the Veeqo return label locally.');
        }

        $rawPayload = is_array($returnRequest->raw_payload) ? $returnRequest->raw_payload : [];
        $rawPayload['veeqo_return_label'] = $metadata;
        $returnRequest->update([
            'return_label_file_path' => $relativePath,
            'return_label_saved_at' => now(),
            'raw_payload' => $rawPayload,
        ]);
    }
}