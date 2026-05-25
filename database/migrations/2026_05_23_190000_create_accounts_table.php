<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->cascadeOnUpdate()->nullOnDelete();
            $table->string('source_type', 50);
            $table->unsignedBigInteger('source_id');
            $table->string('entry_type', 50);
            $table->string('reference', 120)->nullable();
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->decimal('paid_amount', 14, 2)->default(0);
            $table->decimal('due_amount', 14, 2)->default(0);
            $table->string('payment_status', 30)->default('unpaid');
            $table->date('transaction_date')->nullable();
            $table->text('note')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['warehouse_id', 'entry_type']);
            $table->index(['source_type', 'source_id']);
            $table->unique(['source_type', 'source_id', 'entry_type'], 'accounts_source_entry_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
