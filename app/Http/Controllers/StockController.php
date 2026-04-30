<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Product::query()
                ->select(['id', 'name', 'available_stock'])
                ->orderBy('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'available_stock' => ['required', 'integer', 'min:0'],
        ]);

        $stock = Product::query()->create($validated);

        return response()->json([
            'id' => $stock->id,
            'name' => $stock->name,
            'available_stock' => $stock->available_stock,
        ], 201);
    }

    public function show(Product $stock): JsonResponse
    {
        return response()->json([
            'id' => $stock->id,
            'name' => $stock->name,
            'available_stock' => (int) ($stock->available_stock ?? 0),
        ]);
    }

    public function update(Request $request, Product $stock): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
            'available_stock' => ['required', 'integer', 'min:0'],
        ]);

        $stock->update($validated);

        return response()->json([
            'id' => $stock->id,
            'name' => $stock->name,
            'available_stock' => (int) ($stock->available_stock ?? 0),
        ]);
    }

    public function destroy(Product $stock): JsonResponse
    {
        $stock->delete();

        return response()->json([
            'message' => 'Stock deleted successfully.',
        ]);
    }
}