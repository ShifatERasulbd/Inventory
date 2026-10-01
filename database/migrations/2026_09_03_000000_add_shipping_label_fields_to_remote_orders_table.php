<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('remote_orders', 'shipping_carrier')) {
                $table->string('shipping_carrier')->nullable()->after('status');
            }

            if (! Schema::hasColumn('remote_orders', 'shipping_service')) {
                $table->string('shipping_service')->nullable()->after('shipping_carrier');
            }

            if (! Schema::hasColumn('remote_orders', 'tracking_url')) {
                $table->string('tracking_url', 1000)->nullable()->after('shipping_service');
            }

            if (! Schema::hasColumn('remote_orders', 'label_url')) {
                $table->string('label_url', 1000)->nullable()->after('tracking_url');
            }

            if (! Schema::hasColumn('remote_orders', 'label_purchased_at')) {
                $table->timestamp('label_purchased_at')->nullable()->after('label_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $columns = [];

            foreach (['shipping_carrier', 'shipping_service', 'tracking_url', 'label_url', 'label_purchased_at'] as $column) {
                if (Schema::hasColumn('remote_orders', $column)) {
                    $columns[] = $column;
                }
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
