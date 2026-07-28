<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RackRow extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'rack_rows';

    protected $fillable = [
        'rack_id',
        'row_number',
        'code',
    ];

    public function rack(): BelongsTo
    {
        return $this->belongsTo(Rack::class);
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('RackRow')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





