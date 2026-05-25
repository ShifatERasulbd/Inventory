<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'account_id',
        'warehouse_id',
        'amount',
        'frequency',
        'paid_on',
        'next_due_date',
        'status',
        'note',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_on' => 'date',
        'next_due_date' => 'date',
        'meta' => 'array',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'warehouse_id');
    }
}
