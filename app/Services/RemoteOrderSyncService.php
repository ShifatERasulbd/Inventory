<?php

namespace App\Services;

use App\Models\RemoteOrder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class RemoteOrderSyncService
{
    public function saveOrderPayload(array $order): ?RemoteOrder
    {
        $remoteId = (int) ($order['id'] ?? 0);
        if ($remoteId <= 0) {
            return null;
        }

        $courierCompany = $this->normalizeCourierCompany(
            (string) ($order['courier_company'] ?? $order['courier_service'] ?? '')
        );

        return RemoteOrder::query()->updateOrCreate(
            ['remote_id' => $remoteId],
            [
                'order_number' => (string) ($order['order_number'] ?? ''),
                'customer_name' => trim(
                    Str::of((string) ($order['first_name'] ?? ''))
                        ->append(' ')
                        ->append((string) ($order['last_name'] ?? ''))
                        ->value()
                ),
                'total' => (float) ($order['total'] ?? 0),
                'status' => (string) ($order['status'] ?? 'pending'),
                'courier_company' => $courierCompany,
                'raw_payload' => $order,
            ]
        );
    }

    private function normalizeCourierCompany(?string $value): ?string
    {
        $normalized = strtolower(trim((string) $value));

        return match ($normalized) {
            'ups' => 'UPS',
            'shipstation' => 'ShipStation',
            '' => null,
            default => ucfirst($normalized),
        };
    }

    private function mainStoreRequest(string $method, string $path, array $query = [])
    {
        $config = config('services.main_store');
        $baseUrl = rtrim((string) ($config['url'] ?? ''), '/');
        $apiKey = trim((string) ($config['api_key'] ?? ''));
        $token = trim((string) ($config['token'] ?? ''));

        if ($baseUrl === '') {
            throw new \RuntimeException('MAIN_STORE_API_URL is not configured.');
        }

        if ($apiKey === '' && $token === '') {
            throw new \RuntimeException('Either MAIN_STORE_API_KEY or MAIN_STORE_API_TOKEN must be configured.');
        }

        try {
            return Http::acceptJson()
                ->timeout(20)
                ->retry(2, 300)
                ->when($apiKey !== '', fn ($request) => $request->withHeaders(['X-API-Key' => $apiKey]))
                ->when($apiKey === '' && $token !== '', fn ($request) => $request->withToken($token))
                ->send($method, $baseUrl.$path, ['query' => $query]);
        } catch (ConnectionException $e) {
            throw new \RuntimeException('Unable to connect to main store API. Check MAIN_STORE_API_URL and server accessibility.');
        }
    }

    private function throwMainStoreFailure($response): never
    {
        $payload = $response->json();
        $message = (string) ($payload['message'] ?? 'Main store request failed.');

        throw new \RuntimeException(
            'Main store request failed with status '.$response->status().': '.$message
        );
    }

    public function syncRecent(?int $sinceId = null, int $limit = 100): array
    {
        $startFromId = $sinceId;
        if ($startFromId === null) {
            $startFromId = (int) (RemoteOrder::query()->max('remote_id') ?? 0);
        }

        $response = $this->mainStoreRequest('GET', '/orders-feed', [
            'since_id' => max(0, (int) $startFromId),
            'per_page' => max(1, min(200, (int) $limit)),
        ]);

        if ($response->failed()) {
            $this->throwMainStoreFailure($response);
        }

        $payload = $response->json();
        $orders = Arr::get($payload, 'orders', []);

        if (! is_array($orders)) {
            $orders = [];
        }

        $synced = 0;
        $maxRemoteId = (int) $startFromId;

        foreach ($orders as $order) {
            if (! is_array($order)) {
                continue;
            }

            $remoteId = (int) ($order['id'] ?? 0);
            if ($remoteId <= 0) {
                continue;
            }

            $this->saveOrderPayload($order);

            $synced++;
            if ($remoteId > $maxRemoteId) {
                $maxRemoteId = $remoteId;
            }
        }

        return [
            'success' => true,
            'requested_since_id' => (int) $startFromId,
            'latest_remote_id' => (int) $maxRemoteId,
            'synced_count' => $synced,
        ];
    }

    public function syncSingle(int $remoteOrderId): ?RemoteOrder
    {
        if ($remoteOrderId <= 0) {
            throw new \InvalidArgumentException('Remote order id must be a positive integer.');
        }

        $response = $this->mainStoreRequest('GET', '/orders-feed/'.$remoteOrderId);

        if ($response->status() === 404) {
            $response = $this->mainStoreRequest('GET', '/orders/'.$remoteOrderId);
        }

        if ($response->status() === 404) {
            return null;
        }

        if ($response->failed()) {
            $this->throwMainStoreFailure($response);
        }

        $order = Arr::get($response->json(), 'order');
        if (! is_array($order) || (int) ($order['id'] ?? 0) <= 0) {
            return null;
        }

        return $this->saveOrderPayload($order);
    }
}