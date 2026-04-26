<?php

namespace App\Http\Controllers;

use App\Models\ProductFor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductForController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ProductFor::query()->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:products_for,name'],
            'age_limit' => ['required', 'string', 'max:100'],
        ]);

        $productFor = ProductFor::query()->create($validated);

        return response()->json($productFor, 201);
    }

    public function show(ProductFor $products_for): JsonResponse
    {
        return response()->json($products_for);
    }

    public function update(Request $request, ProductFor $products_for): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('products_for', 'name')->ignore($products_for->id),
            ],
            'age_limit' => ['required', 'string', 'max:100'],
        ]);

        $products_for->update($validated);

        return response()->json($products_for->fresh());
    }

    public function destroy(ProductFor $products_for): JsonResponse
    {
        $products_for->delete();

        return response()->json(['message' => 'Products For deleted']);
    }
}
