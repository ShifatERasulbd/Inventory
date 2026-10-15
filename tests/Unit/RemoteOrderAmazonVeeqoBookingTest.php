<?php

namespace Tests\Unit;

use App\Models\RemoteOrder;
use App\Services\RemoteOrderVeeqoBookingService;
use App\Services\VeeqoService;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class RemoteOrderAmazonVeeqoBookingTest extends TestCase
{
    public function test_it_buys_a_label_for_the_existing_veeqo_amazon_order(): void
    {
        $veeqo = Mockery::mock(VeeqoService::class);
        $veeqo->shouldReceive('findOrderByNumber')
            ->once()
            ->with('AMZ-123')
            ->andReturn(['id' => 456]);
        $veeqo->shouldReceive('getOrder')
            ->once()
            ->with(456)
            ->andReturn(['allocations' => [['id' => 789]]]);
        $veeqo->shouldReceive('getShippingRates')
            ->once()
            ->with(789)
            ->andReturn(['available' => [[
                'carrier' => 'UPS',
                'service_carrier' => 'UPS',
                'name' => 'UPS Ground',
                'title' => 'UPS Ground',
                'remote_shipment_id' => 'shipment-ref',
                'total_net_charge' => '10',
                'base_rate' => '10',
            ]]]);
        $veeqo->shouldReceive('purchaseShippingLabel')
            ->once()
            ->andReturn(['id' => 0, 'has_return_label' => true]);

        $order = Mockery::mock(new RemoteOrder([
            'order_from' => 'amazon',
            'order_number' => 'AMZ-123',
            'raw_payload' => [],
        ]))->makePartial();
        $order->shouldReceive('save')->twice()->andReturn(true);

        $result = (new RemoteOrderVeeqoBookingService($veeqo))->book($order);

        $this->assertSame(['id' => 456], $result);
        $this->assertSame(456, $order->raw_payload['veeqo_booking']['veeqo_order_id']);
        $this->assertSame(789, $order->raw_payload['veeqo_booking']['allocation_id']);
        $this->assertTrue($order->raw_payload['veeqo_booking']['label']['has_return_label']);
    }

    public function test_it_reports_a_missing_veeqo_api_key_before_sending_a_request(): void
    {
        config(['services.veeqo.key' => '']);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Set VEEQO_API_KEY in the application environment.');

        (new VeeqoService())->findOrderByNumber('AMZ-123');
    }
}
