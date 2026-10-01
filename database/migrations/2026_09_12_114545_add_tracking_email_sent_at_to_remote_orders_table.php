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
        Schema::table('remote_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('remote_orders', 'tracking_email_sent_at')) {
                $table->timestamp('tracking_email_sent_at')->nullable()->after('tracking_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (Schema::hasColumn('remote_orders', 'tracking_email_sent_at')) {
                $table->dropColumn('tracking_email_sent_at');
            }
        });
    }
};
