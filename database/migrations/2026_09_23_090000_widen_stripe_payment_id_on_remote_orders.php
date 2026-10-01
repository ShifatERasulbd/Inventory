<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Local DB had this column as varchar(22) (schema drift from the original migration's
     * varchar(255) intent) which truncated real Stripe charge ids like "ch_3UGd7v...".
     */
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $table->string('stripe_payment_id', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $table->string('stripe_payment_id', 22)->nullable()->change();
        });
    }
};
