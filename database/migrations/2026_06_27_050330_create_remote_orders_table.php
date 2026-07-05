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
        Schema::create('remote_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('remote_id')->unique(); // ID on the main store
            $table->string('order_number')->nullable();
            $table->string('customer_name')->nullable();
            $table->decimal('total', 10, 2)->default(0.00);
            $table->string('status')->nullable();
            $table->json('raw_payload'); // Stores the entire JSON structure for safety
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('remote_orders');
    }
};
