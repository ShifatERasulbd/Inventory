<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // If we previously had a conflicting migration, this ensures column exists with correct type.
        if (Schema::hasColumn('rack_rows', 'column')) {
            // Do nothing.
            return;
        }

        Schema::table('rack_rows', function (Blueprint $table) {
            $table->string('column', 50)->after('row_number')->nullable();
        });
    }

    public function down(): void
    {
        // Keep behavior consistent: drop only if present.
        if (Schema::hasColumn('rack_rows', 'column')) {
            Schema::table('rack_rows', function (Blueprint $table) {
                $table->dropColumn('column');
            });
        }
    }
};

