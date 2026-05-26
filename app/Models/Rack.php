<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Rack extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;
    
    protected $fillable=[
        'name',
        'warehouse_id'
    ];

    public function warehouse():BelongsTo{
        return $this->belongsTo(WareHouse::class);
    }

    public function rows():HasMany{
        return $this->hasMany(RackRow::class);
    }
     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('Rack')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}  





