<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Sell extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'purchase_id',
        'selling_from',
        'sold_to',
        'brand_id',
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

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('sell')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





