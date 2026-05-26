<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Color extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'color_code',
    ];
     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('color')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





