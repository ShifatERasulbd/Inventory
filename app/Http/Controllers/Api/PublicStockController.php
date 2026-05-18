<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicStockController extends Controller
{
    public function index(Request $request): JsonResponse
    {

        
        $validated = $request->validate([
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
        ]);

        $user = $request->user();
        $token = $user?->currentAccessToken();

        if (! $user || ! $token) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        if (! $token->can('stocks:read')) {
            return response()->json([
                'message' => 'This API key does not have stock read permission.',
            ], 403);
        }

        $tokenWarehouseIds = collect($token->abilities ?? [])
            ->filter(fn (mixed $ability): bool => is_string($ability) && str_starts_with($ability, 'warehouse:'))
            ->map(fn (string $ability): int => (int) str_replace('warehouse:', '', $ability))
            ->filter(fn (int $warehouseId): bool => $warehouseId > 0)
            ->values()
            ->all();

        $userWarehouseIds = is_array($user->warehouse_ids)
            ? array_values(array_unique(array_map('intval', $user->warehouse_ids)))
            : [];

        $allowedWarehouseIds = $user->hasRole('super-admin')
            ? $tokenWarehouseIds
            : array_values(array_intersect($userWarehouseIds, $tokenWarehouseIds));

        if ($user->hasRole('super-admin') && $allowedWarehouseIds === []) {
            // Super admin keys without explicit warehouse:* abilities can access all warehouses.
            $allowedWarehouseIds = [];
        }

        if (! $user->hasRole('super-admin') && $allowedWarehouseIds === []) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'allowed_warehouse_ids' => [],
                ],
            ]);
        }

        $query = Stock::query()
            ->with([
                'product:id,name,size_id,color_id,cover_image',
                'product.size:id,size',
                'product.color:id,name,color_code',
                'warehouse:id,name',
            ])
            ->orderBy('id');

        if ($allowedWarehouseIds !== []) {
            $query->whereIn('warehouse_id', $allowedWarehouseIds);
        }

        if (array_key_exists('warehouse_id', $validated) && $validated['warehouse_id'] !== null) {
            if ($allowedWarehouseIds !== [] && ! in_array((int) $validated['warehouse_id'], $allowedWarehouseIds, true)) {
                return response()->json([
                    'message' => 'You do not have access to this warehouse.',
                ], 403);
            }

            $query->where('warehouse_id', $validated['warehouse_id']);
        }

        $stocks = $query->get()->map(fn (Stock $stock): array => [
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'product_name' => $stock->product?->name,
            'product_color_name' => $stock->product?->color?->name,
            'product_size' => $stock->product?->size?->size,
            'cover_image_url' => $stock->product?->cover_image_url
                ? (str_starts_with($stock->product->cover_image_url, 'http') ? $stock->product->cover_image_url : rtrim(config('app.url'), '/') . $stock->product->cover_image_url)
                : null,
            'warehouse_id' => $stock->warehouse_id,
            'warehouse_name' => $stock->warehouse?->name,
            'size' => $stock->product?->size?->size,
            'color_variant' => $stock->product?->color?->color_code ?? $stock->product?->color?->name,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'barcode' => $stock->barcode,
            'updated_at' => $stock->updated_at,
        ]);

        return response()->json([
            'data' => $stocks,
            'meta' => [
                'allowed_warehouse_ids' => $allowedWarehouseIds,
            ],
        ]);
    }
}
