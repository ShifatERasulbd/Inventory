<?php

namespace App\Services;

use App\Models\RemoteOrder;
use RuntimeException;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class RemoteOrderRefundService
{
    /**
     * Refund the Stripe charge tied to a remote order, using the Stripe account
     * that belongs to the store the order originated from (1971co vs viveren/joor).
     */
    public function refund(RemoteOrder $order): void
    {
        $chargeId = trim((string) $order->stripe_payment_id);
        if ($chargeId === '') {
            throw new RuntimeException('This order has no Stripe payment id to refund.');
        }

        $secret = $this->secretKeyForOrderFrom((string) $order->order_from);
        if ($secret === '') {
            throw new RuntimeException('Stripe secret key is not configured for this order\'s store.');
        }

        try {
            $stripe = new StripeClient($secret);

            $charge = $stripe->charges->retrieve($chargeId);
            if ($charge->refunded) {
                // Already fully refunded (e.g. via the Remote Orders page or Stripe dashboard directly) -
                // Stripe rejects a second refund on the same charge, so treat this as a no-op success
                // instead of surfacing a confusing "already refunded" error to the user.
                return;
            }

            $stripe->refunds->create(['charge' => $chargeId]);
        } catch (ApiErrorException $e) {
            throw new RuntimeException('Stripe refund failed: '.$e->getMessage());
        }
    }

    private function secretKeyForOrderFrom(string $orderFrom): string
    {
        $configKey = $orderFrom === '1971co' ? 'store_1971co' : 'main_store';

        return trim((string) config('services.'.$configKey.'.stripe_secret'));
    }
}
