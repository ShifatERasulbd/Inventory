<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cartoon extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'cartoon_number',
        'p_o_number',
        'quantity',
        'product_code',
        'rack_id',
        'rack_row_id',
        'warehouse_id',
    ];

    protected $casts = [
        'product_code' => 'array',
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
}
  