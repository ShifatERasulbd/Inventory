<?php

namespace App\Models;

use App\Models\WareHouse;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'purchase_form',
        'purchase_to',
        'products',
        'po_number',
        'status',
        'shipping_date',
        'received_date',
        'note',
    ];

    protected $casts = [
        'products' => 'array',
        'shipping_date' => 'date',
        'received_date' => 'date',
    ];

    public function purchaseFromWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'purchase_form');
    }

    public function purchaseToWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'purchase_to');
    }
}
