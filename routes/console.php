<?php

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('api-key:generate {email} {name=Timeless Canada Key} {--warehouse=4}', function (string $email, string $name): int {
    $user = User::query()->where('email', $email)->first();

    if (! $user) {
        $this->error('USER_NOT_FOUND');
        return self::FAILURE;
    }

    $warehouseId = (int) $this->option('warehouse');

    if ($warehouseId <= 0) {
        $this->error('INVALID_WAREHOUSE_ID');
        return self::FAILURE;
    }

    $abilities = ['stocks:read', 'warehouse:'.$warehouseId];
    $token = $user->createToken($name, $abilities);

    $plainTextToken = $token->plainTextToken;
    $apiKeyLength = strlen($plainTextToken);
    $prefixLength = min(8, $apiKeyLength);
    $suffixLength = min(4, $apiKeyLength);
    $keyPreview = substr($plainTextToken, 0, $prefixLength)
        .str_repeat('*', max(0, $apiKeyLength - ($prefixLength + $suffixLength)))
        .substr($plainTextToken, -$suffixLength);

    $apiKey = ApiKey::query()->create([
        'sanctum_token_id' => $token->accessToken->id,
        'user_id' => $user->id,
        'created_by' => null,
        'name' => $token->accessToken->name,
        'abilities' => $token->accessToken->abilities,
        'warehouse_ids' => [$warehouseId],
        'key_preview' => $keyPreview,
        'api_key_encrypted' => Crypt::encryptString($plainTextToken),
        'last_used_at' => $token->accessToken->last_used_at,
        'expires_at' => $token->accessToken->expires_at,
        'is_active' => true,
    ]);

    $this->line($plainTextToken);
    $this->info('api_keys.id='.$apiKey->id);

    return self::SUCCESS;
})->purpose('Generate API key for a user with warehouse stock scope');

Artisan::command('remote-orders:sync {--since=} {--limit=100}', function (): int {
    $since = $this->option('since');
    $limit = (int) $this->option('limit');

    $result = app(\App\Services\RemoteOrderSyncService::class)->syncRecent(
        $since !== null ? (int) $since : null,
        $limit
    );

    $this->info('Remote orders synced: '.$result['synced_count']);
    $this->line('Latest remote id: '.$result['latest_remote_id']);

    return self::SUCCESS;
})->purpose('Sync remote 1971co orders into local remote_orders table');

Schedule::command('remote-orders:sync --limit=100')
    ->everyMinute()
    ->withoutOverlapping();
