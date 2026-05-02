<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Sell;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    private function isApprovedStatus(string $status): bool
    {
        return in_array(strtolower($status), ['approve', 'approved'], true);
    }

    private function syncApprovedPurchaseToSellAndStock(Purchase $purchase): void
    {
        if (! $this->isApprovedStatus((string) $purchase->status)) {
            return;
        }

        $sell = Sell::query()->updateOrCreate(
            ['purchase_id' => $purchase->id],
            [
                'selling_from' => $purchase->purchase_form,
                'sold_to' => $purchase->purchase_to,
                'product_id' => $purchase->product_id,
                'quantity' => $purchase->quantity,
                'po_number' => $purchase->po_number,
                'purchase_price' => $purchase->purchase_price,
                'selling_price' => $purchase->selling_price,
                'status' => 'approved',
            ]
        );

        if (! $sell->wasRecentlyCreated) {
            return;
        }

        Stock::query()->firstOrCreate([
            'product_id' => $purchase->product_id,
            'warehouse_id' => $purchase->purchase_to,
            'cartoon_id' => null,
            'barcode' => null,
        ]);
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

    private function formatPurchase(Purchase $purchase): array
    {
        return [
            'id' => $purchase->id,
            'purchase_form' => $purchase->purchase_form,
            'purchase_to' => $purchase->purchase_to,
            'product_id' => $purchase->product_id,
            'quantity' => (int) $purchase->quantity,
            'po_number' => $purchase->po_number,
            'purchase_price' => (float) $purchase->purchase_price,
            'selling_price' => (float) $purchase->selling_price,
            'status' => $purchase->status,
            'purchase_form_name' => $purchase->purchaseFromWarehouse?->name,
            'purchase_to_name' => $purchase->purchaseToWarehouse?->name,
            'product_name' => $purchase->product?->name,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Purchase::query()
            ->with([
                'purchaseFromWarehouse:id,name',
                'purchaseToWarehouse:id,name',
                'product:id,name',
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
            ->get()
            ->map(fn (Purchase $purchase) => $this->formatPurchase($purchase));

        return response()->json($purchases);
    }

    public function getPurchaseRequests(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Purchase::query()
            ->where('status', 'pending')
            ->with([
                'purchaseFromWarehouse:id,name',
                'purchaseToWarehouse:id,name',
                'product:id,name',
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
            ->get()
            ->map(fn (Purchase $purchase) => $this->formatPurchase($purchase));

        return response()->json($purchaseRequests);
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
        ]);

        $purchase->update([
            'status' => $validated['status'],
        ]);

        $this->syncApprovedPurchaseToSellAndStock($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'product:id,name',
        ]);

        return response()->json($this->formatPurchase($purchase));
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'purchase_form' => ['required', 'integer', 'exists:warehouses,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'po_number' => ['required', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
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
            ...$validated,
            'purchase_to' => $purchaseTo,
        ]);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'product:id,name',
        ]);

        return response()->json($this->formatPurchase($purchase), 201);
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
            'product:id,name',
        ]);

        return response()->json($this->formatPurchase($purchase));
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
            'purchase_form' => ['required', 'integer', 'exists:warehouses,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'po_number' => ['required', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
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
            ...$validated,
            'purchase_to' => $purchaseTo,
        ]);

        $this->syncApprovedPurchaseToSellAndStock($purchase);

        $purchase->load([
            'purchaseFromWarehouse:id,name',
            'purchaseToWarehouse:id,name',
            'product:id,name',
        ]);

        return response()->json($this->formatPurchase($purchase));
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
