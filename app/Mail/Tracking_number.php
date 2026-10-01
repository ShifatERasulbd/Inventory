<?php

namespace App\Mail;

use App\Models\RemoteOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class Tracking_number extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(public RemoteOrder $order)
    {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Order #{$this->order->order_number} Has Shipped",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $payload = is_array($this->order->raw_payload) ? $this->order->raw_payload : [];
        $name = trim(($payload['first_name'] ?? '') . ' ' . ($payload['last_name'] ?? ''));

        return new Content(
            view: 'tracking_number',
            with: [
                'name' => $name !== '' ? $name : 'Customer',
                'order' => (object) $payload,
                'trackingUrl' => $this->order->tracking_url,
                'carrier' => $this->order->shipping_carrier,
                'service' => $this->order->shipping_service,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
