<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('accounts', 'brand_id')) {
                $table->foreignId('brand_id')
                    ->nullable()
                    ->after('warehouse_id')
                    ->constrained('brands')
                    ->nullOnDelete();

                $table->index(['brand_id', 'entry_type']);
            }
        });

        Schema::table('retail_sales', function (Blueprint $table) {
            if (! Schema::hasColumn('retail_sales', 'brand_id')) {
                $table->foreignId('brand_id')
                    ->nullable()
                    ->after('warehouse_id')
                    ->constrained('brands')
                    ->nullOnDelete();

                $table->index('brand_id');
            }
        });

        Schema::table('sells', function (Blueprint $table) {
            if (! Schema::hasColumn('sells', 'brand_id')) {
                $table->foreignId('brand_id')
                    ->nullable()
                    ->after('sold_to')
                    ->constrained('brands')
                    ->nullOnDelete();

                $table->index(['brand_id', 'selling_from']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('sells', function (Blueprint $table) {
            if (Schema::hasColumn('sells', 'brand_id')) {
                $table->dropForeign(['brand_id']);
                $table->dropIndex(['brand_id', 'selling_from']);
                $table->dropColumn('brand_id');
            }
        });

        Schema::table('retail_sales', function (Blueprint $table) {
            if (Schema::hasColumn('retail_sales', 'brand_id')) {
                $table->dropForeign(['brand_id']);
                $table->dropIndex(['brand_id']);
                $table->dropColumn('brand_id');
            }
        });

        Schema::table('accounts', function (Blueprint $table) {
            if (Schema::hasColumn('accounts', 'brand_id')) {
                $table->dropForeign(['brand_id']);
                $table->dropIndex(['brand_id', 'entry_type']);
                $table->dropColumn('brand_id');
            }
        });
    }
};
