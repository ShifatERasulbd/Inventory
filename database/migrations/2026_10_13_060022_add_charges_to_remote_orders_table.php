<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->nullable()->after('total');
            $table->decimal('shipping_amazon', 10, 2)->default(0)->after('subtotal');
            $table->decimal('shipping_actual', 10, 2)->default(0)->after('shipping_amazon');
            $table->decimal('tax', 10, 2)->default(0)->after('shipping_actual');
            $table->decimal('amazon_fee', 10, 2)->default(0)->after('tax');
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'shipping_amazon', 'shipping_actual', 'tax', 'amazon_fee']);
        });
    }
};