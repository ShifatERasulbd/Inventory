<?php

namespace App\Mail;

use App\Models\ReturnRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReturnApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ReturnRequest $returnRequest,
        public string $customerName,
        public ?float $refundAmount = null,
        public ?string $refundMethod = null,
        public ?string $labelPdfContent = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address('orders-no-reply@1971co.com', '1971Co'),
            subject: 'Your Return Has Been Approved — Order #' . $this->returnRequest->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'return_approved',
            with: [
                'name' => $this->customerName,
                'returnRequest' => $this->returnRequest,
                'refundAmount' => $this->refundAmount,
                'refundMethod' => $this->refundMethod,
            ],
        );
    }

    public function attachments(): array
    {
        if ($this->labelPdfContent === null || $this->labelPdfContent === '') {
            return [];
        }

        return [
            Attachment::fromData(fn () => $this->labelPdfContent, 'return-shipping-label-' . $this->returnRequest->order_number . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}