<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('rack_rows', 'column')) {
            return;
        }

        Schema::table('rack_rows', function (Blueprint $table) {
            $table->string('column', 50)->nullable()->after('row_number');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('rack_rows', 'column')) {
            return;
        }

        Schema::table('rack_rows', function (Blueprint $table) {
            $table->dropColumn('column');
        });
    }
};
