<?php

namespace App\Http\Controllers;

use App\Models\WareHouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            WareHouse::query()
                ->with('country:id,name', 'state:id,name')
                ->orderBy('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'name' => ['required', 'string', 'max:100'],
            'fulladress' => ['required', 'string', 'max:600'],
        ]);

        $warehouse = WareHouse::query()->create($validated);

        return response()->json($warehouse->load('country:id,name', 'state:id,name'), 201);
    }

    public function show(WareHouse $warehouse): JsonResponse
    {
        return response()->json($warehouse->load('country:id,name', 'state:id,name'));
    }

    public function update(Request $request, WareHouse $warehouse): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'state_id' => ['required', 'integer', 'exists:states,id'],
            'name' => ['required', 'string', 'max:100'],
            'fulladress' => ['required', 'string', 'max:600'],
        ]);

        $warehouse->update($validated);

        return response()->json($warehouse->fresh()->load('country:id,name', 'state:id,name'));
    }

    public function destroy(WareHouse $warehouse): JsonResponse
    {
        $warehouse->delete();

        return response()->json(['message' => 'Warehouse deleted']);
    }
}
