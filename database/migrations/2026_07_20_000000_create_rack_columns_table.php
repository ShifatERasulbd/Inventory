<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('rack_columns')) {
            return;
        }

        Schema::create('rack_columns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rack_id')->constrained('racks')->cascadeOnDelete();
            $table->string('column_number', 50);
            $table->string('code', 100)->unique();
            $table->timestamps();

            $table->unique(['rack_id', 'column_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rack_columns');
    }
};

