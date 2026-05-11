<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_sales', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number', 50)->unique();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('sold_by')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->json('items'); // [{stock_id, product_id, product_name, barcode, quantity, unit_price, total}]
            $table->decimal('total_amount', 12, 2);
            $table->string('payment_method', 50)->default('cash');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('reference_number');
            $table->index('warehouse_id');
            $table->index('sold_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_sales');
    }
};
