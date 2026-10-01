<?php

namespace App\Mail;

use App\Models\ReturnRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReturnProductReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ReturnRequest $returnRequest,
        public string $customerName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders-no-reply@1971co.com', '1971Co'),
            subject: 'We Received Your Return — Order #' . $this->returnRequest->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'return_product_received',
            with: [
                'name' => $this->customerName,
                'returnRequest' => $this->returnRequest,
            ],
        );
    }
}