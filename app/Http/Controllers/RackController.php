<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rack;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class RackController extends Controller
{
    private function resolveLoginWarehouseId(Request $request): ?int
    {
        $warehouseIds = $request->user()?->warehouse_ids;

        if (! is_array($warehouseIds) || $warehouseIds === []) {
            return null;
        }

        $warehouseId = $warehouseIds[0] ?? null;

        return is_int($warehouseId) || ctype_digit((string) $warehouseId)
            ? (int) $warehouseId
            : null;
    }

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
        $rules = [
            'name' => ['required', 'string', 'max:120', 'unique:racks,name'],
        ];

        if ($request->user()?->hasRole('super-admin')) {
            $rules['warehouse_id'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);

        $warehouseId = $request->user()?->hasRole('super-admin')
            ? (int) ($validated['warehouse_id'] ?? 0)
            : $this->resolveLoginWarehouseId($request);

        if (! $warehouseId) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $visibleWarehouseIds = $this->visibleWarehouseIds($request);
        if (is_array($visibleWarehouseIds) && ! in_array($warehouseId, $visibleWarehouseIds, true)) {
            abort(403, 'You are not allowed to create racks for this warehouse.');
        }

        $rack = Rack::query()->create([
            'name' => $validated['name'],
            'warehouse_id' => $warehouseId,
        ]);
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

        $rules = [
            'name' => ['required', 'string', 'max:120', Rule::unique('racks', 'name')->ignore($rack->id)],
        ];

        if ($request->user()?->hasRole('super-admin')) {
            $rules['warehouse_id'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);

        $warehouseId = $request->user()?->hasRole('super-admin')
            ? (int) ($validated['warehouse_id'] ?? 0)
            : (int) $rack->warehouse_id;

        $visibleWarehouseIds = $this->visibleWarehouseIds($request);
        if (is_array($visibleWarehouseIds) && ! in_array($warehouseId, $visibleWarehouseIds, true)) {
            abort(403, 'You are not allowed to move racks to this warehouse.');
        }

        $rack->update([
            'name' => $validated['name'],
            'warehouse_id' => $warehouseId,
        ]);
        return response()->json($rack->load('warehouse:id,name'));
    }

    public function destroy(Request $request, Rack $rack):JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        $rack->delete();
        return response()->json(['message' => 'Rack deleted successfully']);
    }
}
