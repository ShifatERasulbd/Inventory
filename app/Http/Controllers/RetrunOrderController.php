<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Return_order;
use Illuminate\Http\JsonResponse;
use App\Models\RemoteOrder;
use App\Models\RetailSale;
use App\Models\Stock;
use Illuminate\Support\Facades\DB;


class RetrunOrderController extends Controller
{
   public function index(): JsonResponse
   {
      $returnOrders = Return_order::with('order')->get();
      return response()->json($returnOrders);
   }

   public function show($id): JsonResponse
   {
      $returnOrder = Return_order::with('order')->findorFail($id);
      return response()->json($returnOrder);
   }

   public function store(Request $request): JsonResponse
   {
      $validatedData = $request->validate([
        'order_number_id' => 'required|exists:remote_orders,id',
        'reason' => 'nullable|string',
      ]);

      return DB::transaction(function () use ($validatedData) {
         $remoteOrder = RemoteOrder::findorFail($validatedData['order_number_id']);

         $remoteOrder->update(['status' => 'returned']);

         $this->restockReturnedOrder($remoteOrder);

         $returnOrder = Return_order::create($validatedData);
         return response()->json($returnOrder,201);
      });
   }

   /**
    * Add back the quantities sold against this order to their warehouse stock.
    */
   private function restockReturnedOrder(RemoteOrder $remoteOrder): void
   {
      $sale = RetailSale::where('remote_order_id', $remoteOrder->id)->first();

      if (! $sale || ! is_array($sale->items)) {
         return;
      }

      foreach ($sale->items as $item) {
         $stockId  = $item['stock_id'] ?? null;
         $quantity = (int) ($item['quantity'] ?? 0);

         if (! $stockId || $quantity <= 0) {
            continue;
         }

         Stock::where('id', $stockId)->increment('stocks', $quantity);
      }
   }

   public function update(Request $request, $id): JsonResponse
   {
     $returnOrder = Return_order::findorFail($id);
     $validatedData =$request->validate([
        'order_number_id' => 'required|exists:remote_orders,id',
        'reason' => 'required|string',
     ]);

     $returnOrder->update($validatedData);
     return response()->json($returnOrder->fresh());
   }

   public function destroy($id): JsonResponse
   {
     $returnOrder = Return_order::findorFail($id);
     $returnOrder->delete();
     return response()->json(['message'=>'Retun Order Deleted Successfully']);
   }

   public function getRemoteOrders(): JsonResponse
   {
      $remoteOrders = RemoteOrder::whereIn('status', ['shipped', 'delivered'])->latest()->get();
      return response()->json($remoteOrders);
   }
}
