<?php

namespace Tests\Unit;

use App\Services\VeeqoService;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VeeqoStandaloneShippingApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.veeqo.key' => 'test-api-key',
            'services.veeqo.url' => 'https://api.veeqo.com',
            'services.veeqo.verify_ssl' => false,
        ]);
    }

    public function test_it_requests_rates_and_books_a_standalone_shipment(): void
    {
        Http::fake([
            'https://api.veeqo.com/shipping/api/v1/rates' => Http::response(['quotes' => []]),
            'https://api.veeqo.com/shipping/api/v1/shipments' => Http::response(['successful' => []]),
        ]);

        $veeqo = new VeeqoService();
        $veeqo->getStandaloneShippingRates(['inbound' => true]);
        $veeqo->bookStandaloneShipment(['shipments' => []]);

        Http::assertSent(fn (ClientRequest $request) =>
            $request->method() === 'POST'
            && $request->url() === 'https://api.veeqo.com/shipping/api/v1/rates'
            && $request->hasHeader('x-api-key', 'test-api-key')
            && $request['inbound'] === true
        );
        Http::assertSent(fn (ClientRequest $request) =>
            $request->method() === 'POST'
            && $request->url() === 'https://api.veeqo.com/shipping/api/v1/shipments'
            && $request->hasHeader('x-api-key', 'test-api-key')
        );
    }

    public function test_it_downloads_a_standalone_shipment_pdf_label(): void
    {
        Http::fake([
            'https://api.veeqo.com/shipping/api/v1/shipments/shipment-123/label.pdf' =>
                Http::response("%PDF-1.4\nlabel\n", 200, ['Content-Type' => 'application/pdf']),
        ]);

        $label = (new VeeqoService())->getStandaloneShippingLabel('shipment-123', 'pdf');

        $this->assertSame("%PDF-1.4\nlabel\n", $label['content']);
        $this->assertSame('application/pdf', $label['content_type']);
        Http::assertSent(fn (ClientRequest $request) =>
            $request->method() === 'GET'
            && $request->url() === 'https://api.veeqo.com/shipping/api/v1/shipments/shipment-123/label.pdf'
            && $request->hasHeader('Accept', 'application/pdf')
        );
    }
}
