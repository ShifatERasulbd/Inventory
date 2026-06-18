<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Account::query()->with(['warehouse:id,name', 'brand:id,name'])->orderByDesc('id');

        $warehouseId = (int) $request->query('warehouse_id', 0);
        if ($warehouseId > 0) {
            $query->where('warehouse_id', $warehouseId);
        }

        $brandId = (int) $request->query('brand_id', 0);
        if ($brandId > 0) {
            $query->where('brand_id', $brandId);
        }

        $entryType = trim((string) $request->query('entry_type', ''));
        if ($entryType !== '') {
            $query->where('entry_type', $entryType);
        }

        $paymentStatus = trim((string) $request->query('payment_status', ''));
        if ($paymentStatus !== '') {
            $query->where('payment_status', $paymentStatus);
        }

        return response()->json(
            $query->get()->map(fn (Account $account) => [
                'id' => $account->id,
                'warehouse_id' => $account->warehouse_id,
                'warehouse_name' => $account->warehouse?->name,
                'brand_id' => $account->brand_id,
                'brand_name' => $account->brand?->name,
                'source_type' => $account->source_type,
                'source_id' => $account->source_id,
                'entry_type' => $account->entry_type,
                'reference' => $account->reference,
                'total_amount' => (float) ($account->total_amount ?? 0),
                'paid_amount' => (float) ($account->paid_amount ?? 0),
                'due_amount' => (float) ($account->due_amount ?? 0),
                'payment_status' => $account->payment_status,
                'transaction_date' => $account->transaction_date?->format('Y-m-d'),
                'note' => $account->note,
                'meta' => $account->meta,
            ])
        );
    }
}
