<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity; 
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Return_order extends Model
{ 
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable=[
        'order_number_id',
        'reason'
    ];
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('ReturnOrder')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
    public function order(): BelongsTo
    {
        // Assuming order_number_id corresponds to the 'id' column on remote_orders
        return $this->belongsTo(RemoteOrder::class, 'order_number_id', 'id');
    }
   
}
