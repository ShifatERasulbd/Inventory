<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('styles', function (Blueprint $table) {
            $table->dropColumn([
                'brand_id',
                'category_id',
                'style_number',
                'hs_number',
                'ref_number',
                'description',
                'fabric_id',
                'gender_id',
                'warehouse_id',
                'season_id',
                'cover_image',
                'gallery_images',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('styles', function (Blueprint $table) {
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('style_number', 50)->nullable();
            $table->string('hs_number', 100)->nullable();
            $table->string('ref_number', 100)->nullable();
            $table->longText('description')->nullable();
            $table->unsignedBigInteger('fabric_id')->nullable();
            $table->unsignedBigInteger('gender_id')->nullable();
            $table->unsignedBigInteger('warehouse_id')->nullable();
            $table->unsignedBigInteger('season_id')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('gallery_images')->nullable();
        });
    }
};
