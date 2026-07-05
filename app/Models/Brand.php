<?php

namespace App\Models;
use App\Models\WareHouse;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Brand extends Model
{
      use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
       
    ];

    public function warehouses(): BelongsToMany
    {
      return $this->belongsToMany(WareHouse::class, 'warehouse_brand', 'brand_id', 'warehouse_id');
    }

    public function products(): BelongsToMany
    {
      return $this->belongsToMany(Product::class, 'product_brand', 'brand_id', 'product_id');
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('Brand')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





