<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RetailSale extends Model
{
    protected $fillable = [
        'reference_number',
        'warehouse_id',
        'sold_by',
        'items',
        'total_amount',
        'payment_method',
        'note',
    ];

    protected $casts = [
        'items'        => 'array',
        'total_amount' => 'decimal:2',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_by');
    }
}
