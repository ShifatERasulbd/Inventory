<?php

namespace App\Http\Controllers;

use App\Models\Rack;
use App\Models\RackRow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RackRowController extends Controller
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

    public function index(Request $request, Rack $rack): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);

        return response()->json(
            $rack->rows()->orderBy('row_number')->get()
        );
    }

    public function store(Request $request, Rack $rack): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);

        $validated = $request->validate([
            'row_number' => [
                'required', 'string', 'max:50',
                Rule::unique('rack_rows', 'row_number')->where('rack_id', $rack->id),
            ],
            'code' => ['required', 'string', 'max:100', 'unique:rack_rows,code'],
        ]);

        $validated['rack_id'] = $rack->id;
        $row = RackRow::query()->create($validated);

        return response()->json($row, 201);
    }

    public function show(Request $request, Rack $rack, RackRow $row): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        abort_if($row->rack_id !== $rack->id, 404);
        return response()->json($row);
    }

    public function update(Request $request, Rack $rack, RackRow $row): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        abort_if($row->rack_id !== $rack->id, 404);

        $validated = $request->validate([
            'row_number' => [
                'required', 'string', 'max:50',
                Rule::unique('rack_rows', 'row_number')->where('rack_id', $rack->id)->ignore($row->id),
            ],
            'code' => [
                'required', 'string', 'max:100',
                Rule::unique('rack_rows', 'code')->ignore($row->id),
            ],
        ]);

        $row->update($validated);

        return response()->json($row);
    }

    public function destroy(Request $request, Rack $rack, RackRow $row): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        abort_if($row->rack_id !== $rack->id, 404);
        $row->delete();
        return response()->json(['message' => 'Row deleted successfully']);
    }
}
