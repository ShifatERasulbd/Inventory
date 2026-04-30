<?php

namespace App\Http\Controllers;

use App\Models\Sell;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellController extends Controller
{
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

    private function formatSell(Sell $sell): array
    {
        return [
            'id' => $sell->id,
            'selling_from' => $sell->selling_from,
            'sold_to' => $sell->sold_to,
            'product_id' => $sell->product_id,
            'quantity' => (int) $sell->quantity,
            'po_number' => $sell->po_number,
            'purchase_price' => (float) $sell->purchase_price,
            'selling_price' => (float) $sell->selling_price,
            'status' => $sell->status,
            'selling_from_name' => $sell->sellingFromWarehouse?->name,
            'sold_to_name' => $sell->soldToWarehouse?->name,
            'product_name' => $sell->product?->name,
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Sell::query()
            ->with([
                'sellingFromWarehouse:id,name',
                'soldToWarehouse:id,name',
                'product:id,name',
            ]);

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

            if ($warehouseIds !== []) {
                $query->where(function ($q) use ($warehouseIds) {
                    $q->whereIn('sold_to', $warehouseIds)
                        ->orWhereIn('selling_from', $warehouseIds);
                });
            } else {
                return response()->json([]);
            }
        }

        $sells = $query
            ->orderByDesc('id')
            ->get()
            ->map(fn (Sell $sell) => $this->formatSell($sell));

        return response()->json($sells);
    }

    public function store(Request $request): JsonResponse
    {
        $soldTo = $this->resolveLoginWarehouseId($request);
        if (! $soldTo) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $validated = $request->validate([
            'selling_from' => ['required', 'integer', 'exists:warehouses,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'po_number' => ['required', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
        ]);

        $sell = Sell::query()->create([
            ...$validated,
            'sold_to' => $soldTo,
        ]);

        $sell->load([
            'sellingFromWarehouse:id,name',
            'soldToWarehouse:id,name',
            'product:id,name',
        ]);

        return response()->json($this->formatSell($sell), 201);
    }

    public function show(Request $request, Sell $sell): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

            $hasAccess = in_array($sell->sold_to, $warehouseIds, true) ||
                in_array($sell->selling_from, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to view this sell.',
                ], 403);
            }
        }

        $sell->load([
            'sellingFromWarehouse:id,name',
            'soldToWarehouse:id,name',
            'product:id,name',
        ]);

        return response()->json($this->formatSell($sell));
    }

    public function update(Request $request, Sell $sell): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

            $hasAccess = in_array($sell->sold_to, $warehouseIds, true) ||
                in_array($sell->selling_from, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to update this sell.',
                ], 403);
            }
        }

        $soldTo = $this->resolveLoginWarehouseId($request);
        if (! $soldTo) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $validated = $request->validate([
            'selling_from' => ['required', 'integer', 'exists:warehouses,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'po_number' => ['required', 'string', 'max:100'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'max:50'],
        ]);

        $sell->update([
            ...$validated,
            'sold_to' => $soldTo,
        ]);

        $sell->load([
            'sellingFromWarehouse:id,name',
            'soldToWarehouse:id,name',
            'product:id,name',
        ]);

        return response()->json($this->formatSell($sell));
    }

    public function destroy(Request $request, Sell $sell): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

            $hasAccess = in_array($sell->sold_to, $warehouseIds, true) ||
                in_array($sell->selling_from, $warehouseIds, true);

            if (! $hasAccess) {
                return response()->json([
                    'message' => 'You do not have permission to delete this sell.',
                ], 403);
            }
        }

        $sell->delete();

        return response()->json([
            'message' => 'Sell deleted successfully.',
        ]);
    }
}
