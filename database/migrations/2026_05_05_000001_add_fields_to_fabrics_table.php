<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fabrics', function (Blueprint $table) {
            $table->string('type', 100)->nullable()->after('name');
            $table->string('composition', 200)->nullable()->after('type');
            $table->string('construction', 200)->nullable()->after('composition');
            $table->string('ref_number', 100)->unique()->nullable()->after('construction');
            $table->decimal('gsm', 8, 2)->nullable()->after('ref_number');
        });
    }

    public function down(): void
    {
        Schema::table('fabrics', function (Blueprint $table) {
            $table->dropUnique(['ref_number']);
            $table->dropColumn(['type', 'composition', 'construction', 'ref_number', 'gsm']);
        });
    }
};
