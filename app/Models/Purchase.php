<?php

namespace App\Models;

use App\Models\WareHouse;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_form',
        'purchase_to',
        'products',
        'po_number',
        'status',
    ];

    protected $casts = [
        'products' => 'array',
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
