<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('remote_id')->unique(); // ID on the 1971co store
            $table->string('order_number')->nullable();
            $table->string('request_reason')->nullable();
            $table->text('additional_text')->nullable();
            $table->string('uploaded_document')->nullable();
            $table->string('wants_size_replacement', 3)->nullable();
            $table->json('item_size_replacements')->nullable();
            $table->string('status')->default('pending'); // local workflow status: pending/approved/rejected/completed
            $table->json('raw_payload'); // Stores the full feed payload for safety
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_requests');
    }
};
