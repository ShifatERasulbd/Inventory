<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sell extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'purchase_id',
        'selling_from',
        'sold_to',
        'product_id',
        'quantity',
        'po_number',
        'purchase_price',
        'selling_price',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function sellingFromWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'selling_from');
    }

    public function soldToWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'sold_to');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }
}
