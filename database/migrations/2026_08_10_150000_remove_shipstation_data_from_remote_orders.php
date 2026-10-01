<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('remote_orders')
            ->whereRaw("LOWER(COALESCE(courier_company, '')) = ?", ['shipstation'])
            ->update(['courier_company' => 'UPS']);

        DB::table('remote_orders')
            ->select(['id', 'raw_payload'])
            ->orderBy('id')
            ->chunkById(200, function ($rows): void {
                foreach ($rows as $row) {
                    $payload = json_decode((string) $row->raw_payload, true);
                    if (! is_array($payload)) {
                        continue;
                    }

                    $updated = false;

                    $courierCompany = strtolower(trim((string) ($payload['courier_company'] ?? '')));
                    if ($courierCompany === 'shipstation') {
                        $payload['courier_company'] = 'UPS';
                        $updated = true;
                    }

                    $courierService = strtolower(trim((string) ($payload['courier_service'] ?? '')));
                    if ($courierService === 'shipstation') {
                        $payload['courier_service'] = 'ups';
                        $updated = true;
                    }

                    $bookingCourier = strtolower(trim((string) data_get($payload, 'courier_booking.courier', '')));
                    if ($bookingCourier === 'shipstation') {
                        data_set($payload, 'courier_booking.courier', 'ups');
                        $updated = true;
                    }

                    if (! $updated) {
                        continue;
                    }

                    DB::table('remote_orders')
                        ->where('id', $row->id)
                        ->update(['raw_payload' => json_encode($payload, JSON_UNESCAPED_UNICODE)]);
                }
            });
    }

    public function down(): void
    {
        // No down migration: ShipStation integration was permanently removed.
    }
};
