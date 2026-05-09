<?php

namespace App\Http\Controllers;

use App\Models\Cartoon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartoonController extends Controller
{
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

    public function index(): JsonResponse
    {
        return response()->json(Cartoon::query()
            ->with('purchase')
            ->orderBy('id')
            ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cartoon_number' => ['required', 'string', 'max:120'],
            'p_o_number'     => ['required', 'integer', 'exists:purchases,id'],
        ]);

        $cartoon = Cartoon::query()->create([
            'cartoon_number' => $validated['cartoon_number'],
            'p_o_number'     => $validated['p_o_number'],
            'quantity'       => 0,
            'product_code'   => null,
        ]);

        return response()->json($cartoon->load('purchase'), 201);
    }

    public function show(Cartoon $cartoon): JsonResponse
    {
        return response()->json($cartoon->load('purchase'));
    }

    public function update(Request $request, Cartoon $cartoon): JsonResponse
    {
        $validated = $request->validate([
            'cartoon_number' => ['required', 'string', 'max:120'],
            'p_o_number'     => ['sometimes', 'integer', 'exists:purchases,id'],
        ]);

        $cartoon->update($validated);

        return response()->json($cartoon->fresh()->load('purchase'));
    }

    public function destroy(Cartoon $cartoon): JsonResponse
    {
        $cartoon->delete();
        return response()->json(['message' => 'Cartoon deleted successfully.']);
    }

    public function adjustQuantity(Request $request, Cartoon $cartoon): JsonResponse
    {
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

        return response()->json($cartoon->fresh()->load('purchase'));
    }
}
 