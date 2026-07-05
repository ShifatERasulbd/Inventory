<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class shipingTime extends Model
{
   use HasFactory;

   protected $fillable = [
        'shipping_time',
        'production_time',
    ];
}
 