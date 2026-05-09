<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    //
    use HasFactory, SoftDeletes;
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
}
