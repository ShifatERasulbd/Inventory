<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fabric extends Model
{ 
    //
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'composition',
        'construction',
        'ref_number',
        'gsm',
        'supplier_id',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
