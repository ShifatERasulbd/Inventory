<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('received_cartoon_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('cartoon_id')->nullable()->constrained('cartoons')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('concern_warehouse_id')->constrained('warehouses')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('raised_by')->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->string('status', 30)->default('open');
            $table->timestamps();

            $table->index(['concern_warehouse_id', 'status']);
            $table->index(['purchase_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('received_cartoon_issues');
    }
};
