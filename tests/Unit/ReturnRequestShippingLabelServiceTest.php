<?php

namespace Tests\Unit;

use App\Models\RemoteOrder;
use App\Models\ReturnRequest;
use App\Services\ReturnRequestShippingLabelService;
use App\Services\VeeqoService;
use Illuminate\Support\Facades\Log;
use Mockery;
use Tests\TestCase;

class ReturnRequestShippingLabelServiceTest extends TestCase
{
    public function test_it_can_create_a_return_label_without_a_local_remote_order(): void
    {
        config([
            'services.veeqo.origin' => [
                'address1' => '100 Warehouse Road',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip' => '98101',
                'country' => 'US',
            ],
        ]);

        $veeqo = Mockery::mock(VeeqoService::class);
        $veeqo->shouldReceive('findOrderByNumber')
            ->once()
            ->with('ORD-20261001023833-7456')
            ->andReturn(['id' => 88]);
        $veeqo->shouldReceive('getOrder')
            ->once()
            ->with(88)
            ->andReturn([
                'deliver_to' => [
                    'first_name' => 'AKM',
                    'last_name' => 'Hoque',
                    'address1' => '12 Customer Street',
                    'city' => 'Bolton',
                    'state' => 'MA',
                    'zip' => '01740',
                    'country' => 'US',
                ],
                'allocations' => [[
                    'allocation_package' => ['weight' => 750, 'weight_unit' => 'g'],
                ]],
            ]);
        $veeqo->shouldReceive('getStandaloneShippingRates')
            ->once()
            ->andReturn([
                'remote_shipment_id' => 'shipment-456',
                'request_token' => 'request-token-456',
                'quotes' => [[
                    'service_name' => 'UPS Ground',
                    'carrier_id' => 'UPS',
                    'rate_id' => 'quote-456',
                    'total_charge' => '8.50',
                ]],
            ]);
        $veeqo->shouldReceive('bookStandaloneShipment')
            ->once()
            ->andReturn(['successful' => [
                'shipment-456' => [
                    'label_content' => base64_encode("%PDF-1.4\nreturn label\n"),
                ],
            ]]);

        $returnRequest = Mockery::mock(ReturnRequest::class)->makePartial();
        $returnRequest->forceFill([
            'id' => 93282,
            'order_number' => 'ORD-20261001023833-7456',
            'raw_payload' => [
                'order' => [
                    'total' => 99.99,
                    'items' => [['name' => 'Shirt', 'quantity' => 1, 'priceValue' => 99.99]],
                ],
            ],
        ]);
        $returnRequest->shouldReceive('update')
            ->twice()
            ->andReturnUsing(function (array $attributes) use ($returnRequest): bool {
                $returnRequest->fill($attributes);

                return true;
            });

        $labelPath = public_path('uploads/return-labels/return-label-ORD-20261001023833-7456-93282.pdf');

        try {
            $content = (new ReturnRequestShippingLabelService($veeqo))->resolve($returnRequest);

            $this->assertSame("%PDF-1.4\nreturn label\n", $content);
            $this->assertSame('shipment-456', $returnRequest->raw_payload['veeqo_return_label']['shipment_id']);
            $this->assertSame(
                'uploads/return-labels/return-label-ORD-20261001023833-7456-93282.pdf',
                $returnRequest->return_label_file_path
            );
        } finally {
            if (is_file($labelPath)) {
                unlink($labelPath);
            }

            $labelDirectory = dirname($labelPath);
            if (is_dir($labelDirectory) && count(scandir($labelDirectory)) === 2) {
                rmdir($labelDirectory);
            }
        }
    }

    public function test_it_books_an_inbound_veeqo_shipment_and_saves_its_label(): void
    {
        Log::spy();

        config([
            'services.veeqo.origin' => [
                'address1' => '100 Warehouse Road',
                'city' => 'Seattle',
                'state' => 'WA',
                'zip' => '98101',
                'country' => 'US',
            ],
        ]);

        $veeqo = Mockery::mock(VeeqoService::class);
        $veeqo->shouldReceive('getOrder')
            ->once()
            ->with(88)
            ->andReturn([
                'deliver_to' => [
                    'first_name' => 'Sam',
                    'last_name' => 'Customer',
                    'address1' => '12 Customer Street',
                    'city' => 'Tacoma',
                    'state' => 'WA',
                    'zip' => '98402',
                    'country' => 'US',
                ],
                'allocations' => [[
                    'allocation_package' => [
                        'weight' => 750,
                        'weight_unit' => 'g',
                        'width' => 20.32,
                        'height' => 20.32,
                        'depth' => 30.48,
                        'dimensions_unit' => 'cm',
                    ],
                ]],
            ]);
        $veeqo->shouldReceive('getStandaloneShippingRates')
            ->once()
            ->with(Mockery::on(function (array $payload): bool {
                $this->assertTrue($payload['inbound']);
                $this->assertSame('12 Customer Street', $payload['from_address']['line1']);
                $this->assertSame('100 Warehouse Road', $payload['to_address']['line1']);
                $this->assertSame(1.6535, $payload['parcels'][0]['weight']);
                $this->assertSame('lb', $payload['parcels'][0]['weight_unit']);
                $this->assertSame(8.0, $payload['parcels'][0]['width']);
                $this->assertSame(8.0, $payload['parcels'][0]['height']);
                $this->assertSame(12.0, $payload['parcels'][0]['length']);
                $this->assertSame('in', $payload['parcels'][0]['dimension_unit']);

                return true;
            }))
            ->andReturn([
                'quotes' => [[
                    'service_name' => 'UPS Ground',
                    'carrier_id' => 'UPS',
                    'rate_id' => 'quote-123',
                    'total_charge' => '8.50',
                    'shipping_service_options' => [[
                        'key' => 'value_added_service__VAS_GROUP_ID_CONFIRMATION',
                        'values' => [['value' => 'NO_CONFIRMATION']],
                    ]],
                ]],
                'remote_shipment_id' => 'shipment-123',
                'request_token' => 'token-123',
            ]);
        $veeqo->shouldReceive('bookStandaloneShipment')
            ->once()
            ->with(Mockery::on(function (array $payload): bool {
                $this->assertSame('token-123', $payload['request_token']);
                $this->assertSame('shipment-123', $payload['shipments'][0]['remote_shipment_id']);
                $this->assertSame('quote-123', $payload['shipments'][0]['rate_id']);
                $this->assertSame(
                    'NO_CONFIRMATION',
                    $payload['shipments'][0]['value_added_service__VAS_GROUP_ID_CONFIRMATION']
                );

                return true;
            }))
            ->andReturn([
                'successful' => [
                    'shipment-123' => [
                        'tracking_number' => '1Z123',
                        'service_name' => 'UPS Ground',
                        'label_content' => base64_encode("%PDF-1.4\nreturn label\n"),
                    ],
                ],
            ]);

        $returnRequest = Mockery::mock(ReturnRequest::class)->makePartial();
        $returnRequest->forceFill([
            'id' => 93281,
            'order_number' => 'ORDER-42',
            'raw_payload' => [],
        ]);
        $returnRequest->shouldReceive('update')
            ->twice()
            ->andReturnUsing(function (array $attributes) use ($returnRequest): bool {
                $returnRequest->fill($attributes);

                return true;
            });

        $remoteOrder = new RemoteOrder([
            'order_from' => '1971co',
            'order_number' => 'ORDER-42',
            'total' => 25,
            'raw_payload' => [
                'veeqo_booking' => [
                    'veeqo_order_id' => 88,
                    'label' => ['has_return_label' => false],
                ],
                'first_name' => 'Sam',
                'last_name' => 'Customer',
                'address_line_1' => '12 Customer Street',
                'city' => 'Tacoma',
                'state' => 'WA',
                'postal_code' => '98402',
                'country' => 'US',
                'items' => [['name' => 'Polo Shirt', 'quantity' => 1, 'priceValue' => 25]],
            ],
        ]);

        $labelPath = public_path('uploads/return-labels/return-label-ORDER-42-93281.pdf');

        try {
            $content = (new ReturnRequestShippingLabelService($veeqo))
                ->resolve($returnRequest, $remoteOrder);

            $this->assertSame("%PDF-1.4\nreturn label\n", $content);
            $this->assertFileExists($labelPath);
            $this->assertSame($content, file_get_contents($labelPath));
            $this->assertSame('shipment-123', $returnRequest->raw_payload['veeqo_return_label']['shipment_id']);
            $this->assertSame('uploads/return-labels/return-label-ORDER-42-93281.pdf', $returnRequest->return_label_file_path);
            Log::shouldHaveReceived('info')->with(
                'Veeqo return label rate request',
                Mockery::on(fn (array $context): bool =>
                    $context['payload']['parcels'][0]['weight'] === 1.6535
                    && $context['payload']['parcels'][0]['weight_unit'] === 'lb'
                    && $context['payload']['from_address']['line1'] === '[redacted]'
                )
            )->once();
            Log::shouldHaveReceived('info')->with(
                'Veeqo return label rate response',
                Mockery::on(fn (array $context): bool =>
                    $context['response']['quotes'][0]['rate_id'] === 'quote-123'
                    && $context['response']['remote_shipment_id'] === 'shipment-123'
                    && $context['response']['request_token'] === '[redacted]'
                )
            )->once();
            Log::shouldHaveReceived('info')->with(
                'Veeqo return label booking response',
                Mockery::on(fn (array $context): bool =>
                    $context['response']['successful']['shipment-123']['tracking_number'] === '1Z123'
                    && str_starts_with($context['response']['successful']['shipment-123']['label_content'], '[redacted;')
                )
            )->once();
        } finally {
            if (is_file($labelPath)) {
                unlink($labelPath);
            }

            $labelDirectory = dirname($labelPath);
            if (is_dir($labelDirectory) && count(scandir($labelDirectory)) === 2) {
                rmdir($labelDirectory);
            }
        }
    }
}
