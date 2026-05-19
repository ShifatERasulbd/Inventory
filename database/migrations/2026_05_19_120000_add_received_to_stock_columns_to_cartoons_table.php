<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            if (! Schema::hasColumn('cartoons', 'received_to_stock_at')) {
                $table->timestamp('received_to_stock_at')->nullable()->after('warehouse_id')->index();
            }

            if (! Schema::hasColumn('cartoons', 'received_to_stock_by')) {
                $table->foreignId('received_to_stock_by')->nullable()->after('received_to_stock_at')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            if (Schema::hasColumn('cartoons', 'received_to_stock_by')) {
                $table->dropConstrainedForeignId('received_to_stock_by');
            }

            if (Schema::hasColumn('cartoons', 'received_to_stock_at')) {
                $table->dropColumn('received_to_stock_at');
            }
        });
    }
};
