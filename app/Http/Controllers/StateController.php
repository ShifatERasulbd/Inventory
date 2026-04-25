<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class StateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            State::query()
                ->with('country:id,name')
                ->orderBy('name')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('states', 'name')->where(
                    fn ($query) => $query->where('country_id', $request->input('country_id'))
                ),
            ],
        ]);

        $state = State::query()->create($validated);

        return response()->json($state->load('country:id,name'), 201);
    }

    public function show(State $state): JsonResponse
    {
        return response()->json($state->load('country:id,name'));
    }

    public function update(Request $request, State $state): JsonResponse
    {
        $validated = $request->validate([
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('states', 'name')
                    ->where(fn ($query) => $query->where('country_id', $request->input('country_id')))
                    ->ignore($state->id),
            ],
        ]);

        $state->update($validated);

        return response()->json($state->fresh()->load('country:id,name'));
    }

    public function destroy(State $state): JsonResponse
    {
        $state->delete();

        return response()->json(['message' => 'State deleted']);
    }

}
