<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(): JsonResponse
    {
        $stocks = Stock::query()
            ->with('product:id,name')
            ->orderBy('id')
            ->get()
            ->map(fn (Stock $stock) => [
                'id' => $stock->id,
                'product_id' => $stock->product_id,
                'warehouse_id' => $stock->warehouse_id,
                'cartoon_id' => $stock->cartoon_id,
                'barcode' => $stock->barcode,
                'stocks' => (int) ($stock->stocks ?? 0),
                'available_stock' => (int) ($stock->stocks ?? 0),
                'name' => $stock->product?->name,
            ]);

        return response()->json($stocks);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'stocks' => ['required_without:available_stock', 'integer', 'min:0'],
            'available_stock' => ['required_without:stocks', 'integer', 'min:0'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'cartoon_id' => ['nullable', 'integer', 'exists:cartoons,id'],
            'barcode' => ['nullable', 'string', 'max:200'],
        ]);

        $stock = Stock::query()->create([
            'product_id' => $validated['product_id'],
            'stocks' => (int) ($validated['stocks'] ?? $validated['available_stock'] ?? 0),
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'cartoon_id' => $validated['cartoon_id'] ?? null,
            'barcode' => $validated['barcode'] ?? null,
        ]);
        $stock->load('product:id,name');

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'name' => $stock->product?->name,
        ], 201);
    }

    public function show(Stock $stock): JsonResponse
    {
        $stock->load('product:id,name');

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'name' => $stock->product?->name,
        ]);
    }

    public function update(Request $request, Stock $stock): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'stocks' => ['sometimes', 'required', 'integer', 'min:0'],
            'available_stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'warehouse_id' => ['sometimes', 'nullable', 'integer', 'exists:warehouses,id'],
            'cartoon_id' => ['sometimes', 'nullable', 'integer', 'exists:cartoons,id'],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:200'],
        ]);

        $stock->update([
            'product_id' => array_key_exists('product_id', $validated) ? $validated['product_id'] : $stock->product_id,
            'stocks' => (int) ($validated['stocks'] ?? $validated['available_stock'] ?? $stock->stocks),
            'warehouse_id' => array_key_exists('warehouse_id', $validated) ? $validated['warehouse_id'] : $stock->warehouse_id,
            'cartoon_id' => array_key_exists('cartoon_id', $validated) ? $validated['cartoon_id'] : $stock->cartoon_id,
            'barcode' => array_key_exists('barcode', $validated) ? $validated['barcode'] : $stock->barcode,
        ]);
        $stock->load('product:id,name');

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'name' => $stock->product?->name,
        ]);
    }

    public function destroy(Stock $stock): JsonResponse
    {
        $stock->delete();

        return response()->json([
            'message' => 'Stock deleted successfully.',
        ]);
    }
}