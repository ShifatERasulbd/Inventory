<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\WareHouse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    private function normalizeStoredPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $normalized = str_replace('\\', '/', trim($path));
        $normalized = preg_replace('#^public/#', '', $normalized) ?? $normalized;
        $normalized = preg_replace('#^/?storage/#', '', $normalized) ?? $normalized;

        return $normalized;
    }

    private function deleteImageByPath(string $path): void
    {
        $normalizedPath = $this->normalizeStoredPath($path);

        if (! $normalizedPath) {
            return;
        }

        if (str_starts_with($normalizedPath, 'uploads/')) {
            $fullPath = public_path($normalizedPath);

            if (File::exists($fullPath)) {
                File::delete($fullPath);
            }

            return;
        }

        Storage::disk('public')->delete($normalizedPath);
    }

    private function productWithRelations(Product $product): Product
    {
        return $product->load([
            'category:id,name',
            'color:id,name',
            'fabric:id,name',
            'size:id,size',
            'gender:id,name',
            'warehouse:id,name',
            'brand:id,name',
            'brands:id,name',
            'season:id,name',
        ]);
    }

    private function resolveBrandIds(array $validated): array
    {
        $brandIds = collect($validated['brand_ids'] ?? [])
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->map(fn ($value) => (int) $value)
            ->filter(fn (int $value) => $value > 0)
            ->unique()
            ->values()
            ->all();

        if ($brandIds === [] && ! empty($validated['brand_id'])) {
            $brandIds = [(int) $validated['brand_id']];
        }

        return $brandIds;
    }

    private function resolveEffectiveBrandIdsForWarehouse(int $warehouseId, array $brandIds): array
    {
        if ($brandIds === []) {
            return [];
        }

        $warehouseBrandIds = WareHouse::query()
            ->whereKey($warehouseId)
            ->with('brands:id')
            ->first()
            ?->brands
            ?->pluck('id')
            ?->map(fn ($id) => (int) $id)
            ?->filter(fn (int $id) => $id > 0)
            ?->unique()
            ?->values()
            ?->all() ?? [];

        if ($warehouseBrandIds === []) {
            return $brandIds;
        }

        $effectiveBrandIds = array_values(array_intersect($brandIds, $warehouseBrandIds));

        return $effectiveBrandIds !== [] ? $effectiveBrandIds : $brandIds;
    }

    private function syncProductStocksForWarehouseAndBrands(array $productIds, int $warehouseId, array $brandIds): void
    {
        $productIds = collect($productIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn (int $id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        if ($productIds === []) {
            return;
        }

        $effectiveBrandIds = $this->resolveEffectiveBrandIdsForWarehouse($warehouseId, $brandIds);

        // Keep each product's stock rows aligned with the selected warehouse and selected brands.
        Stock::query()
            ->whereIn('product_id', $productIds)
            ->where('warehouse_id', '!=', $warehouseId)
            ->delete();

        if ($effectiveBrandIds === []) {
            Stock::query()
                ->whereIn('product_id', $productIds)
                ->where('warehouse_id', $warehouseId)
                ->whereNotNull('brand_id')
                ->delete();

            $existingNullRows = Stock::query()
                ->whereIn('product_id', $productIds)
                ->where('warehouse_id', $warehouseId)
                ->whereNull('brand_id')
                ->pluck('product_id')
                ->map(fn ($id) => (int) $id)
                ->all();

            $missingRows = array_values(array_diff($productIds, $existingNullRows));
            $now = now();

            if ($missingRows !== []) {
                $rows = array_map(fn (int $productId) => [
                    'product_id' => $productId,
                    'stocks' => 0,
                    'warehouse_id' => $warehouseId,
                    'brand_id' => null,
                    'cartoon_id' => null,
                    'barcode' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $missingRows);

                Stock::query()->insert($rows);
            }

            return;
        }

        Stock::query()
            ->whereIn('product_id', $productIds)
            ->where('warehouse_id', $warehouseId)
            ->where(function ($query) use ($effectiveBrandIds) {
                $query->whereNull('brand_id')
                    ->orWhereNotIn('brand_id', $effectiveBrandIds);
            })
            ->delete();

        $existingBrandRows = Stock::query()
            ->whereIn('product_id', $productIds)
            ->where('warehouse_id', $warehouseId)
            ->whereIn('brand_id', $effectiveBrandIds)
            ->get(['product_id', 'brand_id'])
            ->map(fn (Stock $stock) => ((int) $stock->product_id) . '_' . ((int) $stock->brand_id))
            ->all();

        $existingBrandMap = array_fill_keys($existingBrandRows, true);
        $rows = [];
        $now = now();

        foreach ($productIds as $productId) {
            foreach ($effectiveBrandIds as $brandId) {
                $pairKey = $productId . '_' . $brandId;

                if (isset($existingBrandMap[$pairKey])) {
                    continue;
                }

                $rows[] = [
                    'product_id' => $productId,
                    'stocks' => 0,
                    'warehouse_id' => $warehouseId,
                    'brand_id' => $brandId,
                    'cartoon_id' => null,
                    'barcode' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if ($rows !== []) {
            Stock::query()->insert($rows);
        }
    }

    private function storeImage(UploadedFile $file): string
    {
        $uploadDirectory = public_path('uploads/products');

        if (! File::exists($uploadDirectory)) {
            File::makeDirectory($uploadDirectory, 0755, true);
        }

        $fileName = $file->hashName();
        $file->move($uploadDirectory, $fileName);

        return 'uploads/products/' . $fileName;
    }

    private function storeGalleryImages(array $files): array
    {
        return collect($files)
            ->filter(fn ($file) => $file instanceof UploadedFile)
            ->map(fn (UploadedFile $file) => $this->storeImage($file))
            ->values()
            ->all();
    }

    private function deleteImages(array $paths): void
    {
        $paths = collect($paths)
            ->map(fn ($path) => $this->normalizeStoredPath($path))
            ->filter()
            ->unique()
            ->values()
            ->all();

        foreach ($paths as $path) {
            $this->deleteImageByPath($path);
        }
    }

    private function isImageReferencedByOtherProducts(string $path, ?int $ignoreProductId = null): bool
    {
        $query = Product::query();

        if ($ignoreProductId) {
            $query->where('id', '!=', $ignoreProductId);
        }

        return $query
            ->where(function ($innerQuery) use ($path) {
                $innerQuery
                    ->where('cover_image', $path)
                    ->orWhereJsonContains('gallery_images', $path);
            })
            ->exists();
    }

    private function deleteImagesIfUnreferenced(array $paths, ?int $ignoreProductId = null): void
    {
        $normalizedPaths = collect($paths)
            ->map(fn ($path) => $this->normalizeStoredPath($path))
            ->filter()
            ->unique()
            ->values();

        $pathsToDelete = $normalizedPaths
            ->reject(fn (string $path) => $this->isImageReferencedByOtherProducts($path, $ignoreProductId))
            ->values()
            ->all();

        foreach ($pathsToDelete as $path) {
            $this->deleteImageByPath($path);
        }
    }

    private function styleGroupQuery(Product $product): Builder
    {
        return Product::query()
            ->where('style_number', $product->style_number)
            ->where(function ($query) use ($product) {
                if ($product->category_id === null) {
                    $query->whereNull('category_id');
                } else {
                    $query->where('category_id', $product->category_id);
                }
            })
            ->where('fabric_id', $product->fabric_id)
            ->where('gender_id', $product->gender_id)
            ->where('warehouse_id', $product->warehouse_id)
            ->where(function ($query) use ($product) {
                if ($product->ref_number === null) {
                    $query->whereNull('ref_number');
                } else {
                    $query->where('ref_number', $product->ref_number);
                }
            });
    }

    private function parseSkusMap(?string $encodedSkus): array
    {
        $decodedSkus = json_decode($encodedSkus ?? '', true);

        if (! is_array($decodedSkus)) {
            return [];
        }

        return collect($decodedSkus)
            ->mapWithKeys(function ($value, $key) {
                $normalized = is_string($value) ? trim($value) : (is_scalar($value) ? trim((string) $value) : '');

                return [(string) $key => ($normalized === '' ? null : $normalized)];
            })
            ->all();
    }

    private function resolveVariantSku(array $skusMap, int $colorId, int $sizeId, ?string $fallback = null): ?string
    {
        $pairKey = "{$colorId}_{$sizeId}";
        $sizeKey = (string) $sizeId;

        if (array_key_exists($pairKey, $skusMap)) {
            return $skusMap[$pairKey];
        }

        // Backward compatibility for older payloads keyed only by size id.
        if (array_key_exists($sizeKey, $skusMap)) {
            return $skusMap[$sizeKey];
        }

        return $fallback;
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Product::query()
                ->with([
                    'category:id,name',
                    'color:id,name,color_code',
                    'fabric:id,name',
                    'size:id,size',
                    'gender:id,name',
                    'warehouse:id,name',
                    'brand:id,name',
                    'brands:id,name',
                    'season:id,name'
                ])
                ->orderBy('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
           
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'style_number' => ['required', 'string', 'max:50'],
            'hs_number' => ['nullable', 'string', 'max:100'],
            'ref_number' => ['nullable', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color_ids' => ['required', 'array', 'min:1'],
            'color_ids.*' => ['required', 'integer', 'exists:colors,id'],
            'fabric_id' => ['required', 'integer', 'exists:fabrics,id'],
            'size_ids' => ['required', 'array', 'min:1'],
            'size_ids.*' => ['required', 'integer', 'exists:sizes,id'],
            'season_id' => ['nullable', 'integer', 'exists:seasons,id'],
            'gender_id' => ['required', 'integer', 'exists:products_for,id'],
            'barcodes' => ['required', 'string'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'brand_ids' => ['nullable', 'array'],
            'brand_ids.*' => ['required', 'integer', 'exists:brands,id'],
            'cover_image' => ['nullable', 'image', 'max:3072'],
            'gallery_images' => ['nullable', 'array', 'max:8'],
            'gallery_images.*' => ['image', 'max:3072'],
            'skus' => ['nullable', 'string'],
        ]);

    
        $colorIds = collect($validated['color_ids'] ?? [])->filter()->unique()->values()->all();
        $sizeIds = collect($validated['size_ids'] ?? [])->filter()->unique()->values()->all();
        $brandIds = $this->resolveBrandIds($validated);

        // Decode the barcodes map sent as JSON string from FormData
        $decodedBarcodes = json_decode($validated['barcodes'], true);
        $barcodesMap = is_array($decodedBarcodes) ? $decodedBarcodes : [];

        if ($colorIds === [] || $sizeIds === []) {
            return response()->json([
                'message' => 'Color and size values are required.',
                'errors' => [
                    'color_ids' => ['Please add at least one color.'],
                    'size_ids' => ['Please add at least one size.'],
                ],
            ], 422);
        }

        $storedCoverImage = null;
        $storedGalleryImages = [];

        if ($request->hasFile('cover_image')) {
            $storedCoverImage = $this->storeImage($request->file('cover_image'));
        }

        if ($request->hasFile('gallery_images')) {
            $storedGalleryImages = $this->storeGalleryImages($request->file('gallery_images'));
        }

        try {
            $products = DB::transaction(function () use ($validated, $colorIds, $sizeIds, $brandIds, $storedCoverImage, $storedGalleryImages, $barcodesMap) {
                $products = [];
                $createdProductIds = [];

                $skusMap = $this->parseSkusMap($validated['skus'] ?? null);

                foreach ($colorIds as $colorId) {
                    foreach ($sizeIds as $sizeId) {
                        $product = Product::query()->create([
                            
                            'category_id' => $validated['category_id'] ?? null,
                            'style_number' => $validated['style_number'],
                            'hs_number' => $validated['hs_number'] ?? null,
                            'ref_number' => $validated['ref_number'] ?? null,
                            'name' => $validated['name'],
                            'description' => $validated['description'] ?? null,
                            'color_id' => $colorId,
                            'fabric_id' => $validated['fabric_id'],
                            'size_id' => $sizeId,
                            'gender_id' => $validated['gender_id'],
                            'warehouse_id' => $validated['warehouse_id'],
                            'brand_id' => $brandIds[0] ?? null,
                            'season_id'=>$validated['season_id'],
                            'cover_image' => $storedCoverImage,
                            'gallery_images' => $storedGalleryImages,
'barCode' => $barcodesMap["{$colorId}_{$sizeId}"] ?? null,
                            'sku' => $this->resolveVariantSku($skusMap, (int) $colorId, (int) $sizeId),
                        ]);

                        $product->brands()->sync($brandIds);
                        $products[] = $product;
                        $createdProductIds[] = (int) $product->id;
                    }
                }

                $this->syncProductStocksForWarehouseAndBrands($createdProductIds, (int) $validated['warehouse_id'], $brandIds);

                return $products;
            });

            return response()->json([
                'message' => 'Products created successfully.',
                'count' => count($products),
                'data' => collect($products)
                    ->map(fn (Product $product) => $this->productWithRelations($product)->toArray())
                    ->values()
                    ->all(),
            ], 201);
        } catch (\Throwable $exception) {
            $this->deleteImages(array_merge([$storedCoverImage], $storedGalleryImages));

            throw $exception;
        }
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $variantOnly = $request->boolean('variant_only');

        if ($variantOnly) {
            $productData = $this->productWithRelations($product)->toArray();
            $productData['color_ids'] = $product->color_id ? [(int) $product->color_id] : [];
            $productData['size_ids'] = $product->size_id ? [(int) $product->size_id] : [];
            $productData['skus'] = ($product->color_id && $product->size_id)
                ? ["{$product->color_id}_{$product->size_id}" => $product->sku]
                : [];
            $brandIds = $product->brands->pluck('id')->map(fn ($id) => (int) $id)->values()->all();
            $productData['brand_ids'] = $brandIds !== []
                ? $brandIds
                : ($product->brand_id ? [(int) $product->brand_id] : []);

            return response()->json($productData);
        }

        $styleGroup = $this->styleGroupQuery($product)
            ->orderBy('id')
            ->get(['id', 'color_id', 'size_id', 'sku']);

        $productData = $this->productWithRelations($product)->toArray();
        $productData['color_ids'] = $styleGroup->pluck('color_id')->filter()->unique()->map(fn ($id) => (int) $id)->values()->all();
        $productData['size_ids'] = $styleGroup->pluck('size_id')->filter()->unique()->map(fn ($id) => (int) $id)->values()->all();
        $productData['skus'] = $styleGroup
            ->filter(fn ($item) => $item->color_id && $item->size_id)
            ->mapWithKeys(fn ($item) => ["{$item->color_id}_{$item->size_id}" => $item->sku])
            ->all();
        $brandIds = $product->brands->pluck('id')->map(fn ($id) => (int) $id)->values()->all();
        $productData['brand_ids'] = $brandIds !== []
            ? $brandIds
            : ($product->brand_id ? [(int) $product->brand_id] : []);

        return response()->json($productData);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $variantOnly = $request->boolean('variant_only');

        $validated = $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'style_number' => ['required', 'string', 'max:50'],
            'hs_number' => ['nullable', 'string', 'max:100'],
            'ref_number' => ['nullable', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color_id' => ['required', 'integer', 'exists:colors,id'],
            'color_ids' => ['required', 'array', 'min:1'],
            'color_ids.*' => ['required', 'integer', 'exists:colors,id'],
            'fabric_id' => ['required', 'integer', 'exists:fabrics,id'],
            'season_id' => ['nullable', 'integer', 'exists:seasons,id'],
            'size_id' => ['required', 'integer', 'exists:sizes,id'],
            'size_ids' => ['required', 'array', 'min:1'],
            'size_ids.*' => ['required', 'integer', 'exists:sizes,id'],
            'gender_id' => ['required', 'integer', 'exists:products_for,id'],
            'barCode' => ['nullable', 'string', 'max:200'],
            'barcodes' => ['required', 'string'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'brand_ids' => ['nullable', 'array'],
            'brand_ids.*' => ['required', 'integer', 'exists:brands,id'],
            'cover_image' => ['nullable', 'image', 'max:3072'],
            'gallery_images' => ['nullable', 'array', 'max:8'],
            'gallery_images.*' => ['image', 'max:3072'],
            'remove_cover_image' => ['nullable'],
            'remove_gallery_images' => ['nullable'],
            'skus' => ['nullable', 'string'],
        ]);

        $currentGalleryImages = collect($product->gallery_images ?? [])
            ->map(fn ($path) => $this->normalizeStoredPath($path))
            ->filter()
            ->values()
            ->all();
        $imagesToDeleteAfterUpdate = [];

        $removeCoverImage = filter_var($request->input('remove_cover_image'), FILTER_VALIDATE_BOOLEAN);

        if ($removeCoverImage && $product->cover_image) {
            $validated['cover_image'] = null;
            $imagesToDeleteAfterUpdate[] = $product->cover_image;
        }

        $removeGalleryInput = $request->input('remove_gallery_images', []);
        if (is_string($removeGalleryInput)) {
            $decoded = json_decode($removeGalleryInput, true);
            $removeGalleryInput = is_array($decoded) ? $decoded : [$removeGalleryInput];
        }

        if (!is_array($removeGalleryInput)) {
            $removeGalleryInput = [];
        }

        if ($removeGalleryInput !== []) {
            $removeGalleryPaths = collect($removeGalleryInput)
                ->map(fn ($path) => $this->normalizeStoredPath($path))
                ->filter()
                ->values()
                ->all();
            $imagesToDeleteAfterUpdate = array_merge($imagesToDeleteAfterUpdate, $removeGalleryPaths);

            $currentGalleryImages = array_values(array_diff($currentGalleryImages, $removeGalleryPaths));
            $validated['gallery_images'] = $currentGalleryImages;
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->storeImage($request->file('cover_image'));
            if ($product->cover_image) {
                $imagesToDeleteAfterUpdate[] = $product->cover_image;
            }
        }

        if ($request->hasFile('gallery_images')) {
            $newGalleryImages = $this->storeGalleryImages($request->file('gallery_images'));
            $baseGallery = $validated['gallery_images'] ?? $currentGalleryImages;
            $validated['gallery_images'] = array_values(array_merge($baseGallery, $newGalleryImages));
        }

        $colorIds = collect($validated['color_ids'] ?? [])->filter()->unique()->map(fn ($value) => (int) $value)->values()->all();
        $sizeIds = collect($validated['size_ids'] ?? [])->filter()->unique()->map(fn ($value) => (int) $value)->values()->all();
        $brandIds = $this->resolveBrandIds($validated);

        $targetProductIds = $variantOnly
            ? [(int) $product->id]
            : $this->styleGroupQuery($product)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->filter(fn ($id) => $id > 0)
                ->values()
                ->all();

        if ($targetProductIds === []) {
            $targetProductIds = [(int) $product->id];
        }

        // Decode barcode map sent as JSON string from FormData.
        $decodedBarcodes = json_decode($validated['barcodes'] ?? '', true);
        $barcodesMap = is_array($decodedBarcodes) ? $decodedBarcodes : [];

        if ($colorIds === [] || $sizeIds === []) {
            return response()->json([
                'message' => 'Color and size values are required.',
                'errors' => [
                    'color_ids' => ['Please add at least one color.'],
                    'size_ids' => ['Please add at least one size.'],
                ],
            ], 422);
        }

        $primaryColorId = $colorIds[0];
        $primarySizeId = $sizeIds[0];
        $primaryBarcodeKey = "{$primaryColorId}_{$primarySizeId}";

        $sharedAttributes = [
            'category_id' => $validated['category_id'] ?? null,
            'style_number' => $validated['style_number'],
            'hs_number' => $validated['hs_number'] ?? null,
            'ref_number' => $validated['ref_number'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'fabric_id' => $validated['fabric_id'],
            'gender_id' => $validated['gender_id'],
            'warehouse_id' => $validated['warehouse_id'],
            'brand_id' => $brandIds[0] ?? null,
            'season_id' => $validated['season_id'] ?? null,
            'cover_image' => $validated['cover_image'] ?? $product->cover_image,
            'gallery_images' => $validated['gallery_images'] ?? $currentGalleryImages,
        ];

        unset(
            $validated['remove_cover_image'],
            $validated['remove_gallery_images'],
            $validated['color_ids'],
            $validated['size_ids'],
            $validated['barcodes']
        );

        $skusMap = $this->parseSkusMap($validated['skus'] ?? null);

        DB::transaction(function () use ($variantOnly, $product, $targetProductIds, $sharedAttributes, $primaryColorId, $primarySizeId, $barcodesMap, $primaryBarcodeKey, $colorIds, $sizeIds, $brandIds, $skusMap) {
            $productsToUpdate = Product::query()
                ->whereIn('id', $targetProductIds)
                ->get();

            foreach ($productsToUpdate as $item) {
                $colorId = $variantOnly ? $primaryColorId : (int) ($item->color_id ?? 0);
                $sizeId = $variantOnly ? $primarySizeId : (int) ($item->size_id ?? 0);
                $pairKey = "{$colorId}_{$sizeId}";

                $item->update(array_merge($sharedAttributes, [
                    'color_id' => $colorId > 0 ? $colorId : $primaryColorId,
                    'size_id' => $sizeId > 0 ? $sizeId : $primarySizeId,
                    'barCode' => $barcodesMap[$pairKey] ?? $item->barCode ?? ($barcodesMap[$primaryBarcodeKey] ?? null),
                    'sku' => $this->resolveVariantSku($skusMap, $colorId > 0 ? $colorId : $primaryColorId, $sizeId > 0 ? $sizeId : $primarySizeId, $item->sku ?? null),
                ]));

                $item->brands()->sync($brandIds);
            }

            if ($variantOnly) {
                return;
            }

            $existingPairs = Product::query()
                ->where(function ($query) use ($sharedAttributes) {
                    if (($sharedAttributes['category_id'] ?? null) === null) {
                        $query->whereNull('category_id');
                    } else {
                        $query->where('category_id', $sharedAttributes['category_id']);
                    }
                })
                ->where('style_number', $sharedAttributes['style_number'])
                ->where('fabric_id', $sharedAttributes['fabric_id'])
                ->where('gender_id', $sharedAttributes['gender_id'])
                ->where('warehouse_id', $sharedAttributes['warehouse_id'])
                ->where(function ($query) use ($sharedAttributes) {
                    if ($sharedAttributes['ref_number'] === null) {
                        $query->whereNull('ref_number');
                    } else {
                        $query->where('ref_number', $sharedAttributes['ref_number']);
                    }
                })
                ->get(['color_id', 'size_id'])
                ->map(fn (Product $item) => "{$item->color_id}_{$item->size_id}")
                ->values()
                ->all();

            $existingPairMap = array_fill_keys($existingPairs, true);
            $createdProductIds = [];

            foreach ($colorIds as $colorId) {
                foreach ($sizeIds as $sizeId) {
                    $pairKey = "{$colorId}_{$sizeId}";

                    if (isset($existingPairMap[$pairKey])) {
                        continue;
                    }

                    $created = Product::query()->create(array_merge($sharedAttributes, [
                        'color_id' => $colorId,
                        'size_id' => $sizeId,
                        'barCode' => $barcodesMap[$pairKey] ?? null,
                        'sku' => $this->resolveVariantSku($skusMap, (int) $colorId, (int) $sizeId),
                    ]));

                    $created->brands()->sync($brandIds);
                    $createdProductIds[] = (int) $created->id;

                    $existingPairMap[$pairKey] = true;
                }
            }

            $allAffectedProductIds = array_unique(array_merge(
                $productsToUpdate->pluck('id')->map(fn ($id) => (int) $id)->all(),
                $createdProductIds
            ));

            $this->syncProductStocksForWarehouseAndBrands($allAffectedProductIds, (int) $sharedAttributes['warehouse_id'], $brandIds);
        });

        $this->deleteImagesIfUnreferenced($imagesToDeleteAfterUpdate, $product->id);

        return response()->json($this->productWithRelations($product->fresh()));
    }

    public function destroy(Product $product): JsonResponse
    {
        $imagesToDelete = array_merge([$product->cover_image], $product->gallery_images ?? []);
        $productId = $product->id;
        $product->delete();
        $this->deleteImagesIfUnreferenced($imagesToDelete, $productId);

        return response()->json(['message' => 'Product deleted']);
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:products,id'],
        ]);

        $ids = collect($validated['ids'])->unique()->values()->all();
        $imagesToDelete = [];

        DB::transaction(function () use ($ids, &$imagesToDelete) {
            $products = Product::query()
                ->whereIn('id', $ids)
                ->get();

            foreach ($products as $product) {
                $imagesToDelete = array_merge($imagesToDelete, [$product->cover_image], $product->gallery_images ?? []);
            }

            Product::query()->whereIn('id', $ids)->delete();
        });

        $this->deleteImagesIfUnreferenced($imagesToDelete);

        return response()->json([
            'message' => 'Products deleted successfully.',
            'count' => count($ids),
        ]);
    }
}
