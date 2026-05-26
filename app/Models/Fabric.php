<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Fabric extends Model
{ 
    //
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'type',
        'composition',
        'construction',
        'ref_number',
        'gsm',
        'supplier_id',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('fabric')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





