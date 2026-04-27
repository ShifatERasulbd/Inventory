<?php

namespace App\Http\Controllers;
use App\Models\Size;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SizeController extends Controller
{
    public function index():JsonResponse
    {
        return response()->json(Size::query()->orderBy('size')->get());
    }

    public function store(Request $request):JsonResponse
    {
        $validated=$request->validate([
            'size'=>['required','string','max:20'],
        ]);
        $size=Size::query()->create($validated);
        return response()->json($size,201);
    }

    public function show(Size $size): JsonResponse
    {
        return response()->json($size);
    }

    public function update(Request $request, Size $size): JsonResponse
    {
        $validated=$request->validate([
            'size'=>['required','string','max:20'],
        ]);
        $size->update($validated);
        return response()->json($size->fresh());
    }

    public function destroy(Size $size):JsonResponse
    {
        $size->delete();
        return response()->json(['message' => 'Size Deleted Successfully']);
    }
}
