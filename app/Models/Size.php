<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Size extends Model
{
       use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'size',
    ]; 
     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('size')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





