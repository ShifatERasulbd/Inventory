<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('warehouse_brand')) {
            return;
        }

        Schema::create('warehouse_brand', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnUpdate()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['warehouse_id', 'brand_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_brand');
    }
};
