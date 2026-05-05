<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
      public function index(): JsonResponse
    {
                return response()->json(Supplier::query()->orderBy('name')->get());
    }

     public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'company_name'   => ['required', 'string', 'max:200'],
            'phone'          => ['required', 'string', 'max:50', 'unique:suppliers,phone'],
            'email'          => ['required', 'email', 'max:200'],
            'address'        => ['required', 'string', 'max:500'],
            'trade_license'  => ['nullable', 'string', 'max:100'],
            'contact_person' => ['required', 'string', 'max:100'],
            'status'         => ['required', 'in:active,inactive'],
        ]);

        $supplier = Supplier::query()->create($validated);

        return response()->json($supplier, 201);
    }

     public function show(Supplier $supplier): JsonResponse
    {
        return response()->json($supplier);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:100'],
            'company_name'   => ['required', 'string', 'max:200'],
            'phone'          => ['required', 'string', 'max:50', Rule::unique('suppliers', 'phone')->ignore($supplier->id)],
            'email'          => ['required', 'email', 'max:200'],
            'address'        => ['required', 'string', 'max:500'],
            'trade_license'  => ['nullable', 'string', 'max:100'],
            'contact_person' => ['required', 'string', 'max:100'],
            'status'         => ['required', 'in:active,inactive'],
        ]);
        $supplier->update($validated);

        return response()->json($supplier->fresh());
    }

    
    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();

        return response()->json(['message' => 'Supplier deleted']);
    }

}
  