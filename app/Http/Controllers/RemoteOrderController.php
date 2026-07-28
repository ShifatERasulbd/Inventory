<?php

namespace App\Http\Controllers;

use App\Models\RemoteOrder;
use App\Services\RemoteOrderSyncService;
use App\Services\ShipStationService;
use App\Services\UpsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class RemoteOrderController extends Controller
{


    public function getPendingOrders(): JsonResponse
    {
        $orders = RemoteOrder::where('status', 'approved')
            ->orderByDesc('id')
            ->get(['id', 'remote_id', 'order_number', 'customer_name', 'total', 'raw_payload']);

        return response()->json($orders);
    }

    public function getApprovedCount(): JsonResponse
    {
        $count = RemoteOrder::where('status', 'approved')->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        if (! empty($validated['date_from']) && ! empty($validated['date_to'])) {
            $from = Carbon::parse((string) $validated['date_from'])->startOfDay();
            $to = Carbon::parse((string) $validated['date_to'])->endOfDay();

            if ($from->gt($to)) {
                throw ValidationException::withMessages([
                    'date_from' => ['Date From must be before or equal to Date To.'],
                ]);
            }
        }

        $query = RemoteOrder::query()->orderByDesc('remote_id');

        if (! empty($validated['status'])) {
            $query->where('status', (string) $validated['status']);
        }

        if (! empty($validated['search'])) {
            $search = trim((string) $validated['search']);
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('remote_id', 'like', "%{$search}%")
                    ->orWhere('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('raw_payload', 'like', "%{$search}%");
            });
        }

        if (! empty($validated['date_from'])) {
            $query->where('updated_at', '>=', Carbon::parse((string) $validated['date_from'])->startOfDay());
        }

        if (! empty($validated['date_to'])) {
            $query->where('updated_at', '<=', Carbon::parse((string) $validated['date_to'])->endOfDay());
        }

        return response()->json(
            $query->paginate((int) ($validated['per_page'] ?? 20))
        );
    }

    public function show(int $id, RemoteOrderSyncService $syncService): JsonResponse
    {
        $localOrder = RemoteOrder::query()
            ->where('remote_id', $id)
            ->orWhere('id', $id)
            ->first();

        if ($localOrder) {
            return response()->json([
                'success' => true,
                'order' => $localOrder,
            ]);
        }

        try {
            $order = $syncService->syncSingle($id);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 502);
        }

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found in main store.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    public function sync(Request $request, RemoteOrderSyncService $syncService): JsonResponse
    {
        $validated = $request->validate([
            'since_id' => 'nullable|integer|min:0',
            'limit' => 'nullable|integer|min:1|max:200',
        ]);

        try {
            $result = $syncService->syncRecent(
                $validated['since_id'] ?? null,
                (int) ($validated['limit'] ?? 100)
            );
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 502);
        }

        return response()->json([
            'message' => 'Remote order sync completed successfully.',
            ...$result,
        ]);
    }

    public function handleWebhook(Request $request, RemoteOrderSyncService $syncService): JsonResponse
    {
        $expectedSecret = trim((string) (config('services.main_store.webhook_secret') ?? ''));
        if ($expectedSecret !== '') {
            $providedSecret = trim((string) $request->header('X-Webhook-Secret', ''));

            if (! hash_equals($expectedSecret, $providedSecret)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid webhook secret.',
                ], 401);
            }
        }

        $payload = $request->json()->all();
        if (! is_array($payload) || $payload === []) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook payload is required.',
            ], 422);
        }

        $orders = [];

        if (isset($payload['orders']) && is_array($payload['orders'])) {
            $orders = $payload['orders'];
        } elseif (isset($payload['order']) && is_array($payload['order'])) {
            $orders = [$payload['order']];
        } elseif (array_key_exists('id', $payload)) {
            $orders = [$payload];
        }

        if ($orders === []) {
            return response()->json([
                'success' => false,
                'message' => 'Webhook payload must include an order or orders array.',
            ], 422);
        }

        $saved = 0;
        $skipped = 0;
        $latestRemoteId = 0;

        foreach ($orders as $order) {
            if (! is_array($order)) {
                $skipped++;
                continue;
            }

            $remoteOrder = $syncService->saveOrderPayload($order);
            if (! $remoteOrder) {
                $skipped++;
                continue;
            }

            $saved++;
            $latestRemoteId = max($latestRemoteId, (int) $remoteOrder->remote_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook orders saved successfully.',
            'saved_count' => $saved,
            'skipped_count' => $skipped,
            'latest_remote_id' => $latestRemoteId,
        ]);
    }

    public function update(Request $request, int $id, ShipStationService $shipStationService, UpsService $upsService): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => 'nullable|string|max:255',
            'customer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
            'courier_company' => 'nullable|string|max:100',
            'total' => 'nullable|numeric|min:0',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:100',
            'address_line_1' => 'nullable|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:2000',
        ]);

        $order = RemoteOrder::query()
            ->where('remote_id', $id)
            ->orWhere('id', $id)
            ->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Remote order not found in local inventory database.',
            ], 404);
        }

        $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];

        $rawFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'address_line_1',
            'address_line_2',
            'city',
            'state',
            'postal_code',
            'country',
            'notes',
        ];

        foreach ($rawFields as $field) {
            if (array_key_exists($field, $validated)) {
                $rawPayload[$field] = $validated[$field];
            }
        }

        if (array_key_exists('status', $validated)) {
            $rawPayload['status'] = $validated['status'];
        }

        if (array_key_exists('courier_company', $validated)) {
            $rawPayload['courier_company'] = $validated['courier_company'];
            $rawPayload['courier_service'] = strtolower((string) $validated['courier_company']) === 'ups'
                ? 'ups'
                : (strtolower((string) $validated['courier_company']) === 'shipstation' ? 'shipstation' : ($rawPayload['courier_service'] ?? null));
        }

        if (array_key_exists('total', $validated)) {
            $rawPayload['total'] = $validated['total'];
        }

        if (array_key_exists('order_number', $validated)) {
            $rawPayload['order_number'] = $validated['order_number'];
        }

        $derivedCustomer = trim(
            Str::of((string) ($rawPayload['first_name'] ?? ''))
                ->append(' ')
                ->append((string) ($rawPayload['last_name'] ?? ''))
                ->value()
        );

        $previousStatus = (string) ($order->status ?? '');

        $order->fill([
            'order_number' => array_key_exists('order_number', $validated)
                ? (string) ($validated['order_number'] ?? '')
                : $order->order_number,
            'customer_name' => array_key_exists('customer_name', $validated)
                ? (string) ($validated['customer_name'] ?? '')
                : ($derivedCustomer !== '' ? $derivedCustomer : $order->customer_name),
            'status' => array_key_exists('status', $validated)
                ? (string) ($validated['status'] ?? '')
                : $order->status,
            'courier_company' => array_key_exists('courier_company', $validated)
                ? (string) ($validated['courier_company'] ?? '')
                : $order->courier_company,
            'total' => array_key_exists('total', $validated)
                ? (float) ($validated['total'] ?? 0)
                : $order->total,
            'raw_payload' => $rawPayload,
        ]);

        $order->save();

        $bookingResult = null;
        if ($this->shouldTriggerProcessingBooking($previousStatus, (string) $order->status)) {
            try {
                $bookingResult = $this->dispatchCourierBooking($order, $shipStationService, $upsService);
                $order->courier_api_connected = true;
                $order->courier_api_checked_at = Carbon::now();
                $order->courier_api_message = null;
                $order->save();
            } catch (Throwable $e) {
                $order->courier_api_connected = false;
                $order->courier_api_checked_at = Carbon::now();
                $order->courier_api_message = $this->limitStatusMessage($e->getMessage());
                $order->save();

                return response()->json([
                    'success' => false,
                    'message' => 'Order status was updated to Processing, but courier booking failed: ' . $e->getMessage(),
                    'order' => $order->fresh(),
                ], 502);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Remote order updated successfully.',
            'order' => $order->fresh(),
            'booking' => $bookingResult,
        ]);
    }


    public function bulkUpdateStatus(Request $request, ShipStationService $shipStationService, UpsService $upsService): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
            'status' => 'required|string|max:100',
        ]);

        $orders = RemoteOrder::query()
            ->whereIn('id', $validated['ids'])
            ->orWhereIn('remote_id', $validated['ids'])
            ->get();

        $bookedCount = 0;
        $bookingFailures = [];

        foreach ($orders as $order) {
            $previousStatus = (string) ($order->status ?? '');
            $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];
            $rawPayload['status'] = $validated['status'];

            $order->fill([
                'status' => $validated['status'],
                'raw_payload' => $rawPayload,
            ]);
            $order->save();

            if (! $this->shouldTriggerProcessingBooking($previousStatus, (string) $order->status)) {
                continue;
            }

            try {
                $this->dispatchCourierBooking($order, $shipStationService, $upsService);
                $order->courier_api_connected = true;
                $order->courier_api_checked_at = Carbon::now();
                $order->courier_api_message = null;
                $order->save();
                $bookedCount++;
            } catch (Throwable $e) {
                $order->courier_api_connected = false;
                $order->courier_api_checked_at = Carbon::now();
                $order->courier_api_message = $this->limitStatusMessage($e->getMessage());
                $order->save();

                $bookingFailures[] = [
                    'id' => $order->id,
                    'remote_id' => $order->remote_id,
                    'order_number' => $order->order_number,
                    'message' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($orders) . ' orders status updated successfully.',
            'booked_count' => $bookedCount,
            'booking_failures' => $bookingFailures,
        ]);
    }

    private function shouldTriggerProcessingBooking(string $previousStatus, string $currentStatus): bool
    {
        return strtolower(trim($previousStatus)) !== 'processing'
            && strtolower(trim($currentStatus)) === 'processing';
    }

    private function dispatchCourierBooking(RemoteOrder $order, ShipStationService $shipStationService, UpsService $upsService): array
    {
        $courier = $this->resolveCourierService($order);

        if ($courier === 'shipstation') {
            $response = $shipStationService->createOrder($this->buildShipStationPayload($order));

            return [
                'courier' => 'shipstation',
                'response' => $response,
            ];
        }

        if ($courier === 'ups') {
            $response = $upsService->createShipment($this->buildUpsShipmentPayload($order));

            return [
                'courier' => 'ups',
                'tracking_number' => data_get($response, 'ShipmentResponse.ShipmentResults.ShipmentIdentificationNumber'),
                'response' => $response,
            ];
        }

        throw new RuntimeException('Courier must be either ShipStation or UPS to create booking.');
    }

    private function resolveCourierService(RemoteOrder $order): ?string
    {
        $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];

        $candidates = [
            (string) ($order->courier_company ?? ''),
            (string) ($rawPayload['courier_company'] ?? ''),
            (string) ($rawPayload['courier_service'] ?? ''),
        ];

        foreach ($candidates as $candidate) {
            $normalized = strtolower(trim($candidate));
            if ($normalized === 'shipstation') {
                return 'shipstation';
            }

            if ($normalized === 'ups') {
                return 'ups';
            }
        }

        return null;
    }

    private function buildShipStationPayload(RemoteOrder $order): array
    {
        $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];
        $name = trim((string) ($rawPayload['first_name'] ?? '') . ' ' . (string) ($rawPayload['last_name'] ?? ''));
        $street1 = trim((string) ($rawPayload['address_line_1'] ?? ''));

        if ($street1 === '') {
            throw new RuntimeException('Shipping address is required for ShipStation booking.');
        }

        return [
            'orderNumber' => (string) ($order->order_number ?? ('remote-' . $order->remote_id)),
            'orderDate' => optional($order->updated_at ?? $order->created_at)->toIso8601String(),
            'orderStatus' => 'awaiting_shipment',
            'customerUsername' => (string) ($rawPayload['email'] ?? ''),
            'customerEmail' => (string) ($rawPayload['email'] ?? ''),
            'billTo' => [
                'name' => $name !== '' ? $name : (string) ($order->customer_name ?? 'Customer'),
                'phone' => (string) ($rawPayload['phone'] ?? ''),
                'email' => (string) ($rawPayload['email'] ?? ''),
            ],
            'shipTo' => [
                'name' => $name !== '' ? $name : (string) ($order->customer_name ?? 'Customer'),
                'street1' => $street1,
                'street2' => (string) ($rawPayload['address_line_2'] ?? ''),
                'city' => (string) ($rawPayload['city'] ?? ''),
                'state' => (string) ($rawPayload['state'] ?? ''),
                'postalCode' => (string) ($rawPayload['postal_code'] ?? ''),
                'country' => $this->normalizeCountryCode((string) ($rawPayload['country'] ?? 'US')),
                'phone' => (string) ($rawPayload['phone'] ?? ''),
            ],
            'amountPaid' => number_format((float) ($order->total ?? 0), 2, '.', ''),
            'shippingAmount' => number_format((float) ($rawPayload['shipping'] ?? 0), 2, '.', ''),
            'taxAmount' => number_format((float) ($rawPayload['tax'] ?? 0), 2, '.', ''),
            'internalNotes' => (string) ($rawPayload['notes'] ?? ''),
            'items' => $this->mapShipStationItems(
                is_array($rawPayload['items'] ?? null) ? $rawPayload['items'] : []
            ),
        ];
    }

    private function mapShipStationItems(array $items): array
    {
        $mapped = [];

        foreach (array_values($items) as $index => $item) {
            if (! is_array($item)) {
                continue;
            }

            $quantity = max(1, (int) ($item['quantity'] ?? 1));

            $priceCandidates = [
                $item['unitPrice'] ?? null,
                $item['unit_price'] ?? null,
                $item['price'] ?? null,
                $item['priceValue'] ?? null,
                $item['item_price'] ?? null,
            ];

            $unitPrice = null;
            foreach ($priceCandidates as $candidate) {
                if ($candidate === null || $candidate === '') {
                    continue;
                }

                $unitPrice = (float) $candidate;
                break;
            }

            if ($unitPrice === null) {
                $lineTotal = $item['line_total'] ?? $item['subtotal'] ?? $item['total'] ?? null;
                if ($lineTotal !== null && $lineTotal !== '') {
                    $unitPrice = ((float) $lineTotal) / max(1, $quantity);
                }
            }

            if ($unitPrice === null) {
                $unitPrice = 0.0;
            }

            $name = trim((string) ($item['name'] ?? $item['title'] ?? 'Item ' . ($index + 1)));

            $mapped[] = [
                'lineItemKey' => (string) ($item['lineItemKey'] ?? $item['line_id'] ?? $item['id'] ?? ('item-' . ($index + 1))),
                'sku' => (string) ($item['sku'] ?? $item['product_sku'] ?? $item['product_id'] ?? ''),
                'name' => $name !== '' ? $name : ('Item ' . ($index + 1)),
                'quantity' => $quantity,
                'unitPrice' => number_format($unitPrice, 2, '.', ''),
            ];
        }

        return $mapped;
    }

    private function buildUpsShipmentPayload(RemoteOrder $order): array
    {
        $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];
        $name = trim((string) ($rawPayload['first_name'] ?? '') . ' ' . (string) ($rawPayload['last_name'] ?? ''));
        $street1 = trim((string) ($rawPayload['address_line_1'] ?? ''));

        if ($street1 === '') {
            throw new RuntimeException('Shipping address is required for UPS booking.');
        }

        return [
            'ShipmentRequest' => [
                'Request' => [
                    'RequestOption' => 'nonvalidate',
                    'TransactionReference' => [
                        'CustomerContext' => 'Remote Order ' . ((string) ($order->order_number ?? $order->remote_id)),
                    ],
                ],
                'Shipment' => [
                    'Description' => 'Remote Order ' . ((string) ($order->order_number ?? $order->remote_id)),
                    'Shipper' => [
                        'Name' => config('services.ups.shipper_name', '1971Co'),
                        'ShipperNumber' => config('services.ups.shipper_number'),
                        'Address' => [
                            'AddressLine' => [config('services.ups.origin_address_1', '123 Warehouse Rd')],
                            'City' => config('services.ups.origin_city', 'New York'),
                            'StateProvinceCode' => config('services.ups.origin_state', 'NY'),
                            'PostalCode' => config('services.ups.origin_postal_code', '10001'),
                            'CountryCode' => config('services.ups.origin_country', 'US'),
                        ],
                    ],
                    'ShipTo' => [
                        'Name' => $name !== '' ? $name : (string) ($order->customer_name ?? 'Customer'),
                        'Address' => [
                            'AddressLine' => [$street1],
                            'City' => (string) ($rawPayload['city'] ?? ''),
                            'StateProvinceCode' => strtoupper(substr((string) ($rawPayload['state'] ?? ''), 0, 2)),
                            'PostalCode' => (string) ($rawPayload['postal_code'] ?? ''),
                            'CountryCode' => $this->normalizeCountryCode((string) ($rawPayload['country'] ?? 'US')),
                        ],
                    ],
                    'Service' => [
                        'Code' => config('services.ups.service_code', '03'),
                        'Description' => config('services.ups.service_description', 'UPS Ground'),
                    ],
                    'PaymentInformation' => [
                        'ShipmentCharge' => [
                            'Type' => '01',
                            'BillShipper' => [
                                'AccountNumber' => config('services.ups.shipper_number'),
                            ],
                        ],
                    ],
                    'Package' => [[
                        'Packaging' => [
                            'Code' => config('services.ups.packaging_code', '02'),
                            'Description' => 'Customer Box',
                        ],
                        'PackageWeight' => [
                            'UnitOfMeasurement' => [
                                'Code' => 'LBS',
                            ],
                            'Weight' => number_format(max(1, (float) ($rawPayload['weight'] ?? 1)), 2, '.', ''),
                        ],
                    ]],
                ],
                'LabelSpecification' => [
                    'LabelImageFormat' => [
                        'Code' => 'GIF',
                    ],
                ],
            ],
        ];
    }

    private function normalizeCountryCode(?string $country): string
    {
        $value = strtoupper(trim((string) $country));

        if ($value === '') {
            return 'US';
        }

        if (strlen($value) === 2) {
            return $value;
        }

        $map = [
            'UNITED STATES' => 'US',
            'USA' => 'US',
            'UNITED STATES OF AMERICA' => 'US',
            'CANADA' => 'CA',
            'BANGLADESH' => 'BD',
            'INDIA' => 'IN',
            'PAKISTAN' => 'PK',
            'UNITED KINGDOM' => 'GB',
            'GREAT BRITAIN' => 'GB',
            'ENGLAND' => 'GB',
            'AUSTRALIA' => 'AU',
            'NEW ZEALAND' => 'NZ',
            'GERMANY' => 'DE',
            'FRANCE' => 'FR',
            'ITALY' => 'IT',
            'SPAIN' => 'ES',
            'NETHERLANDS' => 'NL',
            'SWEDEN' => 'SE',
            'NORWAY' => 'NO',
            'DENMARK' => 'DK',
            'SWITZERLAND' => 'CH',
            'JAPAN' => 'JP',
            'CHINA' => 'CN',
            'SINGAPORE' => 'SG',
            'UNITED ARAB EMIRATES' => 'AE',
            'SAUDI ARABIA' => 'SA',
        ];

        return $map[$value] ?? 'US';
    }

    private function limitStatusMessage(string $message): string
    {
        return mb_substr($message, 0, 1000);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $deletedCount = RemoteOrder::query()
            ->whereIn('id', $validated['ids'])
            ->orWhereIn('remote_id', $validated['ids'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => $deletedCount . ' orders deleted from local inventory database.',
        ]);
    }
}