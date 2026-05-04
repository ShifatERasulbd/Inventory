<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: add the new JSON column
        Schema::table('purchases', function (Blueprint $table) {
            $table->json('products')->nullable()->after('purchase_to');
        });

        // Step 2: migrate existing rows into JSON array format
        DB::table('purchases')->get()->each(function ($row) {
            DB::table('purchases')->where('id', $row->id)->update([
                'products' => json_encode([
                    [
                        'product_id'     => $row->product_id,
                        'quantity'       => $row->quantity,
                        'purchase_price' => $row->purchase_price,
                        'selling_price'  => $row->selling_price,
                    ],
                ]),
            ]);
        });

        // Step 3: make column NOT NULL, drop old columns
        Schema::table('purchases', function (Blueprint $table) {
            $table->json('products')->nullable(false)->change();
            $table->dropForeign(['product_id']);
            $table->dropColumn(['product_id', 'quantity', 'purchase_price', 'selling_price']);
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('product_id')->after('purchase_to')->constrained('products')->cascadeOnUpdate()->restrictOnDelete();
            $table->unsignedInteger('quantity')->after('product_id')->default(0);
            $table->decimal('purchase_price', 12, 2)->after('po_number')->default(0);
            $table->decimal('selling_price', 12, 2)->after('purchase_price')->default(0);
        });

        // Restore first product from JSON into old columns
        DB::table('purchases')->get()->each(function ($row) {
            $products = json_decode($row->products, true);
            $first    = $products[0] ?? [];
            DB::table('purchases')->where('id', $row->id)->update([
                'product_id'     => $first['product_id'] ?? null,
                'quantity'       => $first['quantity'] ?? 0,
                'purchase_price' => $first['purchase_price'] ?? 0,
                'selling_price'  => $first['selling_price'] ?? 0,
            ]);
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('products');
        });
    }
};
