<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductFor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products_for';

    protected $fillable = [
        'name',
        'age_limit',
    ];
}
