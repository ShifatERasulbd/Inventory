<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('remote_orders', 'order_from')) {
                $table->string('order_from', 50)->nullable()->default('website')->after('order_number')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (Schema::hasColumn('remote_orders', 'order_from')) {
                $table->dropColumn('order_from');
            }
        });
    }
};
