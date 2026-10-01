<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // remote_id is only unique per source store (viveren and 1971co each have their own
        // independent id sequence), so the old single-column unique index would let one
        // store's order silently overwrite another store's order with the same remote_id.
        Schema::table('remote_orders', function (Blueprint $table) {
            $indexes = collect(DB::select('SHOW INDEX FROM remote_orders'))->pluck('Key_name')->unique();

            if ($indexes->contains('remote_orders_remote_id_unique')) {
                $table->dropUnique('remote_orders_remote_id_unique');
            }

            if (! $indexes->contains('remote_orders_remote_id_order_from_unique')) {
                $table->unique(['remote_id', 'order_from']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            $table->dropUnique(['remote_id', 'order_from']);
            $table->unique('remote_id');
        });
    }
};
