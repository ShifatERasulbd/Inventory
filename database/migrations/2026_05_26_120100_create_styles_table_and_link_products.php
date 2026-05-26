<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('styles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('style_number', 50)->nullable();
            $table->string('hs_number', 100)->nullable();
            $table->string('ref_number', 100)->nullable();
            $table->string('name', 200)->nullable();
            $table->longText('description')->nullable();
            $table->unsignedBigInteger('fabric_id')->nullable();
            $table->unsignedBigInteger('gender_id')->nullable();
            $table->unsignedBigInteger('warehouse_id')->nullable();
            $table->unsignedBigInteger('season_id')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('gallery_images')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('style_id')->nullable()->after('category_id');
            $table->foreign('style_id')->references('id')->on('styles')->nullOnDelete();
        });

        $products = DB::table('products')
            ->select([
                'id',
                'brand_id',
                'category_id',
                'style_number',
                'hs_number',
                'ref_number',
                'name',
                'description',
                'fabric_id',
                'gender_id',
                'warehouse_id',
                'season_id',
                'cover_image',
                'gallery_images',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->get();

        $styleCache = [];

        foreach ($products as $product) {
            $key = implode('|', [
                (string) ($product->brand_id ?? ''),
                (string) ($product->category_id ?? ''),
                (string) ($product->style_number ?? ''),
                (string) ($product->fabric_id ?? ''),
                (string) ($product->gender_id ?? ''),
                (string) ($product->warehouse_id ?? ''),
                (string) ($product->ref_number ?? ''),
            ]);

            if (! isset($styleCache[$key])) {
                $styleCache[$key] = DB::table('styles')->insertGetId([
                    'brand_id' => $product->brand_id,
                    'category_id' => $product->category_id,
                    'style_number' => $product->style_number,
                    'hs_number' => $product->hs_number,
                    'ref_number' => $product->ref_number,
                    'name' => $product->name,
                    'description' => $product->description,
                    'fabric_id' => $product->fabric_id,
                    'gender_id' => $product->gender_id,
                    'warehouse_id' => $product->warehouse_id,
                    'season_id' => $product->season_id,
                    'cover_image' => $product->cover_image,
                    'gallery_images' => $product->gallery_images,
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ]);
            }

            DB::table('products')
                ->where('id', $product->id)
                ->update(['style_id' => $styleCache[$key]]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['style_id']);
            $table->dropColumn('style_id');
        });

        Schema::dropIfExists('styles');
    }
};
