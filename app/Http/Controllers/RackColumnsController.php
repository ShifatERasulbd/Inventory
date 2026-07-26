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
    public function index(Request $request, Rack $rack): JsonResponse
    {
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
        $validated = $request->validate([
            'row_id' => [
                'required',
                'integer',
                Rule::exists('rack_rows', 'id')->where('rack_id', $rack->id),
            ],
            'column_number' => ['required', 'string', 'max:50'],
            'code' => ['required', 'string', 'max:100', 'unique:rack_columns,code'],
        ]);

        $this->ensureUniqueColumn($rack->id, (int) $validated['row_id'], $validated['column_number']);

        $rackColumn = RackColumn::create([
            'rack_id' => $rack->id,
            ...$validated,
        ])->load('row');

        return response()->json($rackColumn, 201);
    }

    public function show(Request $request, Rack $rack, RackColumn $rackColumn): JsonResponse
    {
        abort_if((int) $rackColumn->rack_id !== (int) $rack->id, 404);

        return response()->json($rackColumn->load('row'));
    }

    public function update(Request $request, Rack $rack, RackColumn $rackColumn): JsonResponse
    {
        abort_if((int) $rackColumn->rack_id !== (int) $rack->id, 404);

        $validated = $request->validate([
            'row_id' => [
                'required',
                'integer',
                Rule::exists('rack_rows', 'id')->where('rack_id', $rack->id),
            ],
            'column_number' => ['required', 'string', 'max:50'],
            'code' => ['required', 'string', 'max:100', 'unique:rack_columns,code,' . $rackColumn->id],
        ]);

        $this->ensureUniqueColumn($rack->id, (int) $validated['row_id'], $validated['column_number'], $rackColumn->id);

        $rackColumn->update([
            'rack_id' => $rack->id,
            ...$validated,
        ]);

        return response()->json($rackColumn->load('row'));
    }

    public function destroy(Request $request, Rack $rack, RackColumn $rackColumn): JsonResponse
    {
        abort_if((int) $rackColumn->rack_id !== (int) $rack->id, 404);

        $rackColumn->delete();

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
