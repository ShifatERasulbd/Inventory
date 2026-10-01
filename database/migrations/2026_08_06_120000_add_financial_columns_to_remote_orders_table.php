<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('remote_orders', 'state_tax')) {
                $table->decimal('state_tax', 10, 2)->default(0)->after('total');
            }

            if (! Schema::hasColumn('remote_orders', 'stripe_charge')) {
                $table->decimal('stripe_charge', 10, 2)->default(0)->after('state_tax');
            }

            if (! Schema::hasColumn('remote_orders', 'delivery_cost')) {
                $table->decimal('delivery_cost', 10, 2)->default(0)->after('stripe_charge');
            }

            if (! Schema::hasColumn('remote_orders', 'processing_fee')) {
                $table->decimal('processing_fee', 10, 2)->default(0)->after('delivery_cost');
            }
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $columns = [];

            if (Schema::hasColumn('remote_orders', 'processing_fee')) {
                $columns[] = 'processing_fee';
            }

            if (Schema::hasColumn('remote_orders', 'delivery_cost')) {
                $columns[] = 'delivery_cost';
            }

            if (Schema::hasColumn('remote_orders', 'stripe_charge')) {
                $columns[] = 'stripe_charge';
            }

            if (Schema::hasColumn('remote_orders', 'state_tax')) {
                $columns[] = 'state_tax';
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
