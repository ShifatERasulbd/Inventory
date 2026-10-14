<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RemoteOrder extends Model
{
    protected $fillable = [
        'remote_id',
        'order_number',
        'order_from',
        'customer_name',
        'stripe_payment_id',
        'total',
        'state_tax',
        'stripe_charge',
        'delivery_cost',
        'processing_fee',
        'status',
        'raw_payload',
        'shipping_carrier',
        'shipping_service',
        'tracking_url',
        'label_url',
        'label_file_path',
        'label_purchased_at',
        'tracking_email_sent_at',
        'total',
        'subtotal',
        'shipping_amazon',
        'shipping_actual',
        'tax',
        'amazon_fee',
        'state_tax',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'state_tax' => 'decimal:2',
        'stripe_charge' => 'decimal:2',
        'delivery_cost' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'raw_payload' => 'array',
        'label_purchased_at' => 'datetime',
        'tracking_email_sent_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'shipping_amazon' => 'decimal:2',
        'shipping_actual' => 'decimal:2',
        'tax' => 'decimal:2',
        'amazon_fee' => 'decimal:2',
    ];

    protected $appends = ['label_file_url'];

    /**
     * Absolute URL for the shipping label file downloaded from Veeqo, if one was purchased.
     */
    public function getLabelFileUrlAttribute(): ?string
    {
        return $this->label_file_path ? asset($this->label_file_path) : null;
    }
}
