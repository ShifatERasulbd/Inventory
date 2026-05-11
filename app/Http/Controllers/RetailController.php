<?php

namespace App\Http\Controllers;

use App\Models\Cartoon;
use App\Models\RetailSale;
use App\Models\Sell;
use App\Models\Stock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RetailController extends Controller
{
    /**
     * Look up a stock item by barcode.
     * Also returns the latest known selling price for that product.
     */
    public function lookupBarcode(Request $request): JsonResponse
    {
        $barcode = trim((string) $request->query('barcode', ''));
        $warehouseId = (int) $request->query('warehouse_id', 0);

        if ($barcode === '') {
            return response()->json(['message' => 'Barcode is required.'], 422);
        }

        if ($warehouseId <= 0) {
            return response()->json(['message' => 'Warehouse ID is required.'], 422);
        }

        $user = $request->user();
        $warehouseIds = $this->resolveWarehouseIds($user);

        if ($warehouseIds !== null && ! in_array($warehouseId, $warehouseIds, true)) {
            return response()->json(['message' => 'You do not have access to this warehouse.'], 403);
        }

        // Search stocks where the barcode JSON array contains this value
        $query = Stock::query()
            ->with([
                'product:id,name,size_id,color_id,barCode',
                'product.size:id,size',
                'product.color:id,name,color_code',
                'warehouse:id,name',
            ])
            ->where('warehouse_id', $warehouseId)
            ->where('stocks', '>', 0)
            ->whereJsonContains('barcode', $barcode);

        if ($warehouseIds !== null) {
            $query->whereIn('warehouse_id', $warehouseIds);
        }

        $stock = $query->first();

        // Fallback: try product barCode field
        if (! $stock) {
            $productQuery = Stock::query()
                ->with([
                    'product:id,name,size_id,color_id,barCode',
                    'product.size:id,size',
                    'product.color:id,name,color_code',
                    'warehouse:id,name',
                ])
                ->where('warehouse_id', $warehouseId)
                ->where('stocks', '>', 0)
                ->whereHas('product', fn ($q) => $q->where('barCode', $barcode));

            if ($warehouseIds !== null) {
                $productQuery->whereIn('warehouse_id', $warehouseIds);
            }

            $stock = $productQuery->first();
        }

        if (! $stock) {
            return response()->json(['message' => 'Product not found for this barcode.'], 404);
        }

        // Get latest selling price from sells table
        $latestSell = Sell::query()
            ->where('product_id', $stock->product_id)
            ->whereNotNull('selling_price')
            ->orderByDesc('id')
            ->value('selling_price');

        // Get available cartoons for this product in the warehouse
        $cartoons = Cartoon::query()
            ->where('warehouse_id', $warehouseId)
            ->where('quantity', '>', 0)
            ->where(function ($q) use ($barcode, $stock) {
                // Cartoons store barcode codes in product_code.
                $q->whereJsonContains('product_code', $barcode);

                $productBarcode = trim((string) ($stock->product?->barCode ?? ''));
                if ($productBarcode !== '' && $productBarcode !== $barcode) {
                    $q->orWhereJsonContains('product_code', $productBarcode);
                }
            })
            ->get(['id', 'cartoon_number', 'quantity'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'cartoon_number' => $c->cartoon_number,
                'available_quantity' => (int) $c->quantity,
            ])
            ->toArray();

        return response()->json([
            'stock_id'       => $stock->id,
            'product_id'     => $stock->product_id,
            'product_name'   => $stock->product?->name,
            'size'           => $stock->product?->size?->size,
            'color'          => $stock->product?->color?->name ?? $stock->product?->color?->color_code,
            'barcode'        => $barcode,
            'available_stock' => (int) $stock->stocks,
            'warehouse_id'   => $stock->warehouse_id,
            'warehouse_name' => $stock->warehouse?->name,
            'unit_price'     => $latestSell ? (float) $latestSell : 0.00,
            'cartoons'       => $cartoons,
        ]);
    }

    /**
     * Complete a retail sale.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id'           => ['required', 'integer', 'exists:warehouses,id'],
            'payment_method'         => ['required', 'string', 'in:cash,card,transfer,other'],
            'note'                   => ['nullable', 'string', 'max:1000'],
            'items'                  => ['required', 'array', 'min:1'],
            'items.*.stock_id'       => ['required', 'integer', 'exists:stocks,id'],
            'items.*.product_id'     => ['required', 'integer', 'exists:products,id'],
            'items.*.product_name'   => ['required', 'string'],
            'items.*.barcode'        => ['nullable', 'string'],
            'items.*.quantity'       => ['required', 'integer', 'min:1'],
            'items.*.unit_price'     => ['required', 'numeric', 'min:0'],
            'items.*.cartoon_id'     => ['nullable', 'integer', 'exists:cartoons,id'],
        ]);

        $user = $request->user();
        $warehouseIds = $this->resolveWarehouseIds($user);

        DB::beginTransaction();

        try {
            $stockIds = array_column($validated['items'], 'stock_id');
            $stocks   = Stock::query()
                ->whereIn('id', array_unique($stockIds))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Validate quantities and warehouse access
            foreach ($validated['items'] as $item) {
                $stock = $stocks->get($item['stock_id']);

                if (! $stock) {
                    DB::rollBack();
                    return response()->json(['message' => "Stock #{$item['stock_id']} not found."], 422);
                }

                if ($warehouseIds !== null && ! in_array($stock->warehouse_id, $warehouseIds, true)) {
                    DB::rollBack();
                    return response()->json(['message' => 'You do not have access to this warehouse.'], 403);
                }

                if ((int) $stock->stocks < (int) $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "Insufficient stock for \"{$item['product_name']}\". Available: {$stock->stocks}.",
                    ], 422);
                }
            }

            // Compute line totals and overall total
            $lineItems   = [];
            $totalAmount = 0.0;

            foreach ($validated['items'] as $item) {
                $lineTotal     = round((float) $item['unit_price'] * (int) $item['quantity'], 2);
                $totalAmount  += $lineTotal;
                $lineItems[]   = [
                    'stock_id'     => $item['stock_id'],
                    'product_id'   => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'barcode'      => $item['barcode'] ?? null,
                    'quantity'     => (int) $item['quantity'],
                    'unit_price'   => (float) $item['unit_price'],
                    'cartoon_id'   => $item['cartoon_id'] ?? null,
                    'total'        => $lineTotal,
                ];
            }

            // Get cartoon IDs from validated items
            $cartoonIds = array_filter(array_column($validated['items'], 'cartoon_id'));
            $cartoons   = [];
            if (!empty($cartoonIds)) {
                $cartoons = Cartoon::query()
                    ->whereIn('id', array_unique($cartoonIds))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');
            }

            // Deduct stock for each item
            foreach ($lineItems as $lineItem) {
                $stock    = $stocks->get($lineItem['stock_id']);
                $existing = is_array($stock->barcode) ? $stock->barcode : [];
                $newQty   = (int) $stock->stocks - $lineItem['quantity'];

                // Remove the matching barcodes from the barcode array
                $barcodes     = $existing;
                $toRemove     = $lineItem['quantity'];
                if ($lineItem['barcode']) {
                    foreach ($barcodes as $idx => $bc) {
                        if ($bc === $lineItem['barcode'] && $toRemove > 0) {
                            unset($barcodes[$idx]);
                            $toRemove--;
                        }
                    }
                }
                // If barcode wasn't specific enough, just pop from the end
                while ($toRemove > 0 && ! empty($barcodes)) {
                    array_pop($barcodes);
                    $toRemove--;
                }

                $stock->update([
                    'stocks'  => max(0, $newQty),
                    'barcode' => array_values($barcodes),
                ]);

                // Deduct from cartoon if specified
                $cartoonId = $lineItem['cartoon_id'] ?? null;
                if ($cartoonId && isset($cartoons[$cartoonId])) {
                    $cartoon = $cartoons[$cartoonId];

                    if ((int) $cartoon->quantity < (int) $lineItem['quantity']) {
                        DB::rollBack();
                        return response()->json([
                            'message' => "Insufficient quantity in selected cartoon {$cartoon->cartoon_number}.",
                        ], 422);
                    }

                    $cartoon->update([
                        'quantity' => max(0, (int) $cartoon->quantity - $lineItem['quantity']),
                    ]);
                }
            }

            // Generate reference number
            $reference = 'RET-' . strtoupper(substr(md5(uniqid('', true)), 0, 8));

            $sale = RetailSale::query()->create([
                'reference_number' => $reference,
                'warehouse_id'     => $validated['warehouse_id'],
                'sold_by'          => $user->id,
                'items'            => $lineItems,
                'total_amount'     => round($totalAmount, 2),
                'payment_method'   => $validated['payment_method'],
                'note'             => $validated['note'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'id'               => $sale->id,
                'reference_number' => $sale->reference_number,
                'total_amount'     => (float) $sale->total_amount,
                'payment_method'   => $sale->payment_method,
                'items'            => $sale->items,
                'created_at'       => $sale->created_at?->toDateTimeString(),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * List retail sales.
     */
    public function index(Request $request): JsonResponse
    {
        $user         = $request->user();
        $warehouseIds = $this->resolveWarehouseIds($user);

        $query = RetailSale::query()
            ->with(['warehouse:id,name', 'seller:id,name'])
            ->orderByDesc('id');

        if ($warehouseIds !== null) {
            $query->whereIn('warehouse_id', $warehouseIds);
        }

        return response()->json(
            $query->get()->map(fn (RetailSale $sale) => [
                'id'               => $sale->id,
                'reference_number' => $sale->reference_number,
                'warehouse_id'     => $sale->warehouse_id,
                'warehouse_name'   => $sale->warehouse?->name,
                'sold_by'          => $sale->sold_by,
                'seller_name'      => $sale->seller?->name,
                'items'            => $sale->items,
                'total_amount'     => (float) $sale->total_amount,
                'payment_method'   => $sale->payment_method,
                'note'             => $sale->note,
                'created_at'       => $sale->created_at?->format('Y-m-d H:i'),
            ])
        );
    }

    private function resolveWarehouseIds($user): ?array
    {
        if ($user->hasRole('super-admin')) {
            return null; // no restriction
        }

        $ids = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];
        return $ids === [] ? [] : $ids;
    }
}
