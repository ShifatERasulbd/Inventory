<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Rack extends Model
{
    use HasFactory;
    
    protected $fillable=[
        'name',
        'warehouse_id'
    ];

    public function warehouse():BelongsTo{
        return $this->belongsTo(WareHouse::class);
    }
}  
