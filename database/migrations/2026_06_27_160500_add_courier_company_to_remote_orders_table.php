<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('remote_orders', 'courier_company')) {
            Schema::table('remote_orders', function (Blueprint $table) {
                $table->string('courier_company')->nullable()->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('remote_orders', 'courier_company')) {
            Schema::table('remote_orders', function (Blueprint $table) {
                $table->dropColumn('courier_company');
            });
        }
    }
};
