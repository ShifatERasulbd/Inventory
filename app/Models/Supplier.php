<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Supplier extends Model
{
    //
    use HasFactory, SoftDeletes, LogsActivity;
    protected $fillable=[
        'name',
        'company_name',
        'phone',
        'email',
        'address',
        'trade_license',
        'contact_person',
        'status',
    ];

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('supplier')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





