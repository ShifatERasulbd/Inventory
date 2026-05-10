<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sell;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    private function isApprovedStatus(string $status): bool
    {
        return in_array(strtolower($status), ['approve', 'approved', 'active'], true);
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
                    'product_id'     => $productId,
                    'quantity'       => $quantity,
                    'po_number'      => $purchase->po_number,
                    'purchase_price' => $purchasePrice,
                    'selling_price'  => $sellingPrice,
                    'status'         => 'approved',
                ]
            );

            if (! $sell->wasRecentlyCreated) {
                continue;
            }

            $stock = Stock::query()->where([
                'product_id'   => $productId,
                'warehouse_id' => $purchase->purchase_to,
            ])->first();

            if ($stock) {
                $stock->update([
                    'stocks' => (int) ($stock->stocks ?? 0) + max($quantity, 0),
                ]);
                continue;
            }

            Stock::query()->create([
                'product_id'   => $productId,
                'warehouse_id' => $purchase->purchase_to,
                'stocks'       => max(0, 0),
                'cartoon_id'   => null,
                'barcode'      => null,
            ]);
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
            ->with(['size:id,size'])
            ->whereIn('id', array_unique($productIds))
            ->get(['id', 'name', 'size_id'])
            ->mapWithKeys(fn (Product $product) => [
                $product->id => [
                    'name' => $product->name,
                    'size' => $product->size?->size,
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

            return [
                'product_id'     => $productId,
                'quantity'       => (int) ($item['quantity'] ?? 0),
                'purchase_price' => (float) ($item['purchase_price'] ?? 0),
                'selling_price'  => (float) ($item['selling_price'] ?? 0),
                'product_name'   => is_array($productData) ? ($productData['name'] ?? null) : null,
                'size'           => is_array($productData) ? ($productData['size'] ?? null) : null,
            ];
        }, $products));

        return [
            'id'                 => $purchase->id,
            'purchase_form'      => $purchase->purchase_form,
            'purchase_to'        => $purchase->purchase_to,
            'products'           => $formattedProducts,
            'po_number'          => $purchase->po_number,
            'status'             => $purchase->status,
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
            ]);

        // Filter by permission: only super-admins see all purchases
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

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

    public function getPurchaseRequests(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Purchase::query()
            ->where('status', 'pending')
            ->with([
                'purchaseFromWarehouse:id,name',
                'purchaseToWarehouse:id,name',
            ]);

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

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

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

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
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $updatePayload = [
            'status' => $validated['status'],
        ];

        if (array_key_exists('note', $validated)) {
            $updatePayload['note'] = $validated['note'];
        }

        $purchase->update($updatePayload);

        $this->syncApprovedPurchaseToSellAndStock($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap));
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'purchase_form'                    => ['required', 'integer', 'exists:warehouses,id'],
            'products'                         => ['required', 'array', 'min:1'],
            'products.*.product_id'            => ['required', 'integer', 'exists:products,id'],
            'products.*.quantity'              => ['required', 'integer', 'min:1'],
            'products.*.purchase_price'        => ['required', 'numeric', 'min:0'],
            'products.*.selling_price'         => ['required', 'numeric', 'min:0'],
            'po_number'                        => ['required', 'string', 'max:100'],
            'status'                           => ['required', 'string', 'max:50'],
        ];

        if ($request->user()?->hasRole('super-admin')) {
            $rules['purchase_to'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);

        $purchaseTo = $this->resolvePurchaseTo($request, $validated);
        if (! $purchaseTo) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $purchase = Purchase::query()->create([
            'purchase_form' => $validated['purchase_form'],
            'purchase_to'   => $purchaseTo,
            'products'      => $validated['products'],
            'po_number'     => $validated['po_number'],
            'status'        => $validated['status'],
        ]);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap), 201);
    }

    public function show(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();

        // Check permission: super-admin or user's warehouse involved
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

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
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap));
    }

    public function update(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();

        // Check permission: super-admin or user's warehouse involved
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

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
            'products'                  => ['required', 'array', 'min:1'],
            'products.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'products.*.quantity'       => ['required', 'integer', 'min:1'],
            'products.*.purchase_price' => ['required', 'numeric', 'min:0'],
            'products.*.selling_price'  => ['required', 'numeric', 'min:0'],
            'po_number'                 => ['required', 'string', 'max:100'],
            'status'                    => ['required', 'string', 'max:50'],
            'note'                      => ['nullable', 'string', 'max:2000'],
        ];

        if ($user?->hasRole('super-admin')) {
            $rules['purchase_to'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);

        $purchaseTo = $this->resolvePurchaseTo($request, $validated);
        if (! $purchaseTo) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $purchase->update([
            'purchase_form' => $validated['purchase_form'],
            'purchase_to'   => $purchaseTo,
            'products'      => $validated['products'],
            'po_number'     => $validated['po_number'],
            'status'        => $validated['status'],
            'note'          => $validated['note'] ?? null,
        ]);

        $this->syncApprovedPurchaseToSellAndStock($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
        ]);

        $productMap = $this->buildProductMap([$purchase]);

        return response()->json($this->formatPurchase($purchase, $productMap));
    }

    public function destroy(Request $request, Purchase $purchase): JsonResponse
    {
        $user = $request->user();

        // Check permission: super-admin or user's warehouse involved
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

            $hasAccess = in_array($purchase->purchase_to, $warehouseIds, true) ||
                        in_array($purchase->purchase_form, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to delete this purchase.',
                ], 403);
            }
        }

        $purchase->delete();

        return response()->json([
            'message' => 'Purchase deleted successfully.',
        ]);
    }
}
