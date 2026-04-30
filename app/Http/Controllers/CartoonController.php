<?php

namespace App\Http\Controllers;

use App\Models\Cartoon;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;

class CartoonController extends Controller
{
    //
    public function index():JsonResponse
    {
        return response()->json(Cartoon::query()->orderBy('id')->get()
        );
    }

    public function store(Request $request):JsonResponse{
        $validated=$request->validate([
            'cartoon_number'=>['required','string','max:120'],
        ]);
        $cartoon=Cartoon::query()->create($validated);
        return response()->json($cartoon,201);
    }

    public function show(Cartoon $cartoon):JsonResponse
    {
        return response()->json($cartoon);
    }

    public function update(Request $request,Cartoon $cartoon):JsonResponse
    {
        $validated=$request->validate([
            'cartoon_number'=>['required','string','max:120'],
        ]);
        $cartoon->update($validated);
        return response()->json($cartoon->fresh());
    }

    public function destroy(Cartoon $cartoon):JsonResponse
    {
        $cartoon->delete();
        return response()->json([
            'message'=>'Cartoon Deteled Successfully'
        ]);
    }
}
 