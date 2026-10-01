<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $columns = [];

            foreach (['courier_company', 'courier_api_connected', 'courier_api_checked_at', 'courier_api_message'] as $column) {
                if (Schema::hasColumn('remote_orders', $column)) {
                    $columns[] = $column;
                }
            }

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('remote_orders', 'courier_company')) {
                $table->string('courier_company')->nullable()->after('status');
            }

            if (! Schema::hasColumn('remote_orders', 'courier_api_connected')) {
                $table->boolean('courier_api_connected')->nullable()->after('courier_company');
            }

            if (! Schema::hasColumn('remote_orders', 'courier_api_checked_at')) {
                $table->timestamp('courier_api_checked_at')->nullable()->after('courier_api_connected');
            }

            if (! Schema::hasColumn('remote_orders', 'courier_api_message')) {
                $table->string('courier_api_message', 1000)->nullable()->after('courier_api_checked_at');
            }
        });
    }
};
