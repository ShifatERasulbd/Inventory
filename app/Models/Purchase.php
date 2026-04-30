<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_form',
        'purchase_to',
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

    public function purchaseFromWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'purchase_form');
    }

    public function purchaseToWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'purchase_to');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
