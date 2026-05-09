<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rack extends Model
{
    use HasFactory, SoftDeletes;
    
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
}  
