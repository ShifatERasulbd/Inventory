<?php

namespace App\Http\Controllers;

use App\Models\Cartoon;
use App\Models\Product;
use App\Models\Stock;
use App\Models\WareHouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockController extends Controller
{
    private function validateBarcodesForProduct(array $barcodes, int $productId): void
    {
        if ($barcodes === []) {
            return;
        }

        $productBarcode = Product::query()
            ->whereKey($productId)
            ->value('barCode');

        $normalizedProductBarcode = is_string($productBarcode)
            ? trim($productBarcode)
            : '';

        if ($normalizedProductBarcode === '') {
            throw ValidationException::withMessages([
                'barcode' => ['This product has no configured barcode. Set a product barcode before adding stock by scan.'],
            ]);
        }

        $invalidBarcodes = array_values(array_filter(
            $barcodes,
            fn (string $barcode) => $barcode !== $normalizedProductBarcode
        ));

        if ($invalidBarcodes !== []) {
            throw ValidationException::withMessages([
                'barcode' => ['Scanned barcode does not match the selected product barcode.'],
            ]);
        }
    }

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

    private function normalizeLookupValues(array $values): array
    {
        return array_values(array_unique(array_filter(array_map(
            static fn ($value) => trim((string) $value),
            $values
        ))));
    }

    private function resolveProductForLocationLookup(array $item): ?Product
    {
        $codeCandidates = $this->normalizeLookupValues([
            $item['sku'] ?? null,
            $item['barcode'] ?? null,
            $item['product_code'] ?? null,
        ]);

        foreach ($codeCandidates as $candidate) {
            $product = Product::query()
                ->where('barCode', $candidate)
                ->first();

            if ($product) {
                return $product;
            }
        }

        $nameCandidates = $this->normalizeLookupValues([
            $item['name'] ?? null,
            $item['title'] ?? null,
        ]);

        foreach ($nameCandidates as $candidate) {
            $product = Product::query()
                ->whereRaw('LOWER(name) = ?', [strtolower($candidate)])
                ->first();

            if ($product) {
                return $product;
            }
        }

        foreach ($nameCandidates as $candidate) {
            $product = Product::query()
                ->where('name', 'like', '%' . $candidate . '%')
                ->orderBy('id')
                ->first();

            if ($product) {
                return $product;
            }
        }

        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $visibleWarehouseIds = null;
        $query = Stock::query()
            ->with([
                'product:id,name,size_id,color_id,barCode,warehouse_id,brand_id',
                'product.brands:id,name',
                'product.size:id,size',
                'product.color:id,name,color_code',
                'warehouse:id,name',
                'warehouse.brands:id,name',
                'brand:id,name',
            ])
            ->orderBy('id');

        $user = $request->user();

        if ($user && ! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            if ($warehouseIds === []) {
                return response()->json([]);
            }

            $visibleWarehouseIds = $warehouseIds;
            $query->whereIn('warehouse_id', $warehouseIds);
        }

        $filteredStocks = $query
            ->get()
            ->filter(function (Stock $stock): bool {
                $productBrandIds = $stock->product?->brands
                    ?->pluck('id')
                    ?->map(fn ($id) => (int) $id)
                    ?->filter(fn (int $id) => $id > 0)
                    ?->unique()
                    ?->values()
                    ?->all() ?? [];

                if ($productBrandIds === [] && ! empty($stock->product?->brand_id)) {
                    $productBrandIds = [(int) $stock->product->brand_id];
                }

                // Legacy products may not have brand links yet; do not hide their stock rows.
                if ($productBrandIds === []) {
                    return true;
                }

                $stockBrandId = (int) ($stock->brand_id ?? 0);
                return $stockBrandId > 0 && in_array($stockBrandId, $productBrandIds, true);
            });

        $existingKeyMap = [];
        foreach ($filteredStocks as $stock) {
            $key = implode('|', [
                (int) $stock->product_id,
                (int) $stock->warehouse_id,
                (int) ($stock->brand_id ?? 0),
            ]);
            $existingKeyMap[$key] = true;
        }

        $stocks = $filteredStocks
            ->map(fn (Stock $stock) => [
                'id' => $stock->id,
                'product_id' => $stock->product_id,
                'warehouse_id' => $stock->warehouse_id,
                'warehouse_name' => $stock->warehouse?->name,
                'warehouse_brand_ids' => $stock->warehouse?->brands?->pluck('id')?->values()?->all() ?? [],
                'warehouse_brand_names' => $stock->warehouse?->brands?->pluck('name')?->values()?->all() ?? [],
                'brand_id' => $stock->brand_id,
                'brand_name' => $stock->brand?->name,
                'product_brand_ids' => $stock->product?->brands?->pluck('id')?->values()?->all() ?? [],
                'product_brand_names' => $stock->product?->brands?->pluck('name')?->values()?->all() ?? [],
                'cartoon_id' => $stock->cartoon_id,
                'barcode' => $stock->barcode,
                'product_barcode' => $stock->product?->barCode,
                'stocks' => (int) ($stock->stocks ?? 0),
                'available_stock' => (int) ($stock->stocks ?? 0),
                'buying_price' => (float) ($stock->buying_price ?? 0),
                'selling_price' => (float) ($stock->selling_price ?? 0),
                'name' => $stock->product?->name,
                'size' => $stock->product?->size?->size,
                'color_variant' => $stock->product?->color?->color_code
                    ?? $stock->product?->color?->name,
                'is_placeholder' => false,
            ]);

        $warehouseContextQuery = WareHouse::query()->with('brands:id,name');

        if (is_array($visibleWarehouseIds)) {
            $warehouseContextQuery->whereIn('id', $visibleWarehouseIds);
        }

        $warehouseContexts = $warehouseContextQuery->get(['id', 'name']);

        $visibleBrandIds = $warehouseContexts
            ->flatMap(fn (WareHouse $warehouse) => $warehouse->brands->pluck('id'))
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        $productQuery = Product::query()
            ->with([
                'size:id,size',
                'color:id,name,color_code',
                'brands:id,name',
            ]);

        if ($visibleBrandIds !== []) {
            $productQuery->where(function ($query) use ($visibleBrandIds) {
                $query->whereHas('brands', fn ($brandQuery) => $brandQuery->whereIn('brands.id', $visibleBrandIds))
                    ->orWhereIn('brand_id', $visibleBrandIds);
            });
        }

        $products = $productQuery->get(['id', 'name', 'size_id', 'color_id', 'barCode', 'brand_id']);
        $placeholders = collect();

        foreach ($products as $product) {
            $brandIds = $product->brands
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->filter(fn (int $id) => $id > 0)
                ->unique()
                ->values()
                ->all();

            if ($brandIds === [] && ! empty($product->brand_id)) {
                $brandIds = [(int) $product->brand_id];
            }

            if ($brandIds === []) {
                continue;
            }

            foreach ($warehouseContexts as $warehouse) {
                $warehouseBrandIds = $warehouse->brands
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->filter(fn (int $id) => $id > 0)
                    ->unique()
                    ->values()
                    ->all();

                if ($warehouseBrandIds === []) {
                    continue;
                }

                $matchedBrandIds = array_values(array_intersect($brandIds, $warehouseBrandIds));

                foreach ($matchedBrandIds as $brandId) {
                    $key = implode('|', [
                        (int) $product->id,
                        (int) $warehouse->id,
                        (int) $brandId,
                    ]);

                    if (isset($existingKeyMap[$key])) {
                        continue;
                    }

                    $brandName = $product->brands->firstWhere('id', $brandId)?->name
                        ?? $warehouse->brands->firstWhere('id', $brandId)?->name;

                    $placeholders->push([
                        'id' => 'placeholder-' . $product->id . '-' . $warehouse->id . '-' . $brandId,
                        'product_id' => (int) $product->id,
                        'warehouse_id' => (int) $warehouse->id,
                        'warehouse_name' => $warehouse->name,
                        'warehouse_brand_ids' => $warehouse->brands->pluck('id')->values()->all(),
                        'warehouse_brand_names' => $warehouse->brands->pluck('name')->values()->all(),
                        'brand_id' => $brandId,
                        'brand_name' => $brandName,
                        'product_brand_ids' => $brandIds,
                        'product_brand_names' => $product->brands->pluck('name')->values()->all(),
                        'cartoon_id' => null,
                        'barcode' => null,
                        'product_barcode' => $product->barCode,
                        'stocks' => 0,
                        'available_stock' => 0,
                        'buying_price' => 0,
                        'selling_price' => 0,
                        'name' => $product->name,
                        'size' => $product->size?->size,
                        'color_variant' => $product->color?->color_code
                            ?? $product->color?->name,
                        'is_placeholder' => true,
                    ]);
                }
            }
        }

        $stocks = $stocks
            ->concat($placeholders)
            ->values();

        return response()->json($stocks);
    }

    public function locations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['nullable', 'string', 'max:255'],
            'items.*.title' => ['nullable', 'string', 'max:255'],
            'items.*.sku' => ['nullable', 'string', 'max:255'],
            'items.*.barcode' => ['nullable', 'string', 'max:255'],
            'items.*.product_code' => ['nullable', 'string', 'max:255'],
            'items.*.quantity' => ['nullable', 'integer', 'min:1'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
        ]);

        $items = array_values(is_array($validated['items']) ? $validated['items'] : []);
        if ($items === []) {
            return response()->json(['items' => []]);
        }

        $user = $request->user();
        $warehouseFilterIds = null;

        if ($user && ! $user->hasRole('super-admin')) {
            $warehouseFilterIds = $this->resolveUserWarehouseIds($user);

            if ($warehouseFilterIds === []) {
                return response()->json(['items' => []]);
            }
        }

        $requestedWarehouseId = (int) ($validated['warehouse_id'] ?? 0);
        if ($requestedWarehouseId > 0) {
            $warehouseFilterIds = [$requestedWarehouseId];
        }

        $responses = [];

        foreach ($items as $item) {
            $requestedQuantity = max(1, (int) ($item['quantity'] ?? 1));
            $inputLabel = trim((string) ($item['name'] ?? $item['title'] ?? $item['sku'] ?? 'Unknown Product'));
            $product = $this->resolveProductForLocationLookup($item);

            if (! $product) {
                $responses[] = [
                    'input_label' => $inputLabel !== '' ? $inputLabel : 'Unknown Product',
                    'requested_quantity' => $requestedQuantity,
                    'resolved_product_name' => null,
                    'product_barcode' => null,
                    'matches' => [],
                    'message' => 'No matching local product was found for this order item.',
                ];

                continue;
            }

            $lookupCodes = $this->normalizeLookupValues([
                $item['sku'] ?? null,
                $item['barcode'] ?? null,
                $item['product_code'] ?? null,
                $product->barCode,
            ]);

            $cartoonQuery = Cartoon::query()
                ->with([
                    'warehouse:id,name',
                    'rack:id,name',
                    'rackRow:id,row_number,code',
                ])
                ->whereNotNull('product_code');

            if ($lookupCodes !== []) {
                $cartoonQuery->where(function ($query) use ($lookupCodes) {
                    foreach ($lookupCodes as $index => $code) {
                        if ($index === 0) {
                            $query->whereJsonContains('product_code', $code);
                            continue;
                        }

                        $query->orWhereJsonContains('product_code', $code);
                    }
                });
            }

            if (is_array($warehouseFilterIds)) {
                $cartoonQuery->whereIn('warehouse_id', $warehouseFilterIds);
            }

            $cartoons = $cartoonQuery->orderByDesc('id')->get();

            $matches = $cartoons->map(function (Cartoon $cartoon) use ($lookupCodes, $product, $requestedQuantity): array {
                $cartoonCodes = is_array($cartoon->product_code) ? $cartoon->product_code : [];
                $matchedCodes = $lookupCodes !== []
                    ? array_values(array_intersect($cartoonCodes, $lookupCodes))
                    : [];

                return [
                    'cartoon_id' => $cartoon->id,
                    'cartoon_number' => $cartoon->cartoon_number,
                    'warehouse_id' => $cartoon->warehouse_id,
                    'warehouse_name' => $cartoon->warehouse?->name,
                    'rack_id' => $cartoon->rack_id,
                    'rack_name' => $cartoon->rack?->name,
                    'rack_row_id' => $cartoon->rack_row_id,
                    'rack_row_number' => $cartoon->rackRow?->row_number,
                    'rack_row_code' => $cartoon->rackRow?->code,
                    'quantity' => count($matchedCodes) > 0 ? count($matchedCodes) : (int) ($cartoon->quantity ?? $requestedQuantity),
                ];
            })->all();

            $responses[] = [
                'input_label' => $inputLabel !== '' ? $inputLabel : ($product->name ?? 'Product'),
                'requested_quantity' => $requestedQuantity,
                'resolved_product_name' => $product->name,
                'product_barcode' => $product->barCode,
                'matches' => $matches,
                'message' => $matches === [] ? 'No cartoons were found for this product in accessible warehouses.' : null,
            ];
        }

        return response()->json([
            'items' => $responses,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'stocks' => ['required_without:available_stock', 'integer', 'min:0'],
            'available_stock' => ['required_without:stocks', 'integer', 'min:0'],
            'buying_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'cartoon_id' => ['nullable', 'integer', 'exists:cartoons,id'],
            'barcode' => ['nullable'],
        ]);

        $barcodes = $this->normalizeBarcodes($validated['barcode'] ?? null);
        $this->validateBarcodesForProduct($barcodes, (int) $validated['product_id']);

        $stockCount = count($barcodes) > 0
            ? count($barcodes)
            : (int) ($validated['stocks'] ?? $validated['available_stock'] ?? 0);

        $stock = Stock::query()->create([
            'product_id' => $validated['product_id'],
            'stocks' => $stockCount,
            'buying_price' => (float) $validated['buying_price'],
            'selling_price' => (float) ($validated['selling_price'] ?? 0),
            'warehouse_id' => $validated['warehouse_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
            'cartoon_id' => $validated['cartoon_id'] ?? null,
            'barcode' => count($barcodes) > 0 ? $barcodes : null,
        ]);
        $stock->load([
            'product:id,name,size_id,color_id,barCode',
            'product.size:id,size',
            'product.color:id,name,color_code',
            'warehouse:id,name',
            'warehouse.brands:id,name',
            'brand:id,name',
        ]);

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'warehouse_name' => $stock->warehouse?->name,
            'warehouse_brand_ids' => $stock->warehouse?->brands?->pluck('id')?->values()?->all() ?? [],
            'warehouse_brand_names' => $stock->warehouse?->brands?->pluck('name')?->values()?->all() ?? [],
            'brand_id' => $stock->brand_id,
            'brand_name' => $stock->brand?->name,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'product_barcode' => $stock->product?->barCode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'buying_price' => (float) ($stock->buying_price ?? 0),
            'selling_price' => (float) ($stock->selling_price ?? 0),
            'name' => $stock->product?->name,
            'size' => $stock->product?->size?->size,
            'color_variant' => $stock->product?->color?->color_code
                ?? $stock->product?->color?->name,
        ], 201);
    }

    public function show(Stock $stock): JsonResponse
    {
        $stock->load([
            'product:id,name,size_id,color_id,barCode',
            'product.size:id,size',
            'product.color:id,name,color_code',
            'warehouse:id,name',
            'warehouse.brands:id,name',
            'brand:id,name',
        ]);

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'warehouse_name' => $stock->warehouse?->name,
            'warehouse_brand_ids' => $stock->warehouse?->brands?->pluck('id')?->values()?->all() ?? [],
            'warehouse_brand_names' => $stock->warehouse?->brands?->pluck('name')?->values()?->all() ?? [],
            'brand_id' => $stock->brand_id,
            'brand_name' => $stock->brand?->name,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'product_barcode' => $stock->product?->barCode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'buying_price' => (float) ($stock->buying_price ?? 0),
            'selling_price' => (float) ($stock->selling_price ?? 0),
            'name' => $stock->product?->name,
            'size' => $stock->product?->size?->size,
            'color_variant' => $stock->product?->color?->color_code
                ?? $stock->product?->color?->name,
        ]);
    }

    public function update(Request $request, Stock $stock): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['sometimes', 'required', 'integer', 'exists:products,id'],
            'stocks' => ['sometimes', 'required', 'integer', 'min:0'],
            'available_stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'buying_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'warehouse_id' => ['sometimes', 'nullable', 'integer', 'exists:warehouses,id'],
            'brand_id' => ['sometimes', 'nullable', 'integer', 'exists:brands,id'],
            'cartoon_id' => ['sometimes', 'nullable', 'integer', 'exists:cartoons,id'],
            'barcode' => ['sometimes', 'nullable'],
            'adjust_mode' => ['sometimes', 'nullable', 'string', 'in:add,deduct'],
        ]);

        $existingBarcodes  = is_array($stock->barcode) ? $stock->barcode : [];
        $barcodeValue      = $existingBarcodes;
        $stocksValue       = (int) ($validated['stocks'] ?? $validated['available_stock'] ?? $stock->stocks);
        $incomingBarcodes  = [];
        $isAdd             = false;

        if (array_key_exists('barcode', $validated)) {
            if ($validated['barcode'] === null) {
                $barcodeValue = null;
                $stocksValue  = 0;
            } else {
                $incomingBarcodes = $this->normalizeBarcodes($validated['barcode']);
                $adjustMode       = $validated['adjust_mode'] ?? 'add';
                $isAdd            = $adjustMode === 'add';

                $targetProductId = (int) (array_key_exists('product_id', $validated)
                    ? $validated['product_id']
                    : $stock->product_id);

                if ($isAdd) {
                    $this->validateBarcodesForProduct($incomingBarcodes, $targetProductId);
                }

                if (! $isAdd) {
                    // Deduct mode — remove scanned barcodes from existing stock.
                    $barcodeValue = $existingBarcodes;

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
                    // Add mode — merge new barcodes into existing stock.
                    $barcodeValue = array_merge($existingBarcodes, $incomingBarcodes);
                }

                $stocksValue = count($barcodeValue);
            }
        }

        DB::beginTransaction();
        try {
            // When adding barcodes to stock, remove those exact codes from any cartoon
            // sitting at the same warehouse — mirrors how CartoonController deducts from
            // source warehouse when codes are packed into a cartoon.
            if ($isAdd && $incomingBarcodes !== []) {
                $stockWarehouseId = array_key_exists('warehouse_id', $validated)
                    ? $validated['warehouse_id']
                    : $stock->warehouse_id;

                if ($stockWarehouseId) {
                    $cartoons = Cartoon::query()
                        ->where('warehouse_id', $stockWarehouseId)
                        ->whereNotNull('product_code')
                        ->lockForUpdate()
                        ->get();

                    foreach ($cartoons as $cartoon) {
                        $cartoonCodes = is_array($cartoon->product_code) ? $cartoon->product_code : [];
                        $changed      = false;

                        foreach ($incomingBarcodes as $code) {
                            $idx = array_search($code, $cartoonCodes, true);
                            if ($idx !== false) {
                                unset($cartoonCodes[$idx]);
                                $changed = true;
                            }
                        }

                        if ($changed) {
                            $cartoonCodes = array_values($cartoonCodes);
                            $cartoon->update([
                                'product_code' => count($cartoonCodes) > 0 ? $cartoonCodes : null,
                                'quantity'     => count($cartoonCodes),
                            ]);
                        }
                    }
                }
            }

            $stock->update([
                'product_id'   => array_key_exists('product_id', $validated) ? $validated['product_id'] : $stock->product_id,
                'stocks'       => $stocksValue,
                'buying_price' => array_key_exists('buying_price', $validated) ? (float) $validated['buying_price'] : $stock->buying_price,
                'selling_price' => array_key_exists('selling_price', $validated) ? (float) $validated['selling_price'] : $stock->selling_price,
                'warehouse_id' => array_key_exists('warehouse_id', $validated) ? $validated['warehouse_id'] : $stock->warehouse_id,
                'brand_id' => array_key_exists('brand_id', $validated) ? $validated['brand_id'] : $stock->brand_id,
                'cartoon_id'   => array_key_exists('cartoon_id', $validated) ? $validated['cartoon_id'] : $stock->cartoon_id,
                'barcode'      => $barcodeValue,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $stock->load([
            'product:id,name,size_id,color_id,barCode',
            'product.size:id,size',
            'product.color:id,name,color_code',
            'warehouse:id,name',
            'warehouse.brands:id,name',
            'brand:id,name',
        ]);

        return response()->json([
            'id' => $stock->id,
            'product_id' => $stock->product_id,
            'warehouse_id' => $stock->warehouse_id,
            'warehouse_name' => $stock->warehouse?->name,
            'warehouse_brand_ids' => $stock->warehouse?->brands?->pluck('id')?->values()?->all() ?? [],
            'warehouse_brand_names' => $stock->warehouse?->brands?->pluck('name')?->values()?->all() ?? [],
            'brand_id' => $stock->brand_id,
            'brand_name' => $stock->brand?->name,
            'cartoon_id' => $stock->cartoon_id,
            'barcode' => $stock->barcode,
            'product_barcode' => $stock->product?->barCode,
            'stocks' => (int) ($stock->stocks ?? 0),
            'available_stock' => (int) ($stock->stocks ?? 0),
            'buying_price' => (float) ($stock->buying_price ?? 0),
            'selling_price' => (float) ($stock->selling_price ?? 0),
            'name' => $stock->product?->name,
            'size' => $stock->product?->size?->size,
            'color_variant' => $stock->product?->color?->color_code
                ?? $stock->product?->color?->name,
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