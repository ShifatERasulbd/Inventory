<?php

namespace App\Http\Controllers;

use App\Models\Cartoon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartoonController extends Controller
{
    private function getUserWarehouseIds(Request $request): array
    {
        $warehouseIds = $request->user()?->warehouse_ids;

        if (! is_array($warehouseIds) || $warehouseIds === []) {
            return [];
        }

        return array_values(array_filter(array_map(
            static fn ($id) => (is_int($id) || ctype_digit((string) $id)) ? (int) $id : null,
            $warehouseIds
        )));
    }

    private function canAccessCartoon(Request $request, Cartoon $cartoon): bool
    {
        if ($request->user()?->hasRole('super-admin')) {
            return true;
        }

        $warehouseIds = $this->getUserWarehouseIds($request);
        if ($warehouseIds === []) {
            return false;
        }

        return in_array((int) $cartoon->warehouse_id, $warehouseIds, true);
    }

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

    private function resolveWarehouseId(Request $request, array $validated): ?int
    {
        if ($request->user()?->hasRole('super-admin')) {
            $warehouseId = $validated['warehouse_id'] ?? null;

            return is_int($warehouseId) || ctype_digit((string) $warehouseId)
                ? (int) $warehouseId
                : null;
        }

        return $this->resolveLoginWarehouseId($request);
    }

    private function normalizeCodes(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        if (is_string($value)) {
            $codes = [];
            foreach (explode(',', $value) as $part) {
                $normalized = trim($part);
                if ($normalized !== '') {
                    $codes[] = $normalized;
                }
            }
            return $codes;
        }

        if (is_array($value)) {
            $codes = [];
            foreach ($value as $code) {
                if (! is_scalar($code)) {
                    continue;
                }
                $normalized = trim((string) $code);
                if ($normalized !== '') {
                    $codes[] = $normalized;
                }
            }
            return $codes;
        }

        return [];
    }

    public function index(Request $request): JsonResponse
    {
        $query = Cartoon::query()->with(['purchase', 'warehouse']);

        if (! $request->user()?->hasRole('super-admin')) {
            $warehouseIds = $this->getUserWarehouseIds($request);

            if ($warehouseIds === []) {
                return response()->json([]);
            }

            $query->whereIn('warehouse_id', $warehouseIds);
        }

        return response()->json(
            $query->orderBy('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $rules = [
            'cartoon_number' => ['required', 'string', 'max:120'],
            'p_o_number'     => ['required', 'integer', 'exists:purchases,id'],
            'rack_id'        => ['nullable', 'integer', 'exists:racks,id'],
            'rack_row_id'    => ['nullable', 'integer', 'exists:rack_rows,id'],
        ];

        if ($request->user()?->hasRole('super-admin')) {
            $rules['warehouse_id'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);

        $warehouseId = $this->resolveWarehouseId($request, $validated);
        if (! $warehouseId) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $cartoon = Cartoon::query()->create([
            'cartoon_number' => $validated['cartoon_number'],
            'p_o_number'     => $validated['p_o_number'],
            'quantity'       => 0,
            'product_code'   => null,
            'rack_id'        => $validated['rack_id'] ?? null,
            'rack_row_id'    => $validated['rack_row_id'] ?? null,
            'warehouse_id'   => $warehouseId,
        ]);

        return response()->json($cartoon->load(['purchase', 'warehouse']), 201);
    }

    public function show(Request $request, Cartoon $cartoon): JsonResponse
    {
        if (! $this->canAccessCartoon($request, $cartoon)) {
            return response()->json([
                'message' => 'You do not have permission to view this cartoon.',
            ], 403);
        }

        return response()->json($cartoon->load(['purchase', 'warehouse']));
    }

    public function update(Request $request, Cartoon $cartoon): JsonResponse
    {
        if (! $this->canAccessCartoon($request, $cartoon)) {
            return response()->json([
                'message' => 'You do not have permission to update this cartoon.',
            ], 403);
        }

        $rules = [
            'cartoon_number' => ['required', 'string', 'max:120'],
            'p_o_number'     => ['sometimes', 'integer', 'exists:purchases,id'],
            'rack_id'        => ['nullable', 'integer', 'exists:racks,id'],
            'rack_row_id'    => ['nullable', 'integer', 'exists:rack_rows,id'],
        ];

        if ($request->user()?->hasRole('super-admin')) {
            $rules['warehouse_id'] = ['required', 'integer', 'exists:warehouses,id'];
        }

        $validated = $request->validate($rules);

        $warehouseId = $this->resolveWarehouseId($request, $validated);
        if (! $warehouseId) {
            return response()->json([
                'message' => 'No warehouse is assigned to your user account.',
            ], 422);
        }

        $validated['warehouse_id'] = $warehouseId;

        $cartoon->update($validated);

        return response()->json($cartoon->fresh()->load(['purchase', 'warehouse']));
    }

    public function destroy(Request $request, Cartoon $cartoon): JsonResponse
    {
        if (! $this->canAccessCartoon($request, $cartoon)) {
            return response()->json([
                'message' => 'You do not have permission to delete this cartoon.',
            ], 403);
        }

        $cartoon->delete();
        return response()->json(['message' => 'Cartoon deleted successfully.']);
    }

    public function adjustQuantity(Request $request, Cartoon $cartoon): JsonResponse
    {
        if (! $this->canAccessCartoon($request, $cartoon)) {
            return response()->json([
                'message' => 'You do not have permission to adjust quantity for this cartoon.',
            ], 403);
        }

        $request->validate([
            'product_code'   => ['required', 'array', 'min:1'],
            'product_code.*' => ['string', 'max:120'],
            'adjust_mode'    => ['required', 'string', 'in:add,deduct'],
        ]);

        $incomingCodes  = $this->normalizeCodes($request->input('product_code'));
        $adjustMode     = $request->input('adjust_mode');
        $existingCodes  = is_array($cartoon->product_code) ? $cartoon->product_code : [];

        if ($adjustMode === 'deduct') {
            $pool = $existingCodes;
            foreach ($incomingCodes as $code) {
                $index = array_search($code, $pool, true);
                if ($index !== false) {
                    unset($pool[$index]);
                } elseif ($pool !== []) {
                    array_pop($pool);
                }
            }
            $newCodes = array_values($pool);
        } else {
            $newCodes = array_merge($existingCodes, $incomingCodes);
        }

        $cartoon->update([
            'product_code' => count($newCodes) > 0 ? $newCodes : null,
            'quantity'     => count($newCodes),
        ]);

        return response()->json($cartoon->fresh()->load(['purchase', 'warehouse']));
    }
}
 