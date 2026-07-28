<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remove unique constraint on 'code' column in rack_rows table
        if ($this->indexExists('rack_rows', 'rack_rows_code_unique')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->dropUnique('rack_rows_code_unique');
            });
        }

        // Remove unique constraint on 'code' column in rack_columns table
        if ($this->indexExists('rack_columns', 'rack_columns_code_unique')) {
            Schema::table('rack_columns', function (Blueprint $table) {
                $table->dropUnique('rack_columns_code_unique');
            });
        }
    }

    public function down(): void
    {
        if (! $this->indexExists('rack_rows', 'rack_rows_code_unique')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->unique('code', 'rack_rows_code_unique');
            });
        }

        if (! $this->indexExists('rack_columns', 'rack_columns_code_unique')) {
            Schema::table('rack_columns', function (Blueprint $table) {
                $table->unique('code', 'rack_columns_code_unique');
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

