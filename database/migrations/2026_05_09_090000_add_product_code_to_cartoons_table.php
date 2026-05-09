<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            $table->json('product_code')->nullable()->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            $table->dropColumn('product_code');
        });
    }
};
