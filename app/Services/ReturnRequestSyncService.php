<?php

namespace App\Services;

use App\Models\ReturnRequest;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class ReturnRequestSyncService
{
    private function config(): array
    {
        return (array) config('services.store_1971co');
    }

    private function storeRequest(string $method, string $path, array $query = [])
    {
        $config = $this->config();
        $baseUrl = trim((string) ($config['url'] ?? ''));
        $apiKey = trim((string) ($config['api_key'] ?? ''));
        $token = trim((string) ($config['token'] ?? ''));

        if ($baseUrl === '') {
            throw new \RuntimeException('1971co store API URL is not configured.');
        }

        if ($apiKey === '' && $token === '') {
            throw new \RuntimeException('Either the 1971co store API key or API token must be configured.');
        }

        // Keep scheme separator (http://) intact while collapsing accidental duplicate slashes.
        $baseUrl = (string) preg_replace('#(?<!:)/{2,}#', '/', $baseUrl);
        $baseUrl = rtrim($baseUrl, '/');
        $normalizedPath = '/'.ltrim($path, '/');
        $url = $baseUrl.$normalizedPath;

        try {
            return Http::acceptJson()
                ->connectTimeout(5)
                ->timeout(8)
                ->retry(1, 200)
                ->when($apiKey !== '', fn ($request) => $request->withHeaders(['X-API-Key' => $apiKey]))
                ->when($apiKey === '' && $token !== '', fn ($request) => $request->withToken($token))
                ->get($url, $query);
        } catch (ConnectionException $e) {
            throw new \RuntimeException("Unable to connect to 1971co store API at {$baseUrl}. Check the URL and server accessibility.");
        }
    }

    private function throwStoreFailure($response): never
    {
        $payload = $response->json();
        $message = (string) ($payload['message'] ?? 'Store request failed.');

        throw new \RuntimeException(
            '1971co store request failed with status '.$response->status().': '.$message
        );
    }

    /**
     * Push the Inventory-side return workflow status back onto the 1971co return request record.
     */
    public function pushStatusUpdate(int $remoteId, string $status): void
    {
        $config = $this->config();
        $baseUrl = trim((string) ($config['url'] ?? ''));
        $apiKey = trim((string) ($config['api_key'] ?? ''));
        $token = trim((string) ($config['token'] ?? ''));

        if ($baseUrl === '') {
            throw new \RuntimeException('1971co store API URL is not configured.');
        }

        if ($apiKey === '' && $token === '') {
            throw new \RuntimeException('Either the 1971co store API key or API token must be configured.');
        }

        $baseUrl = (string) preg_replace('#(?<!:)/{2,}#', '/', $baseUrl);
        $baseUrl = rtrim($baseUrl, '/');
        $url = $baseUrl.'/return-requests-feed/'.$remoteId.'/status';

        try {
            $response = Http::acceptJson()
                ->connectTimeout(5)
                ->timeout(8)
                ->retry(1, 200)
                ->when($apiKey !== '', fn ($request) => $request->withHeaders(['X-API-Key' => $apiKey]))
                ->when($apiKey === '' && $token !== '', fn ($request) => $request->withToken($token))
                ->put($url, ['status' => $status]);
        } catch (ConnectionException $e) {
            throw new \RuntimeException("Unable to connect to 1971co store API at {$baseUrl}. Check the URL and server accessibility.");
        }

        if ($response->failed()) {
            $this->throwStoreFailure($response);
        }
    }

    /**
     * Translate an Inventory return workflow status into the order status it should mirror
     * onto both the 1971co CheckoutOrder and the local RemoteOrder mirror, so the order's own
     * status reflects where its return currently stands. Null means "no order status change".
     */
    public function mapStatusForOrder(string $returnStatus): ?string
    {
        return match ($returnStatus) {
            'approved_return' => 'Return Approved',
            'product_received' => 'Return Received',
            'rejected' => 'Return Rejected',
            'refund_initiated' => 'refunded',
            default => null,
        };
    }

    /**
     * Pull recent return requests from the 1971co public return-requests-feed endpoint
     * and upsert them locally, keyed by their remote id.
     */
    public function syncRecent(?int $sinceId = null, int $limit = 100): array
    {
        $startFromId = $sinceId ?? (int) (ReturnRequest::query()->max('remote_id') ?? 0);
        $perPage = max(1, min(200, $limit));
        $cursorSinceId = max(0, $startFromId);

        $synced = 0;
        $maxRemoteId = $cursorSinceId;
        $batchRequests = 0;
        $maxBatchRequests = 1000;

        while ($batchRequests < $maxBatchRequests) {
            $response = $this->storeRequest('GET', '/return-requests-feed', [
                'since_id' => $cursorSinceId,
                'per_page' => $perPage,
            ]);

            if ($response->failed()) {
                $this->throwStoreFailure($response);
            }

            $payload = $response->json();
            $returnRequests = Arr::get($payload, 'return_requests', []);

            if (! is_array($returnRequests) || $returnRequests === []) {
                break;
            }

            $batchRequests++;

            foreach ($returnRequests as $returnRequest) {
                if (! is_array($returnRequest)) {
                    continue;
                }

                $remoteId = (int) ($returnRequest['id'] ?? 0);
                if ($remoteId <= 0) {
                    continue;
                }

                $this->saveReturnRequestPayload($returnRequest, $remoteId);

                $synced++;
                $maxRemoteId = max($maxRemoteId, $remoteId);
            }

            if (count($returnRequests) < $perPage) {
                break;
            }

            $cursorSinceId = $maxRemoteId;
        }

        return [
            'success' => true,
            'requested_since_id' => $sinceId,
            'latest_remote_id' => $maxRemoteId,
            'synced_count' => $synced,
            'batch_requests' => $batchRequests,
        ];
    }

    private function saveReturnRequestPayload(array $returnRequest, int $remoteId): ReturnRequest
    {
        $existing = ReturnRequest::query()->where('remote_id', $remoteId)->first();

        $payload = [
            'remote_id' => $remoteId,
            'order_number' => $this->extractOrderNumber($returnRequest),
            'request_reason' => (string) ($returnRequest['request_reason'] ?? ''),
            'additional_text' => $returnRequest['additional_text'] ?? null,
            'uploaded_document' => $returnRequest['uploaded_document'] ?? null,
            'wants_size_replacement' => $returnRequest['wants_size_replacement'] ?? null,
            'item_size_replacements' => $returnRequest['item_size_replacements'] ?? null,
            'raw_payload' => $returnRequest,
        ];

        if ($existing) {
            // Preserve the locally-managed workflow status; it isn't tracked by the 1971co store.
            $existingPayload = is_array($existing->raw_payload) ? $existing->raw_payload : [];
            if (isset($existingPayload['veeqo_return_label'])) {
                $payload['raw_payload']['veeqo_return_label'] = $existingPayload['veeqo_return_label'];
            }

            $existing->fill($payload);
            if ($existing->isDirty()) {
                $existing->save();
            }

            return $existing;
        }

        $payload['status'] = 'pending';

        return ReturnRequest::query()->create($payload);
    }

    /**
     * Some legacy 1971co records stored the full order JSON in the order_number field instead
     * of the plain order number; unwrap it here so we always save a clean, short value.
     */
    private function extractOrderNumber(array $returnRequest): string
    {
        $value = (string) ($returnRequest['order_number'] ?? '');

        if ($value !== '' && ($value[0] === '{' || $value[0] === '[')) {
            $decoded = json_decode($value, true);

            if (is_array($decoded) && ! empty($decoded['order_number'])) {
                return (string) $decoded['order_number'];
            }
        }

        return $value;
    }
}
