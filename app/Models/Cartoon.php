<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cartoon extends Model
{
    use HasFactory;
    protected $fillable = [
        'cartoon_number',
        'p_o_number',
    ];

    public function purchase(){
        return $this->belongsTo(Purchase::class,'p_o_number','id');
    }
}
  