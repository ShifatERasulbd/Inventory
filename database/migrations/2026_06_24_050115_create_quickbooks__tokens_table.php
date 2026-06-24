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
        Schema::create('quickbooks__tokens', function (Blueprint $table) {
            $table->id();
            $table->string('realm_id')->unique(); // Unique identifier for the client's QB account
            $table->text('access_token');
            $table->text('refresh_token');
            $table->dateTime('access_token_expires_at');
            $table->dateTime('refresh_token_expires_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quickbooks__tokens');
    }
};
