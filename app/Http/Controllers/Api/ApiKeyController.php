<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\PersonalAccessToken;

class ApiKeyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ApiKey::query()
            ->with(['user:id,name,email'])
            ->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        $keys = $query->get()->map(function (ApiKey $token): array {
            return [
                'id' => $token->id,
                'sanctum_token_id' => $token->sanctum_token_id,
                'name' => $token->name,
                'abilities' => $token->abilities ?? [],
                'last_used_at' => $token->last_used_at,
                'expires_at' => $token->expires_at,
                'revoked_at' => $token->revoked_at,
                'is_active' => (bool) $token->is_active,
                'key_preview' => $token->key_preview,
                'created_at' => $token->created_at,
                'user' => [
                    'id' => $token->user?->id,
                    'name' => $token->user?->name,
                    'email' => $token->user?->email,
                ],
            ];
        });

        return response()->json($keys);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'warehouse_ids' => ['nullable', 'array'],
            'warehouse_ids.*' => ['integer', 'exists:warehouses,id'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $user = User::query()->findOrFail($validated['user_id']);
        $userWarehouseIds = is_array($user->warehouse_ids) ? array_map('intval', $user->warehouse_ids) : [];

        $requestedWarehouseIds = array_key_exists('warehouse_ids', $validated)
            ? array_values(array_unique(array_map('intval', $validated['warehouse_ids'] ?? [])))
            : $userWarehouseIds;

        if (! $user->hasRole('super-admin')) {
            $invalidWarehouseIds = array_values(array_diff($requestedWarehouseIds, $userWarehouseIds));

            if ($invalidWarehouseIds !== []) {
                return response()->json([
                    'message' => 'API key warehouse scope must match warehouses assigned to the selected user.',
                    'invalid_warehouse_ids' => $invalidWarehouseIds,
                ], 422);
            }
        }

        $abilities = ['stocks:read'];

        foreach ($requestedWarehouseIds as $warehouseId) {
            $abilities[] = 'warehouse:'.$warehouseId;
        }

        $token = $user->createToken(
            $validated['name'],
            $abilities,
            array_key_exists('expires_at', $validated) && $validated['expires_at'] !== null
                ? Carbon::parse($validated['expires_at'])
                : null,
        );

        $plainTextToken = $token->plainTextToken;
        $apiKeyLength = strlen($plainTextToken);
        $prefixLength = min(8, $apiKeyLength);
        $suffixLength = min(4, $apiKeyLength);
        $keyPreview = substr($plainTextToken, 0, $prefixLength)
            .str_repeat('*', max(0, $apiKeyLength - ($prefixLength + $suffixLength)))
            .substr($plainTextToken, -$suffixLength);

        ApiKey::query()->create([
            'sanctum_token_id' => $token->accessToken->id,
            'user_id' => $user->id,
            'created_by' => $request->user()?->id,
            'name' => $token->accessToken->name,
            'abilities' => $token->accessToken->abilities,
            'warehouse_ids' => $requestedWarehouseIds,
            'key_preview' => $keyPreview,
            'api_key_encrypted' => Crypt::encryptString($plainTextToken),
            'last_used_at' => $token->accessToken->last_used_at,
            'expires_at' => $token->accessToken->expires_at,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'API key created successfully. Save it now because it will not be shown again.',
            'api_key' => $plainTextToken,
            'token' => [
                'id' => $token->accessToken->id,
                'name' => $token->accessToken->name,
                'abilities' => $token->accessToken->abilities,
                'expires_at' => $token->accessToken->expires_at,
            ],
        ], 201);
    }

    public function show(ApiKey $token): JsonResponse
    {
        $decryptedKey = $token->getDecryptedKey();

        if ($decryptedKey === null) {
            return response()->json([
                'message' => 'This API key cannot be revealed. It was likely created before the current APP_KEY or encryption setup. Please generate a new key.',
            ], 422);
        }

        return response()->json([
            'id' => $token->id,
            'sanctum_token_id' => $token->sanctum_token_id,
            'name' => $token->name,
            'abilities' => $token->abilities ?? [],
            'last_used_at' => $token->last_used_at,
            'expires_at' => $token->expires_at,
            'revoked_at' => $token->revoked_at,
            'is_active' => (bool) $token->is_active,
            'key_preview' => $token->key_preview,
            'api_key' => $decryptedKey,
            'created_at' => $token->created_at,
            'user' => [
                'id' => $token->user?->id,
                'name' => $token->user?->name,
                'email' => $token->user?->email,
            ],
        ]);
    }

    public function destroy(ApiKey $token): JsonResponse
    {
        if ($token->sanctum_token_id) {
            PersonalAccessToken::query()->whereKey($token->sanctum_token_id)->delete();
        }

        $token->update([
            'is_active' => false,
            'revoked_at' => now(),
        ]);

        return response()->json([
            'message' => 'API key revoked successfully.',
        ]);
    }
}
