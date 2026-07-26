<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('rack_rows', function (Blueprint $table) {
            if (!Schema::hasColumn('rack_rows', 'column')) {
                $table->string('column', 50)->after('row_number')->nullable();
            }

            // If you want strict "not null", run a follow-up migration to populate existing rows.
        });
    }

    public function down(): void
    {
        Schema::table('rack_rows', function (Blueprint $table) {
            if (Schema::hasColumn('rack_rows', 'column')) {
                $table->dropColumn('column');
            }
        });
    }
};

