<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('product_brand')) {
            return;
        }

        Schema::create('product_brand', function (Blueprint $table): void {
            $table->foreignId('product_id')->constrained('products')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained('brands')->cascadeOnUpdate()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['product_id', 'brand_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_brand');
    }
};
