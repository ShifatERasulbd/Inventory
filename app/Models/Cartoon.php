<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Cartoon extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    protected $fillable = [
        'cartoon_number',
        'p_o_number',
        'quantity',
        'product_code',
        'rack_id',
        'rack_row_id',
        'warehouse_id',
        'received_to_stock_at',
        'received_to_stock_by',
    ];

    protected $casts = [
        'product_code' => 'array',
        'received_to_stock_at' => 'datetime',
    ];

    public function purchase(){
        return $this->belongsTo(Purchase::class,'p_o_number','id');
    }

    public function rack(){
        return $this->belongsTo(Rack::class);
    }

    public function rackRow(){
        return $this->belongsTo(RackRow::class);
    }

    public function warehouse(){
        return $this->belongsTo(WareHouse::class);
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('carton')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
  





