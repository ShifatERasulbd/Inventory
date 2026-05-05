<?php

namespace App\Http\Controllers;
use App\Models\Season;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SeasonController extends Controller
{
      public function index(): JsonResponse
    {
                return response()->json(Season::query()->orderBy('id')->get());
    }

     public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
         
        ]);

        $season = Season::query()->create($validated);

        return response()->json($season, 201);
    }

     public function show(Season $season): JsonResponse
    {
        return response()->json($season);
    }

    public function update(Request $request, Season $season): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
         
        ]);
        $season->update($validated);

        return response()->json($season->fresh());
    }

    
    public function destroy(Season $season): JsonResponse
    {
        $season->delete();

        return response()->json(['message' => 'Season deleted']);
    }

}
