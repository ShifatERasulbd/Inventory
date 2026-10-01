<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('return_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('return_requests', 'return_label_file_path')) {
                $table->string('return_label_file_path')->nullable()->after('restocked_items');
            }
            if (! Schema::hasColumn('return_requests', 'return_label_saved_at')) {
                $table->timestamp('return_label_saved_at')->nullable()->after('return_label_file_path');
            }
        });
    }

    public function down(): void
    {
        Schema::table('return_requests', function (Blueprint $table) {
            $table->dropColumn(['return_label_file_path', 'return_label_saved_at']);
        });
    }
};
