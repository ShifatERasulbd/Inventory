<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    private function normalizeBarcodes(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        if (is_string($value)) {
            $barcodes = [];
            foreach (explode(',', $value) as $part) {
                $normalized = trim($part);
                if ($normalized !== '') {
                    $barcodes[] = $normalized;
                }
            }

            return $barcodes;
        }

        if (is_array($value)) {
            $barcodes = [];
            foreach ($value as $barcode) {
                if (! is_scalar($barcode)) {
                    continue;
                }
                $normalized = trim((string) $barcode);
                if ($normalized !== '') {
                    $barcodes[] = $normalized;
                }
            }

            return $barcodes;
        }

        return [];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Stock::query()
            ->with(['product:id,name,size_id', 'product.size:id,size', 'warehouse:id,name'])
            ->orderBy('id');

        $user = $request->user();

        if ($user && ! $user->hasRole('super-admin')) {
            $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];

            if ($warehouseIds === []) {
                return response()->json([]);
            }

            $query->whereIn('warehouse_id', $warehouseIds);
        }

        $stocks = $query
            ->get()
            ->map(fn (Stock $stock) => [
                'id' => $stock->id,
                'product_id' => $stock->product_id,
                'warehouse_id' => $stock->warehouse_id,
                'warehouse_name' => $stock->warehouse?->name,
                'cartoon_id' => $stock->cartoon_id,
                'barcode' => $stock->barcode,
                'stocks' => (int) ($stock->stocks ?? 0),
                'available_stock' => (int) ($stock->stocks ?? 0),
                'name' => $stock->product?->name,
                'size' => $stock->product?->size?->size,
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
            'barcode' => ['nullable'],
        ]);

        $barcodes = $this->normalizeBarcodes($validated['barcode'] ?? null);
        $stockCount = count($barcodes) > 0
            ? count($barcodes)
            : (int) ($validated['stocks'] ?? $validated['available_stock'] ?? 0);

        $stock = Stock::query()->create([
            'product_id' => $validated['product_id'],
            'stocks' => $stockCount,
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'cartoon_id' => $validated['cartoon_id'] ?? null,
            'barcode' => count($barcodes) > 0 ? $barcodes : null,
        ]);
        $stock->load(['product:id,name,size_id', 'product.size:id,size']);

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'name' => $stock->product?->name,
            'size' => $stock->product?->size?->size,
        ], 201);
    }

    public function show(Stock $stock): JsonResponse
    {
        $stock->load(['product:id,name,size_id', 'product.size:id,size']);

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'name' => $stock->product?->name,
            'size' => $stock->product?->size?->size,
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
            'barcode' => ['sometimes', 'nullable'],
            'adjust_mode' => ['sometimes', 'nullable', 'string', 'in:add,deduct'],
        ]);

        $existingBarcodes = is_array($stock->barcode) ? $stock->barcode : [];
        $barcodeValue = $existingBarcodes;
        $stocksValue = (int) ($validated['stocks'] ?? $validated['available_stock'] ?? $stock->stocks);

        if (array_key_exists('barcode', $validated)) {
            if ($validated['barcode'] === null) {
                $barcodeValue = null;
                $stocksValue = 0;
            } else {
                $incomingBarcodes = $this->normalizeBarcodes($validated['barcode']);
                $adjustMode = $validated['adjust_mode'] ?? 'add';

                if ($adjustMode === 'deduct') {
                    $barcodeValue = $existingBarcodes;

                    // Deduct by scanned quantity from existing stock.
                    foreach ($incomingBarcodes as $incomingBarcode) {
                        $matchedIndex = array_search($incomingBarcode, $barcodeValue, true);

                        if ($matchedIndex !== false) {
                            unset($barcodeValue[$matchedIndex]);
                            continue;
                        }

                        if ($barcodeValue !== []) {
                            array_pop($barcodeValue);
                        }
                    }

                    $barcodeValue = array_values($barcodeValue);
                } else {
                    $barcodeValue = array_merge($existingBarcodes, $incomingBarcodes);
                }

                $stocksValue = count($barcodeValue);
            }
        }

        $stock->update([
            'product_id' => array_key_exists('product_id', $validated) ? $validated['product_id'] : $stock->product_id,
            'stocks' => $stocksValue,
            'warehouse_id' => array_key_exists('warehouse_id', $validated) ? $validated['warehouse_id'] : $stock->warehouse_id,
            'cartoon_id' => array_key_exists('cartoon_id', $validated) ? $validated['cartoon_id'] : $stock->cartoon_id,
            'barcode' => $barcodeValue,
        ]);
        $stock->load(['product:id,name,size_id', 'product.size:id,size']);

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'name' => $stock->product?->name,
            'size' => $stock->product?->size?->size,
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