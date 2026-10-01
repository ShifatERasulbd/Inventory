<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('remote_orders', 'label_file_path')) {
                $table->string('label_file_path', 1000)->nullable()->after('label_url');
            }
        });
    }

    public function down(): void
    {
        Schema::table('remote_orders', function (Blueprint $table) {
            if (Schema::hasColumn('remote_orders', 'label_file_path')) {
                $table->dropColumn('label_file_path');
            }
        });
    }
};
