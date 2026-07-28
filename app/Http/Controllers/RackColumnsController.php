<?php

namespace App\Http\Controllers;

use App\Models\Rack;
use App\Models\RackColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class RackColumnsController extends Controller
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
            RackColumn::with('row')
                ->where('rack_id', $rack->id)
                ->orderBy('row_id')
                ->orderBy('column_number')
                ->get()
        );
    }

    public function store(Request $request, Rack $rack): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);

        $validated = $request->validate([
            'row_id' => [
                'required',
                'integer',
                Rule::exists('rack_rows', 'id')->where('rack_id', $rack->id),
            ],
            'column_number' => ['required', 'string', 'max:50'],
            'code' => ['nullable', 'string', 'max:100'],
        ]);

        $this->ensureUniqueColumn($rack->id, (int) $validated['row_id'], $validated['column_number']);

        // Auto-generate code if not provided: {rack-name}-{row-number}-{column-number}
        if (empty($validated['code'])) {
            $row = \App\Models\RackRow::findOrFail((int) $validated['row_id']);
            $validated['code'] = $rack->name . '-' . $row->row_number . '-' . $validated['column_number'];
        }

        $rackColumn = RackColumn::create([
            'rack_id' => $rack->id,
            ...$validated,
        ])->load('row');

        return response()->json($rackColumn, 201);
    }

    public function show(Request $request, Rack $rack, RackColumn $column): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        abort_if((int) $column->rack_id !== (int) $rack->id, 404);

        return response()->json($column->load('row'));
    }

    public function update(Request $request, Rack $rack, RackColumn $column): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        abort_if((int) $column->rack_id !== (int) $rack->id, 404);

        $validated = $request->validate([
            'row_id' => [
                'required',
                'integer',
                Rule::exists('rack_rows', 'id')->where('rack_id', $rack->id),
            ],
            'column_number' => ['required', 'string', 'max:50'],
            'code' => ['nullable', 'string', 'max:100'],
        ]);

        $this->ensureUniqueColumn($rack->id, (int) $validated['row_id'], $validated['column_number'], $column->id);

        // Auto-generate code if not provided: {rack-name}-{row-number}-{column-number}
        if (empty($validated['code'])) {
            $row = \App\Models\RackRow::findOrFail((int) $validated['row_id']);
            $validated['code'] = $rack->name . '-' . $row->row_number . '-' . $validated['column_number'];
        }

        $column->update([
            'rack_id' => $rack->id,
            ...$validated,
        ]);

        return response()->json($column->load('row'));
    }

    public function destroy(Request $request, Rack $rack, RackColumn $column): JsonResponse
    {
        $this->ensureRackVisible($request, $rack);
        abort_if((int) $column->rack_id !== (int) $rack->id, 404);

        $column->delete();

        return response()->json(null, 204);
    }

    private function ensureUniqueColumn(int $rackId, int $rowId, string $columnNumber, ?int $ignoreId = null): void
    {
        $query = RackColumn::query()
            ->where('rack_id', $rackId)
            ->where('row_id', $rowId)
            ->where('column_number', $columnNumber);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'column_number' => ['The selected row already has this column number.'],
            ]);
        }
    }
}
