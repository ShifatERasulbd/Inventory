<?php

namespace App\Http\Controllers;

use App\Http\Traits\AuthorizesOrderCategory;
use App\Services\VeeqoService;
use App\Models\Product;
use App\Models\RemoteOrder;
use App\Models\Stock;
use App\Services\AmazonOrderSyncService;
use App\Services\RemoteOrderRefundService;
use App\Services\RemoteOrderSyncService;
use App\Services\RemoteOrderVeeqoBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;
use Throwable;

class RemoteOrderController extends Controller
{
    use AuthorizesOrderCategory;

    /**
     * Automatically background sync shipping status from Veeqo for active orders.
     */
    private function autoSyncOrderFromVeeqo(RemoteOrder $order, VeeqoService $veeqoService): void
    {
        if (! $order->remote_id || in_array(strtolower($order->status), ['delivered', 'cancelled', 'refunded'])) {
            return;
        }

        try {
            $veeqoData = $veeqoService->getOrderStatus((int) $order->remote_id);
            $rawVeeqoStatus = $veeqoData['status'] ?? null;

            if ($rawVeeqoStatus) {
                $newStatus = match (strtolower($rawVeeqoStatus)) {
                    'awaiting_stock', 'allocated', 'pending' => 'waiting for shipment',
                    'shipped' => 'shipped',
                    'delivered' => 'delivered',
                    'cancelled' => 'cancelled',
                    default => $rawVeeqoStatus,
                };

                if ($order->status !== $newStatus) {
                    $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];
                    $rawPayload['status'] = $newStatus;

                    $order->update([
                        'status' => $newStatus,
                        'raw_payload' => $rawPayload,
                    ]);
                }
            }
        } catch (Throwable $e) {
            Log::warning('Automatic Veeqo status background sync failed', [
                'remote_order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function getPendingOrders(Request $request): JsonResponse
    {
        if ($response = $this->authorizeOrderAction($request, 'read', null)) {
            return $response;
        }

        $orders = RemoteOrder::whereIn('status', ['approved', 'waiting for shipment'])
            ->orderByDesc('id')
            ->get([
                'id',
                'remote_id',
                'order_number',
                'customer_name',
                'total',
                'state_tax',
                'stripe_charge',
                'delivery_cost',
                'processing_fee',
                'raw_payload',
            ]);

        $productIds = $orders
            ->flatMap(fn (RemoteOrder $order) => is_array($order->raw_payload['items'] ?? null) ? $order->raw_payload['items'] : [])
            ->pluck('productId')
            ->filter()
            ->unique()
            ->values();

        $barcodesByProductId = Product::whereIn('id', $productIds)->pluck('barCode', 'id');

        $orders->each(function (RemoteOrder $order) use ($barcodesByProductId) {
            $payload = $order->raw_payload;

            if (is_array($payload['items'] ?? null)) {
                $payload['items'] = array_map(function ($item) use ($barcodesByProductId) {
                    $productId = $item['productId'] ?? null;
                    $item['barcode'] = $productId ? ($barcodesByProductId[$productId] ?? null) : null;

                    return $item;
                }, $payload['items']);
            }

            $order->raw_payload = $payload;
        });

        return response()->json($orders);
    }

    public function getApprovedCount(Request $request): JsonResponse
    {
        $orderFrom = trim((string) $request->query('order_from', ''));

        if ($response = $this->authorizeOrderAction($request, 'read', $orderFrom ?: null)) {
            return $response;
        }

        $query = RemoteOrder::whereIn('status', ['approved', 'waiting for shipment']);

        if ($orderFrom !== '') {
            $query->where('order_from', $orderFrom);
        }

        $count = $query->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    public function handleVeeqoWebhook(Request $request): JsonResponse
    {
        $payload = $request->json()->all();

        $veeqoOrderId = $payload['id'] ?? null; 
        $status = $payload['status'] ?? null;     

        if ($veeqoOrderId) {
            $order = RemoteOrder::where('remote_id', $veeqoOrderId)->first();
            if ($order) {
                $order->update(['status' => $status]);
            }
        }

        return response()->json(['success' => true]);
    }

    public function syncVeeqoShippingStatus(Request $request, VeeqoService $veeqoService, int $id): JsonResponse
    {
        $order = RemoteOrder::query()->where('id', $id)->first();

        if (! $order || ! $order->remote_id) {
            return response()->json(['success' => false, 'message' => 'Order or Veeqo reference not found.'], 404);
        }

        try {
            $veeqoData = $veeqoService->getOrderStatus((int) $order->remote_id);
            $rawVeeqoStatus = $veeqoData['status'] ?? null;

            $newStatus = match (strtolower((string) $rawVeeqoStatus)) {
                'awaiting_stock', 'allocated', 'pending' => 'waiting for shipment',
                'shipped' => 'shipped',
                'delivered' => 'delivered',
                'cancelled' => 'cancelled',
                default => $rawVeeqoStatus ?? $order->status,
            };

            $order->update([
                'status' => $newStatus,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Shipping status synchronized successfully from Veeqo.',
                'status' => $newStatus,
                'order' => $order->fresh(),
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync status from Veeqo: ' . $e->getMessage(),
            ], 502);
        }
    }

    public function index(Request $request, VeeqoService $veeqoService): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
            'order_from' => 'nullable|string|max:50',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        if ($response = $this->authorizeOrderAction($request, 'read', $validated['order_from'] ?? null)) {
            return $response;
        }

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

        if (! empty($validated['order_from'])) {
            $query->where('order_from', (string) $validated['order_from']);
        }

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

        $paginatedOrders = $query->paginate((int) ($validated['per_page'] ?? 20));

        // Automatically background sync active orders on this page view
        foreach ($paginatedOrders->items() as $order) {
            if (in_array($order->status, ['waiting for shipment', 'ready for shipment', 'pending'])) {
                $this->autoSyncOrderFromVeeqo($order, $veeqoService);
            }
        }

        return response()->json($paginatedOrders);
    }

    public function store(Request $request): JsonResponse
        {
            $validated = $request->validate([
                'order_from' => 'nullable|string|max:50',
                'order_number' => 'nullable|string|max:255',
                'total' => 'nullable|numeric|min:0',
                'subtotal' => 'nullable|numeric|min:0',
                'shipping_amazon' => 'nullable|numeric|min:0',
                'shipping_actual' => 'nullable|numeric|min:0',
                'tax' => 'nullable|numeric|min:0',
                'amazon_fee' => 'nullable|numeric|min:0',
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:100',
                'address_line_1' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'state' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:50',
                'country' => 'nullable|string|max:100',
                'status' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:2000',
                'items' => 'required|array|min:1',
                'items.*.name' => 'required|string|max:255',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'nullable|numeric|min:0',
                'items.*.selected_color' => 'nullable|string|max:100',
                'items.*.selected_size' => 'nullable|string|max:100',
            ]);

            if ($response = $this->authorizeOrderAction($request, 'create', trim((string) ($validated['order_from'] ?? '')) ?: 'amazon')) {
                return $response;
            }

            $customerNameInput = trim((string) ($validated['customer_name'] ?? ''));
            if ($customerNameInput === '' && trim((string) ($validated['first_name'] ?? '')) === '' && trim((string) ($validated['last_name'] ?? '')) === '') {
                throw ValidationException::withMessages([
                    'customer_name' => ['Enter a customer name for this order.'],
                ]);
            }

            $orderFrom = trim((string) ($validated['order_from'] ?? '')) ?: 'amazon';
            $status = trim((string) ($validated['status'] ?? '')) ?: 'pending';

            $items = array_values(array_map(static function (array $item, int $index): array {
                return [
                    'lineId' => $index + 1,
                    'productId' => null,
                    'name' => (string) $item['name'],
                    'priceValue' => (float) ($item['price'] ?? 0),
                    'quantity' => (int) $item['quantity'],
                    'weight' => null,
                    'image' => null,
                    'selectedColor' => trim((string) ($item['selected_color'] ?? '')) ?: null,
                    'selectedSize' => trim((string) ($item['selected_size'] ?? '')) ?: null,
                ];
            }, $validated['items'], array_keys($validated['items'])));

            $itemsTotal = array_reduce($items, static function (float $carry, array $item): float {
                return $carry + ($item['priceValue'] * $item['quantity']);
            }, 0.0);

            // Charges are calculated on the server so the saved total can't drift from its parts.
            $shippingAmazon = round((float) ($validated['shipping_amazon'] ?? 0), 2);
            $shippingActual = round((float) ($validated['shipping_actual'] ?? 0), 2);
            $tax            = round((float) ($validated['tax'] ?? 0), 2);
            $amazonFee      = round((float) ($validated['amazon_fee'] ?? 0), 2);

            $subtotal = round($itemsTotal, 2);
            // Customer total = items + Amazon shipping + tax.
            // Actual shipping and Amazon fee are internal costs and are stored but not added.
            $total = round($subtotal + $shippingAmazon + $tax, 2);

            $charges = [
                'subtotal' => $subtotal,
                'shipping_amazon' => $shippingAmazon,
                'shipping_actual' => $shippingActual,
                'tax' => $tax,
                'amazon_fee' => $amazonFee,
            ];

            $customerName = $customerNameInput !== '' ? $customerNameInput : trim(
                Str::of((string) ($validated['first_name'] ?? ''))
                    ->append(' ')
                    ->append((string) ($validated['last_name'] ?? ''))
                    ->value()
            );

            $order = null;
            $maxAttempts = 5;

            for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
                try {
                    $order = DB::transaction(function () use ($orderFrom, $status, $items, $total, $charges, $customerName, $validated) {
                        // Highest remote_id across ALL orders + 1, so a manual order never reuses an existing id.
                        $remoteId = ((int) RemoteOrder::query()->lockForUpdate()->max('remote_id')) + 1;

                        $orderNumber = trim((string) ($validated['order_number'] ?? ''));
                        if ($orderNumber === '') {
                            $orderNumber = strtoupper($orderFrom) . '-' . $remoteId;
                        }

                        $rawPayload = [
                            'id' => $remoteId,
                            'order_number' => $orderNumber,
                            'orders_from' => $orderFrom,
                            'first_name' => (string) ($validated['first_name'] ?? ''),
                            'last_name' => (string) ($validated['last_name'] ?? ''),
                            'email' => (string) ($validated['email'] ?? ''),
                            'phone' => (string) ($validated['phone'] ?? ''),
                            'address_line_1' => (string) ($validated['address_line_1'] ?? ''),
                            'city' => (string) ($validated['city'] ?? ''),
                            'state' => (string) ($validated['state'] ?? ''),
                            'postal_code' => (string) ($validated['postal_code'] ?? ''),
                            'country' => (string) ($validated['country'] ?? ''),
                            'notes' => (string) ($validated['notes'] ?? ''),
                            'status' => $status,
                            'total' => $total,
                            ...$charges,
                            'items' => $items,
                            'manually_created' => true,
                        ];

                        return RemoteOrder::query()->create([
                            'remote_id' => $remoteId,
                            'order_number' => $orderNumber,
                            'order_from' => $orderFrom,
                            'customer_name' => $customerName,
                            'total' => $total,
                            ...$charges,
                            'status' => $status,
                            'raw_payload' => $rawPayload,
                        ]);
                    });

                    break;
                } catch (QueryException $e) {
                    // SQLSTATE 23000 = duplicate key: another request took this id first.
                    // Loop again so max('remote_id') + 1 picks the next free number.
                    if ($e->getCode() !== '23000' || $attempt === $maxAttempts) {
                        throw $e;
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'order' => $order,
            ], 201);
        }

    public function productOptions(Request $request): JsonResponse
    {
        if ($response = $this->authorizeOrderAction($request, 'read', null)) {
            return $response;
        }

        $products = Product::query()
            ->with(['color:id,name,color_code', 'size:id,size'])
            ->orderBy('name')
            ->get(['id', 'name', 'color_id', 'size_id']);

        $sellingPrices = Stock::query()
            ->whereNotNull('product_id')
            ->orderByDesc('updated_at')
            ->get(['product_id', 'selling_price'])
            ->groupBy('product_id')
            ->map(fn ($rows) => (float) ($rows->first()->selling_price ?? 0));

        $variants = $products->map(fn (Product $product) => [
            'id' => $product->id,
            'name' => $product->name,
            'color_id' => $product->color_id,
            'color_name' => $product->color?->name,
            'size_id' => $product->size_id,
            'size_name' => $product->size?->size,
            'selling_price' => (float) ($sellingPrices[$product->id] ?? 0),
        ]);

        return response()->json([
            'variants' => $variants,
        ]);
    }

    public function show(Request $request, int $id, RemoteOrderSyncService $syncService, VeeqoService $veeqoService, AmazonOrderSyncService $amazonSyncService): JsonResponse
    {
        $localOrder = RemoteOrder::query()->where('id', $id)->first()
            ?? RemoteOrder::query()->where('remote_id', $id)->first();

        if ($response = $this->authorizeOrderAction($request, 'read', $localOrder?->order_from)) {
            return $response;
        }

        if ($localOrder) {
            $this->autoSyncOrderFromVeeqo($localOrder, $veeqoService);

            if ($localOrder->order_from === 'amazon') {
                try {
                    $localOrder = $amazonSyncService->hydrateMissingItems($localOrder);
                } catch (Throwable $e) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unable to load Amazon order items: '.$e->getMessage(),
                    ], 502);
                }
            }

            return response()->json([
                'success' => true,
                'order' => $localOrder->fresh(),
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

    public function sync(Request $request, RemoteOrderSyncService $syncService, AmazonOrderSyncService $amazonSyncService): JsonResponse
    {
        if ($response = $this->authorizeOrderAction($request, 'update', null)) {
            return $response;
        }

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

        try {
            $amazonResult = $amazonSyncService->syncRecent((int) ($validated['limit'] ?? 100));
            $result['stores']['amazon'] = $amazonResult;
            $result['synced_count'] = (int) ($result['synced_count'] ?? 0) + (int) ($amazonResult['synced_count'] ?? 0);
        } catch (Throwable $e) {
            $result['stores']['amazon'] = [
                'success' => false,
                'message' => $e->getMessage(),
            ];
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

            if ($remoteOrder->wasRecentlyCreated) {
                $saved++;
            } else {
                $skipped++;
            }
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

    public function update(Request $request, int $id, RemoteOrderSyncService $syncService, RemoteOrderVeeqoBookingService $bookingService, RemoteOrderRefundService $refundService): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => 'nullable|string|max:255',
            'customer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:100',
            'total' => 'nullable|numeric|min:0',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:100',
            'address_line_1' => 'nullable|string|max:255',
         
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:2000',
        ]);

        $order = RemoteOrder::query()->where('id', $id)->first()
            ?? RemoteOrder::query()->where('remote_id', $id)->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Remote order not found in local inventory database.',
            ], 404);
        }

        if ($response = $this->authorizeOrderAction($request, 'update', $order->order_from)) {
            return $response;
        }

        $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];

        $rawFields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'address_line_1',
          
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
            'total' => array_key_exists('total', $validated)
                ? (float) ($validated['total'] ?? 0)
                : $order->total,
            'raw_payload' => $rawPayload,
        ]);

        if (array_key_exists('status', $validated) && strtolower(trim((string) $validated['status'])) === 'refunded') {
            try {
                $refundService->refund($order);
            } catch (Throwable $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 502);
            }
        }

        $order->save();

        if (array_key_exists('status', $validated) && $order->remote_id > 0) {
            try {
                $syncService->pushStatusUpdate(
                    (int) $order->remote_id,
                    $syncService->mapStatusForStore((string) $validated['status']),
                    (string) ($order->order_from ?? 'website')
                );
            } catch (Throwable $e) {
                Log::warning('Failed to push status update to origin store', [
                    'remote_id' => $order->remote_id,
                    'order_from' => $order->order_from,
                    'status' => $validated['status'],
                    'message' => $e->getMessage(),
                ]);
            }
        }

        if (array_key_exists('status', $validated) && strtolower(trim((string) $validated['status'])) === 'cancelled') {
            try {
                $bookingService->cancel($order);
            } catch (Throwable $e) {
                Log::warning('Failed to cancel Veeqo booking', [
                    'remote_order_id' => $order->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Remote order updated successfully.',
            'order' => $order->fresh(),
        ]);
    }

    public function bulkUpdateStatus(Request $request, RemoteOrderVeeqoBookingService $bookingService, RemoteOrderRefundService $refundService, RemoteOrderSyncService $syncService): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
            'status' => 'required|string|max:100',
        ]);

        $orders = RemoteOrder::query()
            ->whereIn('id', $validated['ids'])
            ->get();

        foreach ($orders->pluck('order_from')->unique() as $orderFrom) {
            if ($response = $this->authorizeOrderAction($request, 'update', $orderFrom)) {
                return $response;
            }
        }

        $normalizedStatus = strtolower(trim((string) $validated['status']));
        $isCancelling = $normalizedStatus === 'cancelled';
        $isRefunding = $normalizedStatus === 'refunded';

        foreach ($orders as $order) {
            $rawPayload = is_array($order->raw_payload) ? $order->raw_payload : [];
            $rawPayload['status'] = $validated['status'];

            $order->fill([
                'status' => $validated['status'],
                'raw_payload' => $rawPayload,
            ]);
            $order->save();

            if ($order->remote_id > 0) {
                try {
                    $syncService->pushStatusUpdate(
                        (int) $order->remote_id,
                        $syncService->mapStatusForStore($validated['status']),
                        (string) ($order->order_from ?? 'website')
                    );
                } catch (Throwable $e) {
                    Log::warning('Failed to push status update to origin store', [
                        'remote_id' => $order->remote_id,
                        'order_from' => $order->order_from,
                        'status' => $validated['status'],
                        'message' => $e->getMessage(),
                    ]);
                }
            }

            if ($isCancelling) {
                try {
                    $bookingService->cancel($order);
                } catch (Throwable $e) {
                    Log::warning('Failed to cancel Veeqo booking', [
                        'remote_order_id' => $order->id,
                        'message' => $e->getMessage(),
                    ]);
                }
            }

            if ($isRefunding) {
                try {
                    $refundService->refund($order);
                } catch (Throwable $e) {
                    Log::warning('Failed to refund Stripe charge', [
                        'remote_order_id' => $order->id,
                        'message' => $e->getMessage(),
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => count($orders) . ' orders status updated successfully.',
        ]);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $orders = RemoteOrder::query()->whereIn('id', $validated['ids'])->get(['id', 'order_from']);

        foreach ($orders->pluck('order_from')->unique() as $orderFrom) {
            if ($response = $this->authorizeOrderAction($request, 'delete', $orderFrom)) {
                return $response;
            }
        }

        $deletedCount = RemoteOrder::query()
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => $deletedCount . ' orders deleted from local inventory database.',
        ]);
    }
}

