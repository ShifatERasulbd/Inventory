<?php

namespace App\Http\Controllers;

use App\Exceptions\RemoteOrderBookingException;
use App\Http\Traits\AuthorizesOrderCategory;
use App\Mail\Tracking_number;
use App\Models\RemoteOrder;
use App\Services\RemoteOrderVeeqoBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class BookingController extends Controller
{
    use AuthorizesOrderCategory;

    public function __construct(private RemoteOrderVeeqoBookingService $bookingService)
    {
    }

    /**
     * Book a remote order with Veeqo, always using the UPS Ground carrier.
     */
    public function store(Request $request, int $id): JsonResponse
    {
        // remote_id is only unique per order_from, so it can collide with another order's local id -
        // look up by local id first and only fall back to remote_id if nothing matched.
        $order = RemoteOrder::query()->where('id', $id)->first()
            ?? RemoteOrder::query()->where('remote_id', $id)->first();

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Remote order not found in local inventory database.',
            ], 404);
        }

        if ($response = $this->authorizeOrderAction($request, 'update', $order->order_from)) {
            return $response;
        }

        try {
            $veeqoOrder = $this->bookingService->book($order);
            $freshOrder = $order->fresh();

            $this->sendTrackingEmail($freshOrder);

            return response()->json([
                'success' => true,
                'message' => 'Order booked with Veeqo using UPS Ground.',
                'veeqo_order' => $veeqoOrder,
                'order' => $freshOrder,
            ]);
        } catch (RemoteOrderBookingException $e) {
            // Data-completeness issue (missing address/items/SKU) rather than an upstream/network failure.
            Log::warning('Veeqo booking rejected due to missing order data', [
                'remote_order_id' => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            Log::error('Veeqo booking failed', [
                'remote_order_id' => $id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 502);
        }
    }

    /**
     * Email the customer their tracking link, if we have both an email and a tracking URL.
     */
    private function sendTrackingEmail(RemoteOrder $order): void
    {
        $email = is_array($order->raw_payload) ? ($order->raw_payload['email'] ?? null) : null;

        if (! $email || ! $order->tracking_url || $order->tracking_email_sent_at) {
            return;
        }

        try {
            Mail::to($email)->send(new Tracking_number($order));
            $order->update(['tracking_email_sent_at' => now()]);
        } catch (Throwable $e) {
            Log::warning('Failed to send tracking number email', [
                'remote_order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Email tracking links for every already-booked order that hasn't been notified yet.
     */
    public function sendPendingTrackingEmails(Request $request): JsonResponse
    {
        if ($response = $this->authorizeOrderAction($request, 'update', null)) {
            return $response;
        }

        $orders = RemoteOrder::query()
            ->whereNotNull('tracking_url')
            ->whereNull('tracking_email_sent_at')
            ->get();

        $sent = 0;
        $skipped = 0;

        foreach ($orders as $order) {
            $email = is_array($order->raw_payload) ? ($order->raw_payload['email'] ?? null) : null;

            if (! $email) {
                $skipped++;
                continue;
            }

            $this->sendTrackingEmail($order);

            if ($order->fresh()->tracking_email_sent_at) {
                $sent++;
            } else {
                $skipped++;
            }
        }

        return response()->json([
            'success' => true,
            'sent' => $sent,
            'skipped' => $skipped,
        ]);
    }

    /**
     * Manually (re)send the tracking email for a single order, bypassing the already-sent guard.
     */
    public function sendTrackingEmailManually(Request $request, int $id): JsonResponse
    {
        $order = RemoteOrder::query()->where('id', $id)->first()
            ?? RemoteOrder::query()->where('remote_id', $id)->first();

        if (! $order) {
            return response()->json(['success' => false, 'message' => 'Remote order not found.'], 404);
        }

        if ($response = $this->authorizeOrderAction($request, 'update', $order->order_from)) {
            return $response;
        }

        $email = is_array($order->raw_payload) ? ($order->raw_payload['email'] ?? null) : null;

        if (! $email) {
            return response()->json(['success' => false, 'message' => 'This order has no customer email on file.'], 422);
        }

        if (! $order->tracking_url) {
            return response()->json(['success' => false, 'message' => 'This order has no tracking URL yet - book it with Veeqo first.'], 422);
        }

        try {
            Mail::to($email)->send(new Tracking_number($order));
            $order->update(['tracking_email_sent_at' => now()]);
        } catch (Throwable $e) {
            Log::warning('Failed to send tracking number email', [
                'remote_order_id' => $order->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json(['success' => false, 'message' => 'Failed to send email: ' . $e->getMessage()], 502);
        }

        return response()->json(['success' => true, 'message' => "Tracking email sent to {$email}."]);
    }
}
