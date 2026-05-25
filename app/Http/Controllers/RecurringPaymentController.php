<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\RecurringPayment;
use App\Services\AccountingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecurringPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RecurringPayment::query()
            ->with(['purchase:id,po_number,purchase_form,purchase_to,total_amount,paid_amount,due_amount,payment_status', 'warehouse:id,name'])
            ->orderByDesc('id');

        $purchaseId = (int) $request->query('purchase_id', 0);
        if ($purchaseId > 0) {
            $query->where('purchase_id', $purchaseId);
        }

        return response()->json(
            $query->get()->map(fn (RecurringPayment $payment) => [
                'id' => $payment->id,
                'purchase_id' => $payment->purchase_id,
                'po_number' => $payment->purchase?->po_number,
                'warehouse_id' => $payment->warehouse_id,
                'warehouse_name' => $payment->warehouse?->name,
                'amount' => (float) ($payment->amount ?? 0),
                'frequency' => $payment->frequency,
                'paid_on' => $payment->paid_on?->format('Y-m-d'),
                'next_due_date' => $payment->next_due_date?->format('Y-m-d'),
                'status' => $payment->status,
                'note' => $payment->note,
                'meta' => $payment->meta,
            ])
        );
    }

    public function store(Request $request, AccountingService $accountingService): JsonResponse
    {
        $validated = $request->validate([
            'purchase_id' => ['required', 'integer', 'exists:purchases,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'frequency' => ['nullable', 'string', 'in:manual,weekly,monthly,quarterly,yearly'],
            'paid_on' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        return DB::transaction(function () use ($validated, $accountingService): JsonResponse {
            $purchase = Purchase::query()->lockForUpdate()->findOrFail($validated['purchase_id']);
            $amount = (float) $validated['amount'];

            $totalAmount = (float) ($purchase->total_amount ?? 0);
            $currentPaid = (float) ($purchase->paid_amount ?? 0);

            if ($currentPaid + $amount > $totalAmount) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'amount' => ['Payment amount exceeds the remaining due amount.'],
                    ],
                ], 422);
            }

            $newPaid = $currentPaid + $amount;
            $newDue = max(0, $totalAmount - $newPaid);
            $paymentStatus = $newPaid <= 0 ? 'unpaid' : ($newDue <= 0 ? 'paid' : 'partial');

            $purchase->update([
                'paid_amount' => $newPaid,
                'due_amount' => $newDue,
                'payment_status' => $paymentStatus,
            ]);

            $frequency = $validated['frequency'] ?? 'manual';
            $paidOn = $validated['paid_on'] ?? now()->toDateString();
            $nextDueDate = null;
            if ($frequency === 'weekly') {
                $nextDueDate = now()->addWeek()->toDateString();
            } elseif ($frequency === 'monthly') {
                $nextDueDate = now()->addMonth()->toDateString();
            } elseif ($frequency === 'quarterly') {
                $nextDueDate = now()->addMonths(3)->toDateString();
            } elseif ($frequency === 'yearly') {
                $nextDueDate = now()->addYear()->toDateString();
            }

            $recurringPayment = RecurringPayment::query()->create([
                'purchase_id' => $purchase->id,
                'account_id' => null,
                'warehouse_id' => (int) ($purchase->purchase_form ?? 0) ?: null,
                'amount' => $amount,
                'frequency' => $frequency,
                'paid_on' => $paidOn,
                'next_due_date' => $nextDueDate,
                'status' => 'completed',
                'note' => $validated['note'] ?? null,
            ]);

            $purchase->refresh();
            $paymentAccount = $accountingService->createPurchasePaymentAccount($purchase, $recurringPayment);
            $recurringPayment->update(['account_id' => $paymentAccount->id]);

            $recurringPayment->load(['purchase:id,po_number', 'warehouse:id,name']);

            return response()->json([
                'id' => $recurringPayment->id,
                'purchase_id' => $recurringPayment->purchase_id,
                'po_number' => $recurringPayment->purchase?->po_number,
                'warehouse_id' => $recurringPayment->warehouse_id,
                'warehouse_name' => $recurringPayment->warehouse?->name,
                'amount' => (float) ($recurringPayment->amount ?? 0),
                'frequency' => $recurringPayment->frequency,
                'paid_on' => $recurringPayment->paid_on?->format('Y-m-d'),
                'next_due_date' => $recurringPayment->next_due_date?->format('Y-m-d'),
                'status' => $recurringPayment->status,
                'note' => $recurringPayment->note,
            ], 201);
        });
    }
}
