<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemoteOrder extends Model
{
    protected $fillable = [
        'remote_id',
        'order_number',
        'customer_name',
        'total',
        'status',
        'courier_company',
        'courier_api_connected',
        'courier_api_checked_at',
        'courier_api_message',
        'raw_payload',
    ];

    protected $casts = [
        'courier_api_connected' => 'boolean',
        'courier_api_checked_at' => 'datetime',
        'raw_payload' => 'array',
    ];
}
