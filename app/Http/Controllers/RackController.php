<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rack;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class RackController extends Controller
{
    public function index():JsonResponse{
        return response()->json(
            Rack::query()
            ->with('warehouse:id,name')
            ->orderBy('name')
            ->get()
        );
    }

    public function store(Request $request):JsonResponse
    {
        $validated=$request->validate([
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'name' => ['required', 'string', 'max:120', 'unique:racks,name']
        ]);
        $rack = Rack::query()->create($validated);
        return response()->json($rack->load('warehouse:id,name'), 201);
    }

    public function show(Rack $rack):JsonResponse
    {
        return response()->json($rack->load('warehouse:id,name'));
    }

    public function update(Request $request, Rack $rack):JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'name' => ['required', 'string', 'max:120', Rule::unique('racks', 'name')->ignore($rack->id)]
        ]);
        $rack->update($validated);
        return response()->json($rack->load('warehouse:id,name'));
    }

    public function destroy(Rack $rack):JsonResponse
    {
        $rack->delete();
        return response()->json(['message' => 'Rack deleted successfully']);
    }
}
