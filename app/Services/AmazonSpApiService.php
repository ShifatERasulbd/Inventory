<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin client for the Amazon Selling Partner API (SP-API). Since Feb 2021, SP-API only
 * requires a Login-with-Amazon (LWA) access token in the `x-amz-access-token` header -
 * AWS SigV4 request signing is no longer needed for regular (non-restricted) operations.
 */
class AmazonSpApiService
{
    private const ENDPOINTS = [
        'na' => 'https://sellingpartnerapi-na.amazon.com',
        'eu' => 'https://sellingpartnerapi-eu.amazon.com',
        'fe' => 'https://sellingpartnerapi-fe.amazon.com',
    ];

    private const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';

    private const ACCESS_TOKEN_CACHE_KEY = 'amazon_sp_api_access_token';

    private function config(): array
    {
        return (array) config('services.amazon_sp_api');
    }

    public function isConfigured(): bool
    {
        $config = $this->config();

        return trim((string) ($config['client_id'] ?? '')) !== ''
            && trim((string) ($config['client_secret'] ?? '')) !== ''
            && trim((string) ($config['refresh_token'] ?? '')) !== '';
    }

    /**
     * @return string[] marketplace ids configured for this store
     */
    public function marketplaceIds(): array
    {
        $raw = (string) ($this->config()['marketplace_ids'] ?? '');

        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }

    private function endpoint(): string
    {
        $region = strtolower(trim((string) ($this->config()['region'] ?? 'na')));

        return self::ENDPOINTS[$region] ?? self::ENDPOINTS['na'];
    }

    /**
     * Fetch (and cache) an LWA access token. Tokens expire after 1 hour; cached with a
     * safety buffer so we always refresh slightly before actual expiry.
     */
    private function getAccessToken(): string
    {
        return Cache::remember(self::ACCESS_TOKEN_CACHE_KEY, 3300, function () {
            $config = $this->config();

            if (! $this->isConfigured()) {
                throw new RuntimeException('Amazon SP-API is not configured (missing client id/secret/refresh token).');
            }

            try {
                $response = Http::asForm()
                    ->timeout(10)
                    ->post(self::LWA_TOKEN_URL, [
                        'grant_type' => 'refresh_token',
                        'refresh_token' => $config['refresh_token'],
                        'client_id' => $config['client_id'],
                        'client_secret' => $config['client_secret'],
                    ]);
            } catch (ConnectionException $e) {
                throw new RuntimeException('Unable to reach Amazon LWA token endpoint: '.$e->getMessage());
            }

            if ($response->failed()) {
                $message = (string) ($response->json('error_description') ?? $response->json('error') ?? $response->body());

                throw new RuntimeException('Amazon LWA token request failed: '.$message);
            }

            $accessToken = (string) $response->json('access_token');
            if ($accessToken === '') {
                throw new RuntimeException('Amazon LWA token response did not include an access_token.');
            }

            return $accessToken;
        });
    }

    /**
     * Call an SP-API operation. Throws RuntimeException with a readable message on failure.
     */
    public function request(string $method, string $path, array $query = []): array
    {
        $accessToken = $this->getAccessToken();

        try {
            $response = Http::baseUrl($this->endpoint())
                ->withHeaders([
                    'x-amz-access-token' => $accessToken,
                    'user-agent' => 'InventoryApp/1.0 (Language=PHP)',
                ])
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(20)
                ->send($method, $path, ['query' => $query]);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Unable to connect to Amazon SP-API: '.$e->getMessage());
        }

        // A stale cached token returns 401/403 - clear it once and retry with a fresh one.
        if (in_array($response->status(), [401, 403], true)) {
            Cache::forget(self::ACCESS_TOKEN_CACHE_KEY);
            $accessToken = $this->getAccessToken();

            $response = Http::baseUrl($this->endpoint())
                ->withHeaders([
                    'x-amz-access-token' => $accessToken,
                    'user-agent' => 'InventoryApp/1.0 (Language=PHP)',
                ])
                ->acceptJson()
                ->connectTimeout(10)
                ->timeout(20)
                ->send($method, $path, ['query' => $query]);
        }

        if ($response->failed()) {
            $errors = $response->json('errors');
            $message = is_array($errors) && $errors !== []
                ? (string) ($errors[0]['message'] ?? $response->body())
                : $response->body();

            throw new RuntimeException('Amazon SP-API request failed ('.$response->status().'): '.$message);
        }

        return (array) $response->json();
    }

    /**
     * GET /orders/v0/orders - list orders. $params may include CreatedAfter, LastUpdatedAfter,
     * OrderStatuses[], NextToken, MaxResultsPerPage, etc. MarketplaceIds is always injected.
     */
    public function getOrders(array $params = []): array
    {
        $query = array_merge([
            'MarketplaceIds' => implode(',', $this->marketplaceIds()),
        ], $params);

        return $this->request('GET', '/orders/v0/orders', array_filter($query, fn ($v) => $v !== null && $v !== ''));
    }

    /**
     * GET /orders/v0/orders/{orderId}/orderItems
     */
    public function getOrderItems(string $amazonOrderId, ?string $nextToken = null): array
    {
        $query = $nextToken !== null ? ['NextToken' => $nextToken] : [];

        return $this->request('GET', "/orders/v0/orders/{$amazonOrderId}/orderItems", $query);
    }
}
