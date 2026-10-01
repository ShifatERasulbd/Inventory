<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RetailSale extends Model
{
    use LogsActivity;

    protected $fillable = [
        'reference_number',
        'warehouse_id',
        'brand_id',
        'sold_by',
        'items',
        'total_amount',
        'payment_method',
        'is_amazon_order',
        'note',
        'status',
        'remote_order_id',
        'quickbooks_sync_status',
        'quickbooks_synced_at',
        'quickbooks_txn_id',
        'quickbooks_last_error',
    ];

    protected $casts = [
        'items'        => 'array',
        'total_amount' => 'decimal:2',
        'is_amazon_order' => 'boolean',
        'quickbooks_synced_at' => 'datetime',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sold_by');
    }

    public function remoteOrder(): BelongsTo
    {
        return $this->belongsTo(RemoteOrder::class, 'remote_order_id');
    }
     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('retailSale')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





