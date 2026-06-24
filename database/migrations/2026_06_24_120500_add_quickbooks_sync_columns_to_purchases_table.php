<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->string('quickbooks_sync_status', 30)->nullable()->after('note');
            $table->timestamp('quickbooks_synced_at')->nullable()->after('quickbooks_sync_status');
            $table->string('quickbooks_txn_id')->nullable()->after('quickbooks_synced_at');
            $table->text('quickbooks_last_error')->nullable()->after('quickbooks_txn_id');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn([
                'quickbooks_sync_status',
                'quickbooks_synced_at',
                'quickbooks_txn_id',
                'quickbooks_last_error',
            ]);
        });
    }
};
