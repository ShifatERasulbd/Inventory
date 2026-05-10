<?php

namespace App\Http\Controllers;
use App\Models\Color;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ColorController extends Controller
{
    public function index():JsonResponse
    {
        return response()->json(Color::query()->orderBy('name')->get());
    }

    public function store(Request $request):JsonResponse
    {
        $validated= $request->validate([
            'name'=>['required','string','max:100'],
            'color_code'=>['nullable','string','max:50'],
        ]);
        $color= Color::query()->create($validated);
        return response()->json($color,201);
    }

     public function show(Color $color): JsonResponse
    {
        return response()->json($color);
    }

    public function update(Request $request,Color $color):JsonResponse
    {
        $validated=$request->validate([
            'name'=>['required','string','max:100'],
            'color_code'=>['nullable','string','max:50'],
        ]);
        $color->update($validated);
        return response()->json($color->fresh());
    }

    public function destroy(Color $color):JsonResponse
    {
        $color->delete();
        return response()->json(['message'=>'Color Deleted Successfully']);
    }

}
