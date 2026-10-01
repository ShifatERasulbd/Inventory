<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ReturnRequest extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'remote_id',
        'order_number',
        'request_reason',
        'additional_text',
        'uploaded_document',
        'wants_size_replacement',
        'item_size_replacements',
        'status',
        'raw_payload',
        'restocked_items',
        'return_label_file_path',
        'return_label_saved_at',
    ];

    protected $casts = [
        'item_size_replacements' => 'array',
        'raw_payload' => 'array',
        'restocked_items' => 'array',
        'return_label_saved_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('ReturnRequest')
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
