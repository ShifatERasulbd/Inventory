<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_sales', function (Blueprint $table) {
            if (! Schema::hasColumn('retail_sales', 'status')) {
                $table->string('status')->nullable()->after('note');
            }
            if (! Schema::hasColumn('retail_sales', 'remote_order_id')) {
                $table->unsignedBigInteger('remote_order_id')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('retail_sales', function (Blueprint $table) {
            $table->dropColumn(['status', 'remote_order_id']);
        });
    }
};
