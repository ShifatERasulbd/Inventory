<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\WareHouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
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

        return $normalized;
    }

    private function productWithRelations(Product $product): Product
    {
        return $product->load([
            'brand:id,name',
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
        return $this->normalizeStoredPath($file->store('products', 'public'));
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

        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
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

        if ($pathsToDelete !== []) {
            Storage::disk('public')->delete($pathsToDelete);
        }
    }

    public function index(): JsonResponse
    {
        return response()->json(
            Product::query()
                ->with([
                    'brand:id,name',
                    'color:id,name',
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
            'style_number' => ['required', 'string', 'max:50'],
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

                foreach ($colorIds as $colorId) {
                    foreach ($sizeIds as $sizeId) {
                        $product = Product::query()->create([
                            'brand_id' => $validated['brand_id'],
                            'style_number' => $validated['style_number'],
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

    public function show(Product $product): JsonResponse
    {
        return response()->json($this->productWithRelations($product));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'style_number' => ['required', 'string', 'max:50'],
            'ref_number' => ['nullable', 'string', 'max:100'],
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color_id' => ['required', 'integer', 'exists:colors,id'],
            'fabric_id' => ['required', 'integer', 'exists:fabrics,id'],
             'season_id' => ['nullable', 'integer', 'exists:seasons,id'],
            'size_id' => ['required', 'integer', 'exists:sizes,id'],
            'gender_id' => ['required', 'integer', 'exists:products_for,id'],
            'barCode' => ['required', 'string', 'max:200'],
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

        unset($validated['remove_cover_image'], $validated['remove_gallery_images']);

        $product->update($validated);
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
