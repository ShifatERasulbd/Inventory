<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?: $request->bearerToken();

        if (! $apiKey) {
            return $this->unauthorizedResponse('API key is missing.');
        }

        $token = PersonalAccessToken::findToken($apiKey);

        if (! $token) {
            return $this->unauthorizedResponse('Invalid API key.');
        }

        if ($token->expires_at && $token->expires_at->isPast()) {
            return $this->unauthorizedResponse('API key has expired.');
        }

        $tokenable = $token->tokenable;

        if (! $tokenable instanceof User || (method_exists($tokenable, 'trashed') && $tokenable->trashed())) {
            return $this->unauthorizedResponse('The API key owner is not active.');
        }

        $lastUsedAt = now();

        $token->forceFill([
            'last_used_at' => $lastUsedAt,
        ])->save();

        ApiKey::query()
            ->where('sanctum_token_id', $token->id)
            ->update(['last_used_at' => $lastUsedAt]);

        $authenticatedUser = $tokenable->withAccessToken($token);

        Auth::setUser($authenticatedUser);
        $request->setUserResolver(static fn (): User => $authenticatedUser);

        return $next($request);
    }

    private function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 401);
    }
}
