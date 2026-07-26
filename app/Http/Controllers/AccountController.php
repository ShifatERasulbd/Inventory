<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $accounts = Account::query()
            ->select([
                'id',
                'warehouse_id',
                'brand_id',
                'source_type',
                'source_id',
                'entry_type',
                'reference',
                'total_amount',
                'paid_amount',
                'due_amount',
                'payment_status',
                'transaction_date',
                'note',
                'meta',
            ])
            ->with([
                'warehouse:id,name',
                'brand:id,name',
            ])
            ->when($request->filled('warehouse_id') && (int)$request->warehouse_id > 0, function ($query) use ($request) {
                $query->where('warehouse_id', (int)$request->warehouse_id);
            })
            ->when($request->filled('brand_id') && (int)$request->brand_id > 0, function ($query) use ($request) {
                $query->where('brand_id', (int)$request->brand_id);
            })
            ->when($request->filled('entry_type'), function ($query) use ($request) {
                $query->where('entry_type', trim($request->entry_type));
            })
            ->when($request->filled('payment_status'), function ($query) use ($request) {
                $query->where('payment_status', trim($request->payment_status));
            })
            ->latest('id')
            ->get();

        return response()->json(
            $accounts->map(static function (Account $account) {
                return [
                    'id' => $account->id,
                    'warehouse_id' => $account->warehouse_id,
                    'warehouse_name' => $account->warehouse?->name,
                    'brand_id' => $account->brand_id,
                    'brand_name' => $account->brand?->name,
                    'source_type' => $account->source_type,
                    'source_id' => $account->source_id,
                    'entry_type' => $account->entry_type,
                    'reference' => $account->reference,
                    'total_amount' => (float) $account->total_amount,
                    'paid_amount' => (float) $account->paid_amount,
                    'due_amount' => (float) $account->due_amount,
                    'payment_status' => $account->payment_status,
                    'transaction_date' => optional($account->transaction_date)->format('Y-m-d'),
                    'note' => $account->note,
                    'meta' => $account->meta,
                ];
            })
        );
    }
}