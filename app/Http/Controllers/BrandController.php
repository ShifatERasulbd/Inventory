<?php

namespace App\Http\Controllers;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
      public function index(): JsonResponse
    {
        return response()->json(Brand::query()->orderBy('name')->get());
    }

     public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:countries,name'],
         
        ]);

        $brand = Brand::query()->create($validated);

        return response()->json($brand, 201);
    }

     public function show(Brand $brand): JsonResponse
    {
        return response()->json($brand);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:countries,name'],
         
        ]);

     

        $brand->update($validated);

        return response()->json($brand->fresh());
    }

    
    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json(['message' => 'Brand deleted']);
    }

}
