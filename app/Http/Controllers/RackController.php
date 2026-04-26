<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rack;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class RackController extends Controller
{
    private function visibleWarehouseIds(Request $request): ?array
    {
        $user = $request->user();

        if (! $user || $user->hasRole('super-admin')) {
            return null;
        }

        return collect($user->warehouse_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->values()
            ->all();
    }

    private function ensureRackVisible(Request $request, Rack $rack): void
    {
        $visibleWarehouseIds = $this->visibleWarehouseIds($request);

        if (is_array($visibleWarehouseIds) && ! in_array((int) $rack->warehouse_id, $visibleWarehouseIds, true)) {
            abort(404);
        }
    }

    public function index():JsonResponse{
        $query = Rack::query()
            ->with('warehouse:id,name')
            ->orderBy('name');

        $visibleWarehouseIds = $this->visibleWarehouseIds(request());
        if (is_array($visibleWarehouseIds)) {
            $query->whereIn('warehouse_id', $visibleWarehouseIds);
        }

        return response()->json(
            $query->get()
        );
    }

    public function store(Request $request):JsonResponse
    {
        $validated=$request->validate([
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'name' => ['required', 'string', 'max:120', 'unique:racks,name']
        ]);

        $visibleWarehouseIds = $this->visibleWarehouseIds($request);
        if (is_array($visibleWarehouseIds) && ! in_array((int) $validated['warehouse_id'], $visibleWarehouseIds, true)) {
            abort(403, 'You are not allowed to create racks for this warehouse.');
        }

        $rack = Rack::query()->create($validated);
        return response()->json($rack->load('warehouse:id,name'), 201);
    }

    public function show(Request $request, Rack $rack):JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        return response()->json($rack->load('warehouse:id,name'));
    }

    public function update(Request $request, Rack $rack):JsonResponse
    {
        $this->ensureRackVisible($request, $rack);

        $validated = $request->validate([
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'name' => ['required', 'string', 'max:120', Rule::unique('racks', 'name')->ignore($rack->id)]
        ]);

        $visibleWarehouseIds = $this->visibleWarehouseIds($request);
        if (is_array($visibleWarehouseIds) && ! in_array((int) $validated['warehouse_id'], $visibleWarehouseIds, true)) {
            abort(403, 'You are not allowed to move racks to this warehouse.');
        }

        $rack->update($validated);
        return response()->json($rack->load('warehouse:id,name'));
    }

    public function destroy(Request $request, Rack $rack):JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        $rack->delete();
        return response()->json(['message' => 'Rack deleted successfully']);
    }
}
