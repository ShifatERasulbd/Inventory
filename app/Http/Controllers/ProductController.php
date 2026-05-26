<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Style;
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
            'style:id,name',
            'brand:id,name',
            'category:id,name',
            'color:id,name',
            'fabric:id,name',
            'size:id,size',
            'gender:id,name',
            'warehouse:id,name',
            'season:id,name',
        ]);
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
        if ((int) ($product->style_id ?? 0) > 0) {
            return Product::query()->where('style_id', (int) $product->style_id);
        }

        return Product::query()
            ->where('style_number', $product->style_number)
            ->where('brand_id', $product->brand_id)
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

    private function upsertStyleFromProductName(string $name): Style
    {
        $styleName = trim($name);

        if ($styleName === '') {
            $styleName = 'Unnamed Style';
        }

        $style = Style::query()->where('name', $styleName)->first();

        if (! $style) {
            return Style::query()->create(['name' => $styleName]);
        }

        $style->update(['name' => $styleName]);

        return $style;
    }

    private function deleteStyleIfUnused(?int $styleId): void
    {
        $styleId = (int) ($styleId ?? 0);

        if ($styleId <= 0) {
            return;
        }

        $isUsed = Product::query()->where('style_id', $styleId)->exists();
        if ($isUsed) {
            return;
        }

        Style::query()->whereKey($styleId)->delete();
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Product::query()
                ->with([
                    'style:id,name',
                    'brand:id,name',
                    'category:id,name',
                    'color:id,name,color_code',
                    'fabric:id,name',
                    'size:id,size',
                    'gender:id,name',
                    'warehouse:id,name',
                    'season:id,name'
                ])
                ->orderBy('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
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
            'cover_image' => ['nullable', 'image', 'max:3072'],
            'gallery_images' => ['nullable', 'array', 'max:8'],
            'gallery_images.*' => ['image', 'max:3072'],
        ]);
    
        $colorIds = collect($validated['color_ids'] ?? [])->filter()->unique()->values()->all();
        $sizeIds = collect($validated['size_ids'] ?? [])->filter()->unique()->values()->all();

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
            $products = DB::transaction(function () use ($validated, $colorIds, $sizeIds, $storedCoverImage, $storedGalleryImages, $barcodesMap) {
                $products = [];
                $stockRows = [];
                $warehouseIds = WareHouse::query()->pluck('id')->all();
                $now = now();
                $style = $this->upsertStyleFromProductName((string) ($validated['name'] ?? ''));

                foreach ($colorIds as $colorId) {
                    foreach ($sizeIds as $sizeId) {
                        $product = Product::query()->create([
                            'brand_id' => $validated['brand_id'],
                            'category_id' => $validated['category_id'] ?? null,
                            'style_id' => $style->id,
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
                            'season_id'=>$validated['season_id'],
                            'cover_image' => $storedCoverImage,
                            'gallery_images' => $storedGalleryImages,
                            'barCode' => $barcodesMap["{$colorId}_{$sizeId}"] ?? null,
                        ]);

                        $products[] = $product;

                        foreach ($warehouseIds as $warehouseId) {
                            $stockRows[] = [
                                'product_id' => $product->id,
                                'stocks' => 0,
                                'warehouse_id' => (int) $warehouseId,
                                'cartoon_id' => null,
                                'barcode' => null,
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                        }
                    }
                }

                if ($stockRows !== []) {
                    Stock::query()->insert($stockRows);
                }

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

            return response()->json($productData);
        }

        $styleGroup = $this->styleGroupQuery($product)
            ->orderBy('id')
            ->get(['id', 'color_id', 'size_id']);

        $productData = $this->productWithRelations($product)->toArray();
        $productData['color_ids'] = $styleGroup->pluck('color_id')->filter()->unique()->map(fn ($id) => (int) $id)->values()->all();
        $productData['size_ids'] = $styleGroup->pluck('size_id')->filter()->unique()->map(fn ($id) => (int) $id)->values()->all();

        return response()->json($productData);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $variantOnly = $request->boolean('variant_only');

        $validated = $request->validate([
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
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
            'cover_image' => ['nullable', 'image', 'max:3072'],
            'gallery_images' => ['nullable', 'array', 'max:8'],
            'gallery_images.*' => ['image', 'max:3072'],
            'remove_cover_image' => ['nullable'],
            'remove_gallery_images' => ['nullable'],
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
            'brand_id' => $validated['brand_id'],
            'category_id' => $validated['category_id'] ?? null,
            'style_number' => $validated['style_number'],
            'hs_number' => $validated['hs_number'] ?? null,
            'ref_number' => $validated['ref_number'] ?? null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'fabric_id' => $validated['fabric_id'],
            'gender_id' => $validated['gender_id'],
            'warehouse_id' => $validated['warehouse_id'],
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

        DB::transaction(function () use ($variantOnly, $product, $targetProductIds, $sharedAttributes, $primaryColorId, $primarySizeId, $barcodesMap, $primaryBarcodeKey, $colorIds, $sizeIds) {
            $newStyle = $this->upsertStyleFromProductName((string) ($sharedAttributes['name'] ?? ''));

            $productsToUpdate = Product::query()
                ->whereIn('id', $targetProductIds)
                ->get();

            $oldStyleIds = $productsToUpdate
                ->pluck('style_id')
                ->map(fn ($id) => (int) $id)
                ->filter(fn (int $id) => $id > 0)
                ->unique()
                ->values()
                ->all();

            foreach ($productsToUpdate as $item) {
                $colorId = $variantOnly ? $primaryColorId : (int) ($item->color_id ?? 0);
                $sizeId = $variantOnly ? $primarySizeId : (int) ($item->size_id ?? 0);
                $pairKey = "{$colorId}_{$sizeId}";

                $item->update(array_merge($sharedAttributes, [
                    'style_id' => $newStyle->id,
                    'color_id' => $colorId > 0 ? $colorId : $primaryColorId,
                    'size_id' => $sizeId > 0 ? $sizeId : $primarySizeId,
                    'barCode' => $barcodesMap[$pairKey] ?? $item->barCode ?? ($barcodesMap[$primaryBarcodeKey] ?? null),
                ]));
            }

            foreach ($oldStyleIds as $oldStyleId) {
                if ($oldStyleId === (int) $newStyle->id) {
                    continue;
                }

                $this->deleteStyleIfUnused($oldStyleId);
            }

            if ($variantOnly) {
                return;
            }

            $existingPairs = Product::query()
                ->where('brand_id', $sharedAttributes['brand_id'])
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
            $warehouseIds = WareHouse::query()->pluck('id')->all();
            $stockRows = [];
            $now = now();

            foreach ($colorIds as $colorId) {
                foreach ($sizeIds as $sizeId) {
                    $pairKey = "{$colorId}_{$sizeId}";

                    if (isset($existingPairMap[$pairKey])) {
                        continue;
                    }

                    $created = Product::query()->create(array_merge($sharedAttributes, [
                        'style_id' => $newStyle->id,
                        'color_id' => $colorId,
                        'size_id' => $sizeId,
                        'barCode' => $barcodesMap[$pairKey] ?? null,
                    ]));

                    foreach ($warehouseIds as $warehouseId) {
                        $stockRows[] = [
                            'product_id' => $created->id,
                            'stocks' => 0,
                            'warehouse_id' => (int) $warehouseId,
                            'cartoon_id' => null,
                            'barcode' => null,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    $existingPairMap[$pairKey] = true;
                }
            }

            if ($stockRows !== []) {
                Stock::query()->insert($stockRows);
            }
        });

        $this->deleteImagesIfUnreferenced($imagesToDeleteAfterUpdate, $product->id);

        return response()->json($this->productWithRelations($product->fresh()));
    }

    public function destroy(Product $product): JsonResponse
    {
        $imagesToDelete = array_merge([$product->cover_image], $product->gallery_images ?? []);
        $productId = $product->id;
        $styleId = (int) ($product->style_id ?? 0);
        $product->delete();
        $this->deleteImagesIfUnreferenced($imagesToDelete, $productId);
        $this->deleteStyleIfUnused($styleId);

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
        $styleIds = [];

        DB::transaction(function () use ($ids, &$imagesToDelete, &$styleIds) {
            $products = Product::query()
                ->whereIn('id', $ids)
                ->get();

            foreach ($products as $product) {
                $imagesToDelete = array_merge($imagesToDelete, [$product->cover_image], $product->gallery_images ?? []);
                $styleIds[] = (int) ($product->style_id ?? 0);
            }

            Product::query()->whereIn('id', $ids)->delete();
        });

        $this->deleteImagesIfUnreferenced($imagesToDelete);

        collect($styleIds)
            ->filter(fn ($id) => (int) $id > 0)
            ->unique()
            ->each(fn ($styleId) => $this->deleteStyleIfUnused((int) $styleId));

        return response()->json([
            'message' => 'Products deleted successfully.',
            'count' => count($ids),
        ]);
    }
}
