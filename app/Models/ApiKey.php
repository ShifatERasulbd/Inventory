<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'sanctum_token_id',
        'user_id',
        'created_by',
        'name',
        'abilities',
        'warehouse_ids',
        'key_preview',
        'api_key_encrypted',
        'last_used_at',
        'expires_at',
        'revoked_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'abilities' => 'array',
            'warehouse_ids' => 'array',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getDecryptedKey(): ?string
    {
        if (!$this->api_key_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->api_key_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }
}
