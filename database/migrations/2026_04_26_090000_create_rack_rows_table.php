<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rack_rows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rack_id')->constrained('racks')->cascadeOnDelete();
            $table->string('row_number', 50);
            $table->string('code', 100)->unique();
            $table->timestamps();

            $table->unique(['rack_id', 'row_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rack_rows');
    }
};
