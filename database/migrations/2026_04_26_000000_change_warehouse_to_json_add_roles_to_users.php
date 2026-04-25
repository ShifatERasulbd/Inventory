<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'warehouse_id')) {
                $table->dropConstrainedForeignId('warehouse_id');
            }

            if (! Schema::hasColumn('users', 'warehouse_ids')) {
                $table->json('warehouse_ids')->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'warehouse_ids')) {
                $table->dropColumn('warehouse_ids');
            }

            if (! Schema::hasColumn('users', 'warehouse_id')) {
                $table->foreignId('warehouse_id')->nullable()->after('id')->constrained('warehouses')->nullOnDelete();
            }
        });
    }
};
