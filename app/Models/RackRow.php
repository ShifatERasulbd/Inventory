<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RackRow extends Model
{
    use HasFactory;

    protected $table = 'rack_rows';

    protected $fillable = [
        'rack_id',
        'row_number',
        'code',
    ];

    public function rack(): BelongsTo
    {
        return $this->belongsTo(Rack::class);
    }
}
