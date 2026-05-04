<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropForeign(['purchase_id']);
            $table->dropUnique('sells_purchase_id_unique');
            $table->unique(['purchase_id', 'product_id'], 'sells_purchase_id_product_id_unique');
            $table->foreign('purchase_id')
                ->references('id')
                ->on('purchases')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            $table->dropForeign(['purchase_id']);
            $table->dropUnique('sells_purchase_id_product_id_unique');
            $table->unique('purchase_id', 'sells_purchase_id_unique');
            $table->foreign('purchase_id')
                ->references('id')
                ->on('purchases')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }
};
