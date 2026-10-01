<?php

namespace App\Http\Controllers;

use App\Http\Traits\ResolvesWarehouseIds;
use App\Models\Cartoon;
use App\Models\Product;
use App\Models\ReturnRequest;
use App\Models\Stock;
use App\Services\ReturnRequestSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Mail\ReturnApprovedMail;
use App\Mail\ReturnProductReceivedMail;
use Illuminate\Support\Facades\Mail;
use App\Mail\ReturnRefundInitiatedMail;
use App\Models\RemoteOrder;
use App\Services\RemoteOrderRefundService;
use App\Services\VeeqoService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class ReturnRequestController extends Controller
{
    use ResolvesWarehouseIds;

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
            'per_page' => 'nullable|integer|min:1|max:200',
        ]);

        $query = ReturnRequest::query()->orderByDesc('remote_id');

        if (! empty($validated['status'])) {
            $query->where('status', (string) $validated['status']);
        }

        if (! empty($validated['search'])) {
            $search = trim((string) $validated['search']);
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('order_number', 'like', "%{$search}%")
                    ->orWhere('request_reason', 'like', "%{$search}%")
                    ->orWhere('raw_payload', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->paginate((int) ($validated['per_page'] ?? 20))
        );
    }

    public function show(int $id): JsonResponse
    {
        $returnRequest = ReturnRequest::query()->findOrFail($id);

        return response()->json($returnRequest);
    }

    /**
     * Lets admins view/download the return label directly (rather than only having it
     * land in the customer's approval email) once it's available on the Veeqo shipment.
     */
    public function shippingLabel(int $id, VeeqoService $veeqo): mixed
    {
        $returnRequest = ReturnRequest::query()->findOrFail($id);
        $labelPdfContent = $this->resolveReturnShippingLabel($returnRequest, $veeqo);

        if ($labelPdfContent === null) {
            return response()->json([
                'message' => 'No return shipping label is available for this order yet.',
            ], 404);
        }

        return response($labelPdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="return-shipping-label-' . $returnRequest->order_number . '.pdf"',
        ]);
    }

   public function update(Request $request, int $id, RemoteOrderRefundService $refundService, VeeqoService $veeqo, ReturnRequestSyncService $syncService): JsonResponse
{
    $validated = $request->validate([
        'status' => 'required|string|in:pending,approved_return,product_received,rejected,refund_initiated',
        'refund_amount' => 'nullable|numeric|min:0',
        'refund_method' => 'nullable|string|max:100',
    ]);

    $returnRequest = ReturnRequest::query()->findOrFail($id);
    $previousStatus = $returnRequest->status;
    $newStatus = $validated['status'];
    $isNewRefundInitiated = $newStatus === 'refund_initiated' && $previousStatus !== 'refund_initiated';

    // Trigger the Stripe refund BEFORE persisting the status, so a failed refund
    // doesn't get saved as "refund_initiated".
    $remoteOrder = null;
    if ($isNewRefundInitiated) {
        $remoteOrder = RemoteOrder::query()
            ->where('order_number', $returnRequest->order_number)
            ->first();

        if (! $remoteOrder) {
            return response()->json([
                'success' => false,
                'message' => "No matching remote order found for order #{$returnRequest->order_number} to refund.",
            ], 404);
        }

        try {
            $refundService->refund($remoteOrder);
        } catch (Throwable $e) {
            Log::error("Stripe refund failed for return request #{$returnRequest->id} / order #{$returnRequest->order_number}: {$e->getMessage()}");

            return response()->json([
                'success' => false,
                'message' => 'Stripe refund failed: ' . $e->getMessage(),
            ], 502);
        }
    }

    $returnRequest->update($validated);

    // Reflect the workflow status change on the originating 1971co return request record.
    if ($newStatus !== $previousStatus && $returnRequest->remote_id > 0) {
        try {
            $syncService->pushStatusUpdate((int) $returnRequest->remote_id, $newStatus);
        } catch (Throwable $e) {
            Log::warning("Failed to push return request status update to 1971co for return request #{$returnRequest->id}: {$e->getMessage()}");
        }
    }

    // Reflect the return workflow on the order's own status, both locally (RemoteOrder) and
    // on the originating 1971co CheckoutOrder (handled by the store via pushStatusUpdate above).
    $orderStatus = $syncService->mapStatusForOrder($newStatus);
    if ($newStatus !== $previousStatus && $orderStatus !== null) {
        $remoteOrderToUpdate = $remoteOrder ?: RemoteOrder::query()
            ->where('order_number', $returnRequest->order_number)
            ->first();

        if ($remoteOrderToUpdate) {
            $remoteOrderPayload = is_array($remoteOrderToUpdate->raw_payload) ? $remoteOrderToUpdate->raw_payload : [];
            $remoteOrderPayload['status'] = $orderStatus;

            $remoteOrderToUpdate->update([
                'status' => $orderStatus,
                'raw_payload' => $remoteOrderPayload,
            ]);
        }
    }

    $emailNotification = null;

    if ($newStatus === 'approved_return' && $previousStatus !== 'approved_return') {
        $emailNotification = $this->sendReturnApprovedEmail(
            $returnRequest,
            $validated['refund_amount'] ?? null,
            $validated['refund_method'] ?? null,
            $this->resolveReturnShippingLabel($returnRequest, $veeqo)
        );
    } elseif ($newStatus === 'product_received' && $previousStatus !== 'product_received') {
        $emailNotification = $this->sendReturnProductReceivedEmail($returnRequest);
    } elseif ($isNewRefundInitiated) {
        $emailNotification = $this->sendReturnRefundInitiatedEmail($returnRequest, $validated['refund_amount'] ?? null);
    }

    $response = $returnRequest->fresh()->toArray();
    $response['email_notification'] = $emailNotification;

    return response()->json($response);
}

private function sendReturnProductReceivedEmail(ReturnRequest $returnRequest): array
{
    $payload = is_array($returnRequest->raw_payload)
        ? $returnRequest->raw_payload
        : json_decode($returnRequest->raw_payload ?? '[]', true);

    $order = is_array($payload['order'] ?? null) ? $payload['order'] : [];

    $email = $payload['email'] ?? $payload['customer_email'] ?? $order['email'] ?? null;
    $orderName = trim(($order['first_name'] ?? '').' '.($order['last_name'] ?? ''));
    $name = $payload['name'] ?? $payload['customer_name'] ?? ($orderName !== '' ? $orderName : 'Customer');

    if (! $email) {
        $message = "No customer email address found on return request #{$returnRequest->id}.";
        Log::warning("Return product received email skipped: {$message}");

        return ['sent' => false, 'email' => null, 'error' => $message];
    }

    try {
        Mail::to($email)->sendNow(new ReturnProductReceivedMail($returnRequest, $name));
        Log::info("Return product received email sent successfully to {$email} for return request #{$returnRequest->id}.");

        return ['sent' => true, 'email' => $email, 'error' => null];
    } catch (Throwable $e) {
        Log::error("Return product received email failed to send to {$email} for return request #{$returnRequest->id}: {$e->getMessage()}");

        return ['sent' => false, 'email' => $email, 'error' => $e->getMessage()];
    }
}

/**
 * Resolves the return (inbound) label PDF for the 1971co order's already-purchased Veeqo shipment.
 * Only works if that shipment was originally purchased with `try_inbound_label: true` (see
 * RemoteOrderVeeqoBookingService::purchaseLabel) - orders booked before that was enabled, or
 * non-1971co orders, simply won't have a return label available.
 *
 * A copy is saved under public/uploads/return-labels and the path recorded on the return_requests
 * row on first fetch, so later calls (admin view, resend) read from local disk instead of hitting
 * Veeqo again.
 */
private function resolveReturnShippingLabel(ReturnRequest $returnRequest, VeeqoService $veeqo): ?string
{
    if ($returnRequest->return_label_file_path) {
        $existingPath = public_path($returnRequest->return_label_file_path);
        if (is_file($existingPath)) {
            return file_get_contents($existingPath);
        }
    }

    $remoteOrder = RemoteOrder::query()->where('order_number', $returnRequest->order_number)->first();

    if (! $remoteOrder || $remoteOrder->order_from !== '1971co') {
        return null;
    }

    $raw = is_array($remoteOrder->raw_payload) ? $remoteOrder->raw_payload : [];
    $shipmentId = (int) ($raw['veeqo_booking']['label']['id'] ?? 0);

    if ($shipmentId <= 0) {
        Log::warning("No Veeqo shipment id found for order #{$remoteOrder->order_number} - skipping return label.");

        return null;
    }

    try {
        $label = $veeqo->getShippingLabel([$shipmentId], 'pdf');
        $content = (string) ($label['content'] ?? '');

        if ($content === '') {
            return null;
        }

        $returnRequest->update([
            'return_label_file_path' => $this->saveReturnLabelFile($returnRequest, $content),
            'return_label_saved_at' => now(),
        ]);

        return $content;
    } catch (\Throwable $e) {
        Log::warning("Failed to fetch Veeqo return label for shipment {$shipmentId}: {$e->getMessage()}");

        return null;
    }
}

private function saveReturnLabelFile(ReturnRequest $returnRequest, string $content): string
{
    $directory = public_path('uploads/return-labels');
    if (! is_dir($directory)) {
        mkdir($directory, 0755, true);
    }

    $safeOrderNumber = preg_replace('/[^A-Za-z0-9_-]/', '-', (string) $returnRequest->order_number) ?: 'order';
    $fileName = "return-label-{$safeOrderNumber}-{$returnRequest->id}.pdf";
    file_put_contents($directory . DIRECTORY_SEPARATOR . $fileName, $content);

    return 'uploads/return-labels/' . $fileName;
}

/**
 * Sends synchronously (bypassing the queue) so the API response can report send/failure immediately.
 */
private function sendReturnApprovedEmail(ReturnRequest $returnRequest, ?float $refundAmount, ?string $refundMethod, ?string $labelPdfContent = null): array
{
    $payload = is_array($returnRequest->raw_payload)
        ? $returnRequest->raw_payload
        : json_decode($returnRequest->raw_payload ?? '[]', true);

    $order = is_array($payload['order'] ?? null) ? $payload['order'] : [];

    $email = $payload['email'] ?? $payload['customer_email'] ?? $order['email'] ?? null;
    $orderName = trim(($order['first_name'] ?? '').' '.($order['last_name'] ?? ''));
    $name = $payload['name'] ?? $payload['customer_name'] ?? ($orderName !== '' ? $orderName : 'Customer');

    if (! $email) {
        $message = "No customer email address found on return request #{$returnRequest->id}.";
        Log::warning("Return approved email skipped: {$message}");

        return ['sent' => false, 'email' => null, 'error' => $message];
    }

    try {
        Mail::to($email)->sendNow(new ReturnApprovedMail($returnRequest, $name, $refundAmount, $refundMethod, $labelPdfContent));
        Log::info("Return approved email sent successfully to {$email} for return request #{$returnRequest->id}.");

        return ['sent' => true, 'email' => $email, 'error' => null];
    } catch (Throwable $e) {
        Log::error("Return approved email failed to send to {$email} for return request #{$returnRequest->id}: {$e->getMessage()}");

        return ['sent' => false, 'email' => $email, 'error' => $e->getMessage()];
    }
}

private function sendReturnRefundInitiatedEmail(ReturnRequest $returnRequest, ?float $refundAmount): array
{
    $payload = is_array($returnRequest->raw_payload)
        ? $returnRequest->raw_payload
        : json_decode($returnRequest->raw_payload ?? '[]', true);

    $order = is_array($payload['order'] ?? null) ? $payload['order'] : [];

    $email = $payload['email'] ?? $payload['customer_email'] ?? $order['email'] ?? null;
    $orderName = trim(($order['first_name'] ?? '').' '.($order['last_name'] ?? ''));
    $name = $payload['name'] ?? $payload['customer_name'] ?? ($orderName !== '' ? $orderName : 'Customer');

    if (! $email) {
        $message = "No customer email address found on return request #{$returnRequest->id}.";
        Log::warning("Return refund initiated email skipped: {$message}");

        return ['sent' => false, 'email' => null, 'error' => $message];
    }

    try {
        Mail::to($email)->sendNow(new ReturnRefundInitiatedMail($returnRequest, $name, $refundAmount));
        Log::info("Return refund initiated email sent successfully to {$email} for return request #{$returnRequest->id}.");

        return ['sent' => true, 'email' => $email, 'error' => null];
    } catch (Throwable $e) {
        Log::error("Return refund initiated email failed to send to {$email} for return request #{$returnRequest->id}: {$e->getMessage()}");

        return ['sent' => false, 'email' => $email, 'error' => $e->getMessage()];
    }
}

    /**
     * Cartons currently holding stock of the given product (matched by the product's barcode
     * inside the carton's scanned product_code list), so the returned item can be restocked
     * into an existing carton instead of only adjusting raw stock numbers.
     */
    public function cartons(Request $request, int $id): JsonResponse
    {
        ReturnRequest::query()->findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'nullable|integer|min:1',
            'name' => 'required_without:product_id|nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
        ]);

        $product = $this->resolveReturnedProduct($validated);

        if (! $product) {
            return response()->json([
                'message' => 'Could not find a matching inventory product for this return item.',
            ], 404);
        }

        if (empty($product->barCode)) {
            return response()->json(['product_id' => $product->id, 'cartons' => []]);
        }

        $query = Cartoon::query()
            ->with('warehouse:id,name')
            ->whereNotNull('received_to_stock_at')
            ->whereJsonContains('product_code', $product->barCode);

        $warehouseIds = $this->resolveWarehouseIds($request->user());
        if ($warehouseIds !== null) {
            if ($warehouseIds === []) {
                return response()->json(['product_id' => $product->id, 'cartons' => []]);
            }

            $query->whereIn('warehouse_id', $warehouseIds);
        }

        $cartonWarehouses = $query->orderByDesc('id')->get();

        $stockByWarehouse = Stock::query()
            ->where('product_id', $product->id)
            ->whereIn('warehouse_id', $cartonWarehouses->pluck('warehouse_id')->unique()->values())
            ->get()
            ->groupBy('warehouse_id');

        $cartons = $cartonWarehouses->map(function (Cartoon $cartoon) use ($stockByWarehouse) {
            $codes = is_array($cartoon->product_code) ? $cartoon->product_code : [];
            $stock = $stockByWarehouse->get($cartoon->warehouse_id)?->first();

            return [
                'id' => $cartoon->id,
                'cartoon_number' => $cartoon->cartoon_number,
                'quantity' => (int) $cartoon->quantity,
                'product_units_in_cartoon' => count($codes),
                'warehouse_id' => $cartoon->warehouse_id,
                'warehouse_name' => $cartoon->warehouse?->name,
                'current_stock' => (int) ($stock->stocks ?? 0),
            ];
        });

        return response()->json(['product_id' => $product->id, 'cartons' => $cartons->values()]);
    }

    /**
     * Restock a returned product into the chosen carton: adds the product's barcode back into
     * the carton's scanned product_code list and increases the matching warehouse stock.
     */
    public function restock(Request $request, int $id): JsonResponse
    {
        $returnRequest = ReturnRequest::query()->findOrFail($id);

        $validated = $request->validate([
            'product_id' => 'nullable|integer|min:1',
            'name' => 'required_without:product_id|nullable|string|max:255',
            'color' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:255',
            'cartoon_id' => 'required|integer|min:1|exists:cartoons,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = $this->resolveReturnedProduct($validated);

        if (! $product) {
            return response()->json([
                'message' => 'Could not find a matching inventory product for this return item.',
            ], 404);
        }

        $cartoon = Cartoon::query()->findOrFail((int) $validated['cartoon_id']);
        $quantity = (int) $validated['quantity'];

        $warehouseIds = $this->resolveWarehouseIds($request->user());
        if ($warehouseIds !== null && ! in_array((int) $cartoon->warehouse_id, $warehouseIds, true)) {
            return response()->json([
                'message' => 'You do not have permission to restock into this warehouse.',
            ], 403);
        }

        DB::transaction(function () use ($cartoon, $product, $quantity, $returnRequest, $request) {
            $codes = is_array($cartoon->product_code) ? $cartoon->product_code : [];
            for ($i = 0; $i < $quantity; $i++) {
                $codes[] = $product->barCode;
            }

            $cartoon->update([
                'product_code' => array_values($codes),
                'quantity' => ((int) $cartoon->quantity) + $quantity,
            ]);

            $stock = Stock::query()
                ->where('product_id', $product->id)
                ->where('warehouse_id', $cartoon->warehouse_id)
                ->lockForUpdate()
                ->first();

            if ($stock) {
                $stock->increment('stocks', $quantity);
            } else {
                Stock::query()->create([
                    'product_id' => $product->id,
                    'warehouse_id' => $cartoon->warehouse_id,
                    'brand_id' => $product->brand_id,
                    'stocks' => $quantity,
                ]);
            }

            $restockedItems = is_array($returnRequest->restocked_items) ? $returnRequest->restocked_items : [];
            $restockedItems[] = [
                'product_id' => $product->id,
                'name' => $request->input('name'),
                'color' => $request->input('color'),
                'size' => $request->input('size'),
                'cartoon_id' => $cartoon->id,
                'quantity' => $quantity,
                'restocked_by' => $request->user()?->id,
                'restocked_at' => now()->toISOString(),
            ];

            $returnRequest->update(['restocked_items' => $restockedItems]);
        });

        return response()->json([
            'message' => 'Return item restocked successfully.',
            'return_request' => $returnRequest->fresh(),
            'cartoon' => $cartoon->fresh(),
        ]);
    }

    /**
     * The storefront's own product id belongs to a different app/catalog, so the returned
     * item's actual inventory product must be resolved by matching its name/color/size
     * against this app's Product + Color + Size records instead of trusting that id.
     */
    private function resolveReturnedProduct(array $criteria): ?Product
    {
        $name = trim((string) ($criteria['name'] ?? ''));
        $color = trim((string) ($criteria['color'] ?? ''));
        $size = trim((string) ($criteria['size'] ?? ''));

        if ($name === '') {
            $productId = (int) ($criteria['product_id'] ?? 0);

            return $productId > 0 ? Product::query()->find($productId) : null;
        }

        $query = Product::query()->whereRaw('LOWER(name) = ?', [mb_strtolower($name)]);

        if ($color !== '') {
            $query->whereHas('color', function ($builder) use ($color) {
                $builder
                    ->whereRaw('LOWER(name) = ?', [mb_strtolower($color)])
                    ->orWhereRaw('LOWER(color_code) = ?', [mb_strtolower($color)]);
            });
        }

        if ($size !== '') {
            $query->whereHas('size', function ($builder) use ($size) {
                $builder->whereRaw('LOWER(size) = ?', [mb_strtolower($size)]);
            });
        }

        return $query->first();
    }

    public function sync(Request $request, ReturnRequestSyncService $syncService): JsonResponse
    {
        $validated = $request->validate([
            'since_id' => 'nullable|integer|min:0',
            'limit' => 'nullable|integer|min:1|max:200',
        ]);

        try {
            $result = $syncService->syncRecent(
                $validated['since_id'] ?? null,
                (int) ($validated['limit'] ?? 100)
            );
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 502);
        }

        return response()->json([
            'message' => '1971co return request sync completed successfully.',
            ...$result,
        ]);
    }
}
