<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('rack_rows') || ! Schema::hasColumn('rack_rows', 'column')) {
            return;
        }

        if (! $this->indexExists('rack_rows', 'rack_rows_rack_id_index')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->index('rack_id', 'rack_rows_rack_id_index');
            });
        }

        if ($this->indexExists('rack_rows', 'rack_rows_rack_id_row_number_unique')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->dropUnique('rack_rows_rack_id_row_number_unique');
            });
        }

        if (! $this->indexExists('rack_rows', 'rack_rows_rack_id_row_number_column_unique')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->unique(['rack_id', 'row_number', 'column'], 'rack_rows_rack_id_row_number_column_unique');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('rack_rows')) {
            return;
        }

        if ($this->indexExists('rack_rows', 'rack_rows_rack_id_row_number_column_unique')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->dropUnique('rack_rows_rack_id_row_number_column_unique');
            });
        }

        if (! $this->indexExists('rack_rows', 'rack_rows_rack_id_row_number_unique')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->unique(['rack_id', 'row_number'], 'rack_rows_rack_id_row_number_unique');
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
