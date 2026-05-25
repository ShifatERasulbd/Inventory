<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('subtotal', 14, 2)->default(0)->after('products');
            $table->decimal('total_amount', 14, 2)->default(0)->after('subtotal');
            $table->decimal('paid_amount', 14, 2)->default(0)->after('total_amount');
            $table->decimal('due_amount', 14, 2)->default(0)->after('paid_amount');
            $table->string('payment_status', 30)->default('unpaid')->after('due_amount');
            $table->string('payment_method', 50)->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn([
                'subtotal',
                'total_amount',
                'paid_amount',
                'due_amount',
                'payment_status',
                'payment_method',
            ]);
        });
    }
};
