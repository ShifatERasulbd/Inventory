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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->integer('brand_id')->nullable();
            $table->string('style_number')->nullable();
            $table->string('name')->nullable();
            $table->longText('description')->nullable();
            $table->integer('color_id')->nullable();
            $table->integer('fabric_id')->nullable();
            $table->integer('size_id')->nullable();
            $table->integer('gender_id')->nullable();
            $table->string('barCode')->nullable();
            $table->integer('warehouse_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
