<?php

namespace App\Models;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Purchase extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'purchase_form',
        'purchase_to',
        'brand_id',
        'products',
        'subtotal',
        'total_amount',
        'paid_amount',
        'due_amount',
        'payment_status',
        'payment_method',
        'po_number',
        'status',
        'shipping_date',
        'received_date',
        'note',
    ];

    protected $casts = [
        'products' => 'array',
        'subtotal' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'shipping_date' => 'date',
        'received_date' => 'date',
        'purchase_form' => 'integer',
        'purchase_to' => 'integer',
        'brand_id' => 'integer',
    ];

    public function purchaseFromWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'purchase_form');
    }

    public function purchaseToWarehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'purchase_to');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('purchase')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





