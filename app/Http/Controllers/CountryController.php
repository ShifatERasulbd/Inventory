<?php
   
namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CountryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Country::query()->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:countries,name'],
            'code' => ['required', 'string', 'size:2', 'unique:countries,code'],
            'currency_code' => ['required', 'string', 'size:3'],
        ]);

        $validated['code'] = strtoupper($validated['code']);
        $validated['currency_code'] = strtoupper($validated['currency_code']);

        $country = Country::query()->create($validated);

        return response()->json($country, 201);
    }

    public function show(Country $country): JsonResponse
    {
        return response()->json($country);
    }

    public function update(Request $request, Country $country): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('countries', 'name')->ignore($country->id),
            ],
            'code' => [
                'required',
                'string',
                'size:2',
                Rule::unique('countries', 'code')->ignore($country->id),
            ],
            'currency_code' => ['required', 'string', 'size:3'],
        ]);

        $validated['code'] = strtoupper($validated['code']);
        $validated['currency_code'] = strtoupper($validated['currency_code']);

        $country->update($validated);

        return response()->json($country->fresh());
    }

    public function destroy(Country $country): JsonResponse
    {
        $country->delete();

        return response()->json(['message' => 'Country deleted']);
    }
}