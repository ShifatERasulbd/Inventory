<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The 1971co feed can occasionally send malformed/oversized order_number values;
        // widen the column so a bad upstream record can't crash the sync.
        DB::statement('ALTER TABLE return_requests MODIFY order_number TEXT NULL');
        DB::statement('ALTER TABLE return_requests MODIFY request_reason TEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE return_requests MODIFY order_number VARCHAR(255) NULL");
        DB::statement("ALTER TABLE return_requests MODIFY request_reason VARCHAR(255) NULL");
    }
};
