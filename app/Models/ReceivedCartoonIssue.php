<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceivedCartoonIssue extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_id',
        'cartoon_id',
        'concern_warehouse_id',
        'raised_by',
        'title',
        'description',
        'status',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }

    public function cartoon(): BelongsTo
    {
        return $this->belongsTo(Cartoon::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(WareHouse::class, 'concern_warehouse_id');
    }

    public function raisedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by');
    }
}
