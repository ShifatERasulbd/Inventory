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

class ReturnRefundInitiatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ReturnRequest $returnRequest,
        public string $customerName,
        public ?float $refundAmount = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders-no-reply@1971co.com', '1971Co'),
            subject: 'Your Refund Has Been Initiated — Order #' . $this->returnRequest->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'return_refund_initiated',
            with: [
                'name' => $this->customerName,
                'returnRequest' => $this->returnRequest,
                'refundAmount' => $this->refundAmount,
            ],
        );
    }
}