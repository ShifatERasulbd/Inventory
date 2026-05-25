<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recurring_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->cascadeOnUpdate()->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->cascadeOnUpdate()->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('frequency', 30)->default('manual');
            $table->date('paid_on')->nullable();
            $table->date('next_due_date')->nullable();
            $table->string('status', 30)->default('pending');
            $table->text('note')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['purchase_id', 'status']);
            $table->index(['warehouse_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recurring_payments');
    }
};
