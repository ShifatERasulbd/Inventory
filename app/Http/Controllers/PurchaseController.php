<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Cartoon;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\Stock;
use App\Models\WareHouse;
use App\Services\AccountingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    private function normalizePurchaseProducts(array $items): array
    {
        return array_values(array_map(function (array $item): array {
            $quantity = max(0, (int) ($item['quantity'] ?? 0));
            $purchasePrice = max(0, (float) ($item['purchase_price'] ?? 0));
            $sellingPrice = is_numeric($item['selling_price'] ?? null)
                ? max(0, (float) $item['selling_price'])
                : $purchasePrice;

            return [
                'product_id' => (int) ($item['product_id'] ?? 0),
                'quantity' => $quantity,
                'purchase_price' => $purchasePrice,
                'selling_price' => $sellingPrice,
                'line_total' => $quantity * $purchasePrice,
            ];
        }, $items));
    }

    private function calculatePurchaseFinancials(array $products, mixed $paidAmountInput = null): array
    {
        $subtotal = array_reduce($products, function (float $carry, array $item): float {
            return $carry + ((float) ($item['line_total'] ?? 0));
        }, 0.0);

        $totalAmount = $subtotal;
        $paidAmount = is_numeric($paidAmountInput) ? max(0, (float) $paidAmountInput) : 0.0;
        $dueAmount = max(0, $totalAmount - $paidAmount);

        $paymentStatus = $paidAmount <= 0
            ? 'unpaid'
            : ($dueAmount <= 0 ? 'paid' : 'partial');

        return [
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
            'paid_amount' => min($paidAmount, $totalAmount),
            'due_amount' => $dueAmount,
            'payment_status' => $paymentStatus,
        ];
    }

    private function isApprovedStatus(string $status): bool
    {
        return in_array(strtolower($status), ['approve', 'approved', 'active'], true);
    }

    private function isReceivedStatus(string $status): bool
    {
        return strtolower($status) === 'received';
    }

    private function isShippedStatus(string $status): bool
    {
        return strtolower($status) === 'shipped';
    }

    private function normalizeStatusDates(array $validated, ?Purchase $existingPurchase = null): array
    {
        if (($validated['shipping_date'] ?? null) === '' || ! array_key_exists('shipping_date', $validated)) {
            $validated['shipping_date'] = $existingPurchase?->shipping_date?->format('Y-m-d');
        }

        if (($validated['received_date'] ?? null) === '' || ! array_key_exists('received_date', $validated)) {
            $validated['received_date'] = $existingPurchase?->received_date?->format('Y-m-d');
        }

        return $validated;
    }

    private function applyTransitionStatusDates(array $validated, string $previousStatus): array
    {
        $currentStatus = strtolower((string) ($validated['status'] ?? ''));
        $previous = strtolower((string) $previousStatus);

        if ($previous === 'approved' && $currentStatus === 'shipped' && empty($validated['shipping_date'])) {
            $validated['shipping_date'] = Carbon::today()->toDateString();
        }

        if ($previous === 'shipped' && $currentStatus === 'received' && empty($validated['received_date'])) {
            $validated['received_date'] = Carbon::today()->toDateString();
        }

        return $validated;
    }

    private function syncReceivedPurchaseToCartoonWarehouse(Purchase $purchase): void
    {
        if (! $this->isReceivedStatus((string) $purchase->status)) {
            return;
        }

        if (! $purchase->purchase_form) {
            return;
        }

        Cartoon::query()
            ->where('p_o_number', $purchase->id)
            ->update([
                'warehouse_id' => (int) $purchase->purchase_form,
            ]);
    }

    private function syncReceivedPurchaseToDestinationStock(Purchase $purchase, ?string $previousStatus = null): void
    {
        if (! $this->isReceivedStatus((string) $purchase->status)) {
            return;
        }

        if ($previousStatus !== null && $this->isReceivedStatus($previousStatus)) {
            return;
        }

        $warehouseId = (int) ($purchase->purchase_to ?? 0);
        $purchaseBrandId = $purchase->brand_id ? (int) $purchase->brand_id : null;
        if ($warehouseId <= 0) {
            return;
        }

        $items = is_array($purchase->products) ? $purchase->products : [];
        if ($items === []) {
            return;
        }

        DB::transaction(function () use ($items, $warehouseId, $purchaseBrandId): void {
            foreach ($items as $item) {
                $productId = (int) ($item['product_id'] ?? 0);
                $quantity = (int) ($item['quantity'] ?? $item['stocks'] ?? 0);
                $buyingPrice = (float) ($item['purchase_price'] ?? 0);
                $sellingPrice = (float) ($item['selling_price'] ?? 0);

                if ($productId <= 0 || $quantity <= 0) {
                    continue;
                }

                // Get product barcode
                $product = Product::query()
                    ->select('id', 'barCode')
                    ->find($productId);

                $barcode = $product?->barCode ? trim((string) $product->barCode) : null;
                $barcodes = [];

                // Create array of barcodes for each unit
                if ($barcode) {
                    $barcodes = array_fill(0, $quantity, $barcode);
                }

                $stock = Stock::query()
                    ->where('product_id', $productId)
                    ->where(function ($query) use ($purchaseBrandId) {
                        if ($purchaseBrandId === null) {
                            $query->whereNull('brand_id');
                        } else {
                            $query->where('brand_id', $purchaseBrandId);
                        }
                    })
                    ->whereNull('cartoon_id')
                    ->lockForUpdate()
                    ->first();

                if (! $stock) {
                    Stock::query()->create([
                        'product_id' => $productId,
                        'warehouse_id' => $warehouseId,
                        'brand_id' => $purchaseBrandId,
                        'stocks' => $quantity,
                        'buying_price' => $buyingPrice,
                        'selling_price' => $sellingPrice,
                        'cartoon_id' => null,
                        'barcode' => $barcodes ?: null,
                    ]);
                    continue;
                }

                // Merge existing barcodes with new ones
                $existingBarcodes = is_array($stock->barcode) ? $stock->barcode : [];
                $updatedBarcodes = array_merge($existingBarcodes, $barcodes);

                $stock->update([
                    'stocks' => ((int) $stock->stocks) + $quantity,
                    'buying_price' => $buyingPrice,
                    'selling_price' => $sellingPrice,
                    'barcode' => $updatedBarcodes ?: null,
                ]);
            }
        });
    }

    private function syncApprovedPurchaseToSellAndStock(Purchase $purchase): void
    {
        
        if (! $this->isApprovedStatus((string) $purchase->status)) {
            return;
        }

        $products = is_array($purchase->products) ? $purchase->products : [];

        foreach ($products as $item) {
            $productId    = (int) ($item['product_id'] ?? 0);
            $quantity     = (int) ($item['quantity'] ?? $item['stocks'] ?? 0);
            $purchasePrice = (float) ($item['purchase_price'] ?? 0);
            $sellingPrice  = (float) ($item['selling_price'] ?? 0);

            if ($productId <= 0) {
                continue;
            }

            $sell = Sell::query()->updateOrCreate(
                ['purchase_id' => $purchase->id, 'product_id' => $productId],
                [
                    'selling_from'   => $purchase->purchase_form,
                    'sold_to'        => $purchase->purchase_to,
                    'brand_id'       => $purchase->brand_id,
                    'product_id'     => $productId,
                    'quantity'       => $quantity,
                    'po_number'      => $purchase->po_number,
                    'purchase_price' => $purchasePrice,
                    'selling_price'  => $sellingPrice,
                    'status'         => 'approved',
                ]
            );

            app(AccountingService::class)->syncSellAccount($sell);

            if (! $sell->wasRecentlyCreated) {
                continue;
            }
        }
    }

    private function resolvePurchaseTo(Request $request, array $validated): ?int
    {
        if ($request->user()?->hasRole('super-admin')) {
            $purchaseTo = $validated['purchase_to'] ?? null;

            return is_int($purchaseTo) || ctype_digit((string) $purchaseTo)
                ? (int) $purchaseTo
                : null;
        }

        return $this->resolveLoginWarehouseId($request);
    }

    private function resolveLoginWarehouseId(Request $request): ?int
    {
        $warehouseIds = $request->user()?->warehouse_ids;

        if (! is_array($warehouseIds) || $warehouseIds === []) {
            return null;
        }

        $warehouseId = $warehouseIds[0] ?? null;

        return is_int($warehouseId) || ctype_digit((string) $warehouseId)
            ? (int) $warehouseId
            : null;
    }

    /**
     * Resolve warehouse IDs accessible to a user, including default warehouse if no explicit warehouses set.
     */
    private function resolveUserWarehouseIds($user): array
    {
        if ($user->hasRole('super-admin')) {
            return []; // Super-admin has no restrictions
        }

        $ids = is_array($user->warehouse_ids)
            ? array_values(array_unique(array_filter(array_map('intval', $user->warehouse_ids), fn (int $id) => $id > 0)))
            : [];

        // If user has no explicit warehouse_ids but has a default warehouse, include it
        if (empty($ids) && ! empty($user->warehouse_id)) {
            $ids = [(int) $user->warehouse_id];
        }

        return $ids;
    }

    private function buildProductMap(array $purchases): array
    {
        $productIds = [];
        foreach ($purchases as $purchase) {
            $items = is_array($purchase->products) ? $purchase->products : [];
            foreach ($items as $item) {
                $id = (int) ($item['product_id'] ?? 0);
                if ($id > 0) {
                    $productIds[] = $id;
                }
            }
        }

        if (empty($productIds)) {
            return [];
        }

        return Product::query()
            ->with(['size:id,size', 'color:id,name'])
            ->whereIn('id', array_unique($productIds))
            ->get(['id', 'name', 'size_id', 'color_id'])
            ->mapWithKeys(fn (Product $product) => [
                $product->id => [
                    'name' => $product->name,
                    'size' => $product->size?->size,
                    'color' => $product->color?->name,
                ],
            ])
            ->all();
    }

    private function formatPurchase(Purchase $purchase, array $productMap = []): array
    {
        $products = is_array($purchase->products) ? $purchase->products : [];

        $formattedProducts = array_values(array_map(function ($item) use ($productMap) {
            $productId = (int) ($item['product_id'] ?? 0);
            $productData = $productMap[$productId] ?? null;
            $quantity = (int) ($item['quantity'] ?? 0);
            $purchasePrice = (float) ($item['purchase_price'] ?? 0);

            return [
                'product_id'     => $productId,
                'quantity'       => $quantity,
                'purchase_price' => $purchasePrice,
                'selling_price'  => (float) ($item['selling_price'] ?? 0),
                'line_total'     => (float) ($item['line_total'] ?? ($quantity * $purchasePrice)),
                'product_name'   => is_array($productData) ? ($productData['name'] ?? null) : null,
                'size'           => is_array($productData) ? ($productData['size'] ?? null) : null,
                'color'          => is_array($productData) ? ($productData['color'] ?? null) : null,
            ];
        }, $products));

        $computedSubtotal = array_reduce($formattedProducts, function (float $carry, array $item): float {
            return $carry + ((float) ($item['line_total'] ?? 0));
        }, 0.0);

        $subtotal = (float) ($purchase->subtotal ?? 0);
        if ($subtotal <= 0 && $computedSubtotal > 0) {
            $subtotal = $computedSubtotal;
        }

        $totalAmount = (float) ($purchase->total_amount ?? 0);
        if ($totalAmount <= 0 && $subtotal > 0) {
            $totalAmount = $subtotal;
        }

        $paidAmount = (float) ($purchase->paid_amount ?? 0);
        $dueAmount = (float) ($purchase->due_amount ?? max(0, $totalAmount - $paidAmount));
        if ($totalAmount > 0 && $dueAmount <= 0 && $paidAmount < $totalAmount) {
            $dueAmount = max(0, $totalAmount - $paidAmount);
        }

        $paymentStatus = (string) ($purchase->payment_status ?? '');
        if ($paymentStatus === '' || strtolower($paymentStatus) === 'pending') {
            $paymentStatus = $paidAmount > 0
                ? ($dueAmount <= 0 ? 'paid' : 'partial')
                : 'unpaid';
        }

        return [
            'id'                 => $purchase->id,
            'purchase_form'      => $purchase->purchase_form,
            'purchase_to'        => $purchase->purchase_to,
            'brand_id'           => $purchase->brand_id,
            'brand_name'         => $purchase->brand?->name,
            'products'           => $formattedProducts,
            'subtotal'           => $subtotal,
            'total_amount'       => $totalAmount,
            'paid_amount'        => $paidAmount,
            'due_amount'         => $dueAmount,
            'payment_status'     => $paymentStatus,
            'payment_method'     => $purchase->payment_method,
            'po_number'          => $purchase->po_number,
            'po_date'            => $purchase->created_at?->format('Y-m-d'),
            'status'             => $purchase->status,
            'shipping_date'      => $purchase->shipping_date?->format('Y-m-d'),
            'received_date'      => $purchase->received_date?->format('Y-m-d'),
            'note'               => $purchase->note,
            'purchase_form_name' => $purchase->purchaseFromWarehouse?->name,
            'purchase_to_name'   => $purchase->purchaseToWarehouse?->name,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Purchase::query()
            ->with([
                'purchaseFromWarehouse:id,name',
                'purchaseToWarehouse:id,name',
                'brand:id,name',
            ]);

        // Filter by permission: only super-admins see all purchases
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            if ($warehouseIds !== []) {
                $query->where(function ($q) use ($warehouseIds) {
                    $q->whereIn('purchase_to', $warehouseIds)
                      ->orWhereIn('purchase_form', $warehouseIds);
                });
            } else {
                // User has no warehouses assigned, return empty
                return response()->json([]);
            }
        }

        $purchases = $query
            ->orderByDesc('id')
            ->get();

        $productMap = $this->buildProductMap($purchases->all());

        return response()->json(
            $purchases->map(fn (Purchase $purchase) => $this->formatPurchase($purchase, $productMap))
        );
    }

    public function getFormOptions(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('super-admin') || $user->hasPermission('read-warehouses')) {
            $warehouses = WareHouse::query()->orderBy('name')->get(['id', 'name']);
        } else {
            $warehouseIds = $this->resolveUserWarehouseIds($user);
            $warehouses = empty($warehouseIds)
                ? collect()
                : WareHouse::query()->whereIn('id', $warehouseIds)->orderBy('name')->get(['id', 'name']);
        }

        $products = Product::query()
            ->with([
                'color:id,name,color_code',
                'size:id,size',
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'color_id', 'size_id']);

        $brands = Brand::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $stockSellingPrices = [];
        $stockQuantities = [];
        $stocks = Stock::query()
            ->whereNull('cartoon_id')
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get(['warehouse_id', 'product_id', 'brand_id', 'stocks', 'selling_price']);

        foreach ($stocks as $stock) {
            $warehouseId = (int) ($stock->warehouse_id ?? 0);
            $productId = (int) ($stock->product_id ?? 0);
            $brandId = $stock->brand_id ? (int) $stock->brand_id : null;

            if ($warehouseId <= 0 || $productId <= 0) {
                continue;
            }

            $brandSegment = $brandId === null ? 'none' : (string) $brandId;
            $key = $warehouseId.':'.$productId.':'.$brandSegment;

            if (! array_key_exists($key, $stockSellingPrices)) {
                $stockSellingPrices[$key] = (float) ($stock->selling_price ?? 0);
            }

            $stockQuantities[$key] = (int) ($stockQuantities[$key] ?? 0) + max(0, (int) ($stock->stocks ?? 0));
        }

        return response()->json([
            'warehouses' => $warehouses,
            'products' => $products,
            'brands' => $brands,
            'stock_selling_prices' => $stockSellingPrices,
            'stock_quantities' => $stockQuantities,
        ]);
    }

    public function getPurchaseRequests(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Purchase::query()
            ->where('status', 'pending')
            ->with([
                'purchaseFromWarehouse:id,name',
                'purchaseToWarehouse:id,name',
                'brand:id,name',
            ]);

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            if ($warehouseIds === []) {
                return response()->json([]);
            }

            $query->whereIn('purchase_form', $warehouseIds);
        }

        $purchaseRequests = $query
            ->orderByDesc('id')
            ->get();

        $productMap = $this->buildProductMap($purchaseRequests->all());

        return response()->json(
            $purchaseRequests->map(fn (Purchase $purchase) => $this->formatPurchase($purchase, $productMap))
        );
    }

    public function updateRequestStatus(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();
        $previousStatus = (string) $purchase->status;

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            $hasAccess = in_array($purchase->purchase_to, $warehouseIds, true) ||
                in_array($purchase->purchase_form, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to update this purchase request status.',
                ], 403);
            }
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'max:50'],
            'shipping_date' => ['sometimes', 'nullable', 'date'],
            'received_date' => ['sometimes', 'nullable', 'date'],
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $validated = $this->normalizeStatusDates($validated, $purchase);
        $validated = $this->applyTransitionStatusDates($validated, $previousStatus);

        $updatePayload = [
            'status' => $validated['status'],
            'shipping_date' => $validated['shipping_date'] ?? null,
            'received_date' => $validated['received_date'] ?? null,
        ];

        if (array_key_exists('note', $validated)) {
            $updatePayload['note'] = $validated['note'];
        }

        $purchase->update($updatePayload);

        app(AccountingService::class)->syncPurchaseAccount($purchase->fresh());

        $this->syncApprovedPurchaseToSellAndStock($purchase);
        $this->syncReceivedPurchaseToCartoonWarehouse($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'brand:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap));
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'purchase_form'                    => ['required', 'integer', 'exists:warehouses,id'],
            'brand_id'                         => ['required', 'integer', 'exists:brands,id'],
            'products'                         => ['required', 'array', 'min:1'],
            'products.*.product_id'            => ['required', 'integer', 'exists:products,id'],
            'products.*.quantity'              => ['required', 'integer', 'min:1'],
            'products.*.purchase_price'        => ['required', 'numeric', 'min:0'],
            'products.*.selling_price'         => ['nullable', 'numeric', 'min:0'],
            'po_number'                        => ['required', 'string', 'max:100'],
            'status'                           => ['required', 'string', 'max:50'],
            'shipping_date'                    => ['nullable', 'date'],
            'received_date'                    => ['nullable', 'date'],
            'paid_amount'                      => ['nullable', 'numeric', 'min:0'],
            'payment_method'                   => ['nullable', 'string', 'max:50'],
        ];

        if ($request->user()?->hasRole('super-admin')) {
            $rules['purchase_to'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);
        $validated = $this->normalizeStatusDates($validated);
        $validated['products'] = $this->normalizePurchaseProducts($validated['products'] ?? []);
        $financials = $this->calculatePurchaseFinancials($validated['products'], $validated['paid_amount'] ?? null);

        if (is_numeric($validated['paid_amount'] ?? null) && (float) $validated['paid_amount'] > (float) $financials['total_amount']) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'paid_amount' => ['Paid amount cannot exceed total PO amount.'],
                ],
            ], 422);
        }

        $purchaseTo = $this->resolvePurchaseTo($request, $validated);
        if (! $purchaseTo) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $purchase = Purchase::query()->create([
            'purchase_form' => $validated['purchase_form'],
            'purchase_to'   => $purchaseTo,
            'brand_id'      => $validated['brand_id'],
            'products'      => $validated['products'],
            'subtotal'      => $financials['subtotal'],
            'total_amount'  => $financials['total_amount'],
            'paid_amount'   => $financials['paid_amount'],
            'due_amount'    => $financials['due_amount'],
            'payment_status'=> $financials['payment_status'],
            'payment_method'=> $validated['payment_method'] ?? null,
            'po_number'     => $validated['po_number'],
            'status'        => $validated['status'],
            'shipping_date' => $validated['shipping_date'] ?? null,
            'received_date' => $validated['received_date'] ?? null,
        ]);

        app(AccountingService::class)->syncPurchaseAccount($purchase->fresh());

        $this->syncApprovedPurchaseToSellAndStock($purchase);
        $this->syncReceivedPurchaseToCartoonWarehouse($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'brand:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap), 201);
    }

    public function show(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();

        // Check permission: super-admin or user's warehouse involved
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            $hasAccess = in_array($purchase->purchase_to, $warehouseIds, true) ||
                        in_array($purchase->purchase_form, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to view this purchase.',
                ], 403);
            }
        }

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'brand:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap));
    }

    public function update(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();
        $previousStatus = (string) $purchase->status;

        // Check permission: super-admin or user's warehouse involved
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            $hasAccess = in_array($purchase->purchase_to, $warehouseIds, true) ||
                        in_array($purchase->purchase_form, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to update this purchase.',
                ], 403);
            }
        }

        $rules = [
            'purchase_form'             => ['required', 'integer', 'exists:warehouses,id'],
            'purchase_to'               => ['required', 'integer', 'exists:warehouses,id'],
            'brand_id'                  => ['required', 'integer', 'exists:brands,id'],
            'products'                  => ['required', 'array', 'min:1'],
            'products.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'products.*.quantity'       => ['required', 'integer', 'min:1'],
            'products.*.purchase_price' => ['required', 'numeric', 'min:0'],
            'products.*.selling_price'  => ['nullable', 'numeric', 'min:0'],
            'po_number'                 => ['required', 'string', 'max:100'],
            'status'                    => ['required', 'string', 'max:50'],
            'shipping_date'             => ['nullable', 'date'],
            'received_date'             => ['nullable', 'date'],
            'note'                      => ['nullable', 'string', 'max:2000'],
            'paid_amount'               => ['nullable', 'numeric', 'min:0'],
            'payment_method'            => ['nullable', 'string', 'max:50'],
        ];

      

        $validated = $request->validate($rules);
        $validated = $this->normalizeStatusDates($validated, $purchase);
        $validated = $this->applyTransitionStatusDates($validated, $previousStatus);
        $validated['products'] = $this->normalizePurchaseProducts($validated['products'] ?? []);
        $financials = $this->calculatePurchaseFinancials($validated['products'], $validated['paid_amount'] ?? null);

        if (is_numeric($validated['paid_amount'] ?? null) && (float) $validated['paid_amount'] > (float) $financials['total_amount']) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'paid_amount' => ['Paid amount cannot exceed total PO amount.'],
                ],
            ], 422);
        }

        $purchase->update([
            'purchase_form' => $validated['purchase_form'],
            'purchase_to'   => $validated['purchase_to'],
            'brand_id'      => $validated['brand_id'],
            'products'      => $validated['products'],
            'subtotal'      => $financials['subtotal'],
            'total_amount'  => $financials['total_amount'],
            'paid_amount'   => $financials['paid_amount'],
            'due_amount'    => $financials['due_amount'],
            'payment_status'=> $financials['payment_status'],
            'payment_method'=> $validated['payment_method'] ?? null,
            'po_number'     => $validated['po_number'],
            'status'        => $validated['status'],
            'shipping_date' => $validated['shipping_date'] ?? null,
            'received_date' => $validated['received_date'] ?? null,
            'note'          => $validated['note'] ?? null,
        ]);

        app(AccountingService::class)->syncPurchaseAccount($purchase->fresh());

        $this->syncApprovedPurchaseToSellAndStock($purchase);
        $this->syncReceivedPurchaseToCartoonWarehouse($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'brand:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap));
    }

    public function destroy(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();

        // Check permission: super-admin or user's warehouse involved
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            $hasAccess = in_array($purchase->purchase_to, $warehouseIds, true) ||
                        in_array($purchase->purchase_form, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to delete this purchase.',
                ], 403);
            }
        }

        $purchase->delete();

        app(AccountingService::class)->deleteSourceAccount('purchase', (int) $purchase->id);

        return response()->json([
            'message' => 'Purchase deleted successfully.',
        ]);
    }
}
