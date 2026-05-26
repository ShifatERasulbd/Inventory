<?php

namespace App\Http\Controllers;

use App\Models\Style;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StyleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Style::query()->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
        ]);

        $style = Style::query()->create($validated);

        return response()->json($style, 201);
    }

    public function show(Style $style): JsonResponse
    {
        return response()->json($style);
    }

    public function update(Request $request, Style $style): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:200'],
        ]);

        $style->update($validated);

        return response()->json($style->fresh());
    }

    public function destroy(Style $style): JsonResponse
    {
        $style->delete();

        return response()->json(['message' => 'Style deleted']);
    }
}
