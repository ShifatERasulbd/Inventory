<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
            ->values()
            ->all();

        if ($paths !== []) {
            Storage::disk('public')->delete($paths);
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
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color_id' => ['required', 'integer', 'exists:colors,id'],
            'fabric_id' => ['required', 'integer', 'exists:fabrics,id'],
            'size_id' => ['required', 'integer', 'exists:sizes,id'],
            'gender_id' => ['required', 'integer', 'exists:products_for,id'],
            'barCode' => ['required', 'string', 'max:200', 'unique:products,barCode'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'cover_image' => ['nullable', 'image', 'max:3072'],
            'gallery_images' => ['nullable', 'array', 'max:8'],
            'gallery_images.*' => ['image', 'max:3072'],
        ]);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $this->storeImage($request->file('cover_image'));
        }

        if ($request->hasFile('gallery_images')) {
            $validated['gallery_images'] = $this->storeGalleryImages($request->file('gallery_images'));
        }

        $product = Product::query()->create($validated);

        return response()->json($this->productWithRelations($product), 201);
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
            'name' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:2000'],
            'color_id' => ['required', 'integer', 'exists:colors,id'],
            'fabric_id' => ['required', 'integer', 'exists:fabrics,id'],
            'size_id' => ['required', 'integer', 'exists:sizes,id'],
            'gender_id' => ['required', 'integer', 'exists:products_for,id'],
            'barCode' => ['required', 'string', 'max:200', Rule::unique('products', 'barCode')->ignore($product->id)],
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

        $removeCoverImage = filter_var($request->input('remove_cover_image'), FILTER_VALIDATE_BOOLEAN);

        if ($removeCoverImage && $product->cover_image) {
            $this->deleteImages([$product->cover_image]);
            $validated['cover_image'] = null;
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

            $this->deleteImages($removeGalleryPaths);

            $currentGalleryImages = array_values(array_diff($currentGalleryImages, $removeGalleryPaths));
            $validated['gallery_images'] = $currentGalleryImages;
        }

        if ($request->hasFile('cover_image')) {
            $this->deleteImages([$product->cover_image]);
            $validated['cover_image'] = $this->storeImage($request->file('cover_image'));
        }

        if ($request->hasFile('gallery_images')) {
            $newGalleryImages = $this->storeGalleryImages($request->file('gallery_images'));
            $baseGallery = $validated['gallery_images'] ?? $currentGalleryImages;
            $validated['gallery_images'] = array_values(array_merge($baseGallery, $newGalleryImages));
        }

        unset($validated['remove_cover_image'], $validated['remove_gallery_images']);

        $product->update($validated);

        return response()->json($this->productWithRelations($product->fresh()));
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->deleteImages(array_merge([$product->cover_image], $product->gallery_images ?? []));
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}
