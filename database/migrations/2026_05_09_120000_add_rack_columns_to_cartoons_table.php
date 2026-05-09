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
        Schema::table('cartoons', function (Blueprint $table) {
            $table->unsignedBigInteger('rack_id')->nullable()->after('product_code');
            $table->unsignedBigInteger('rack_row_id')->nullable()->after('rack_id');
            
            $table->foreign('rack_id')->references('id')->on('racks')->onDelete('set null');
            $table->foreign('rack_row_id')->references('id')->on('rack_rows')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            $table->dropForeign(['rack_id']);
            $table->dropForeign(['rack_row_id']);
            $table->dropColumn(['rack_id', 'rack_row_id']);
        });
    }
};
