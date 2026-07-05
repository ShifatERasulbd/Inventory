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
        if (! Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->foreignId('brand_id')
                    ->nullable()
                    ->after('warehouse_id')
                    ->constrained('brands')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table): void {
                $table->dropConstrainedForeignId('brand_id');
            });
        }
    }
};
