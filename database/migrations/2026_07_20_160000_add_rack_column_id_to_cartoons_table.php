<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            if (! Schema::hasColumn('cartoons', 'rack_column_id')) {
                $table->foreignId('rack_column_id')
                    ->nullable()
                    ->after('rack_row_id')
                    ->constrained('rack_columns')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('cartoons', function (Blueprint $table) {
            if (Schema::hasColumn('cartoons', 'rack_column_id')) {
                $table->dropConstrainedForeignId('rack_column_id');
            }
        });
    }
};
