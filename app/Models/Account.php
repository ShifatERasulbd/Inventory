<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_id',
        'brand_id',
        'source_type',
        'source_id',
        'entry_type',
        'reference',
        'total_amount',
        'paid_amount',
        'due_amount',
        'payment_status',
        'transaction_date',
        'note',
        'meta',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'transaction_date' => 'date',
        'meta' => 'array',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'warehouse_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }
}
