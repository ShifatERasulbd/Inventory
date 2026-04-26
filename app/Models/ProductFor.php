<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductFor extends Model
{
    use HasFactory;

    protected $table = 'products_for';

    protected $fillable = [
        'name',
        'age_limit',
    ];
}
