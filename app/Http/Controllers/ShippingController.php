<?php

namespace App\Http\Controllers;

use App\Models\shipingTime;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShippingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(shipingTime::orderByDesc('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'shipping_time' => $request->input('shipping_time', $request->input('shipmentTime')),
            'production_time' => $request->input('production_time', $request->input('productionTime')),
        ]);

        $validated = $request->validate([
            'shipping_time'=>['required','string','max:100'],
            'production_time'=>['required','string','max:100'],
        ]);

        $shipingTime = shipingTime::create($validated);

        return response()->json($shipingTime, 201);
    }

    public function show(shipingTime $shipment): JsonResponse
    {
        return response()->json($shipment);
    }

    public function update(Request $request, shipingTime $shipment): JsonResponse
    {
        $request->merge([
            'shipping_time' => $request->input('shipping_time', $request->input('shipmentTime')),
            'production_time' => $request->input('production_time', $request->input('productionTime')),
        ]);

        $validated = $request->validate([
            'shipping_time'=>['required','string','max:100'],
            'production_time'=>['required','string','max:100'],
        ]);

        $shipment->update($validated);

        return response()->json($shipment->fresh());
    }

    public function destroy(shipingTime $shipment): JsonResponse
    {
        $shipment->delete();

        return response()->json(['message'=>'Shipping time deleted']);
    }
}
