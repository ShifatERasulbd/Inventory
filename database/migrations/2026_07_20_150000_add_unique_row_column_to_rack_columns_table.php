<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('rack_columns')) {
            return;
        }

        if (! $this->indexExists('rack_columns', 'rack_columns_rack_id_row_id_column_number_unique')) {
            Schema::table('rack_columns', function (Blueprint $table) {
                $table->unique(['rack_id', 'row_id', 'column_number'], 'rack_columns_rack_id_row_id_column_number_unique');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('rack_columns')) {
            return;
        }

        if ($this->indexExists('rack_columns', 'rack_columns_rack_id_row_id_column_number_unique')) {
            Schema::table('rack_columns', function (Blueprint $table) {
                $table->dropUnique('rack_columns_rack_id_row_id_column_number_unique');
            });
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        return DB::table('information_schema.statistics')
            ->where('table_schema', DB::getDatabaseName())
            ->where('table_name', $table)
            ->where('index_name', $indexName)
            ->exists();
    }
};
