<?php

namespace App\Http\Controllers;
use App\Models\Fabric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FabricController extends Controller
{
    //
    public function index():JsonResponse
    {
        return response()->json(Fabric::query()->orderBy('name'));
    }

    public function store(Request $request):JsonResponse
    {
        $validated=$request->validate([
            'name'=>['required','string','max:100'],
        ]);

        $fabric=Fabric::query()->create($validated);
        return response()->json($fabric,201);
    }

    public function show(Fabric $fabric):JsonResponse
    {
        return response()->json($fabric);
    }

    public function update (Request $request,Fabric $fabric):JsonResponse
    {
        $validated=$request->validate([
            'name'=>['required','string','max:100'],
        ]);
        $fabric->update($validated);
        return response()->json($fabric->fresh());
    }

    public function destroy(Fabric $fabric):JsonResponse
    {
        $fabric->delete();

        return response()->json(['message'=>'Fabric Deleted Successfully']);
    }
}
