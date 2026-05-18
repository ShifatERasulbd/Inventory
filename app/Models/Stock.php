<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'stocks',
        'buying_price',
        'selling_price',
        'warehouse_id',
        'cartoon_id',
        'barcode',
    ];

    protected $casts = [
        'stocks' => 'integer',
        'barcode' => 'array',
        'buying_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class);
    }

    public function cartoon(): BelongsTo
    {
        return $this->belongsTo(Cartoon::class);
    }
}
