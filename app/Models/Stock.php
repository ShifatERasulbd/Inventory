<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'stocks',
        'warehouse_id',
        'cartoon_id',
        'barcode',
    ];

    protected $casts = [
        'stocks' => 'integer',
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
