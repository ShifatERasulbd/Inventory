<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->string('packing_list_path', 2048)->nullable()->after('note');
            $table->dateTime('packing_list_generated_at')->nullable()->after('packing_list_path');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['packing_list_path', 'packing_list_generated_at']);
        });
    }
};

