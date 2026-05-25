<?php

namespace App\Http\Controllers;

use App\Models\Cartoon;
use App\Models\Purchase;
use App\Models\ReceivedCartoonIssue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceivedCartoonIssueController extends Controller
{
    private function resolveUserWarehouseIds($user): array
    {
        if ($user->hasRole('super-admin')) {
            return [];
        }

        $ids = is_array($user->warehouse_ids)
            ? array_values(array_unique(array_filter(array_map('intval', $user->warehouse_ids), fn (int $id) => $id > 0)))
            : [];

        if (empty($ids) && ! empty($user->warehouse_id)) {
            $ids = [(int) $user->warehouse_id];
        }

        return $ids;
    }

    private function formatIssue(ReceivedCartoonIssue $issue): array
    {
        return [
            'id' => $issue->id,
            'purchase_id' => $issue->purchase_id,
            'po_number' => $issue->purchase?->po_number,
            'cartoon_id' => $issue->cartoon_id,
            'cartoon_number' => $issue->cartoon?->cartoon_number,
            'concern_warehouse_id' => $issue->concern_warehouse_id,
            'concern_warehouse_name' => $issue->warehouse?->name,
            'raised_by' => $issue->raised_by,
            'raised_by_name' => $issue->raisedByUser?->name,
            'title' => $issue->title,
            'description' => $issue->description,
            'status' => $issue->status,
            'created_at' => $issue->created_at?->format('Y-m-d H:i'),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ReceivedCartoonIssue::query()
            ->with([
                'purchase:id,po_number',
                'cartoon:id,cartoon_number',
                'warehouse:id,name',
                'raisedByUser:id,name',
            ])
            ->orderByDesc('id');

        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            if ($warehouseIds === []) {
                return response()->json([]);
            }

            $query->whereIn('concern_warehouse_id', $warehouseIds);
        }

        $purchaseId = (int) $request->query('purchase_id', 0);
        if ($purchaseId > 0) {
            $query->where('purchase_id', $purchaseId);
        }

        return response()->json(
            $query->get()->map(fn (ReceivedCartoonIssue $issue) => $this->formatIssue($issue))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'purchase_id' => ['required', 'integer', 'exists:purchases,id'],
            'cartoon_id' => ['nullable', 'integer', 'exists:cartoons,id'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $purchase = Purchase::query()->findOrFail((int) $validated['purchase_id']);
        $cartoon = null;

        if (! empty($validated['cartoon_id'])) {
            $cartoon = Cartoon::query()->findOrFail((int) $validated['cartoon_id']);
            if ((int) ($cartoon->p_o_number ?? 0) !== (int) $purchase->id) {
                return response()->json([
                    'message' => 'Selected cartoon does not belong to selected purchase order.',
                ], 422);
            }
        }

        $concernWarehouseId = (int) ($purchase->purchase_to ?? 0);
        if ($concernWarehouseId <= 0 && $cartoon) {
            $concernWarehouseId = (int) ($cartoon->warehouse_id ?? 0);
        }
        if ($concernWarehouseId <= 0) {
            $concernWarehouseId = (int) ($purchase->purchase_form ?? 0);
        }

        if ($concernWarehouseId <= 0) {
            return response()->json([
                'message' => 'Unable to resolve concerned warehouse for this issue.',
            ], 422);
        }

        $user = $request->user();
        if (! $user->hasRole('super-admin')) {
            $warehouseIds = $this->resolveUserWarehouseIds($user);

            if (! in_array($concernWarehouseId, $warehouseIds, true)) {
                return response()->json([
                    'message' => 'You can raise issues only for your concerned warehouse.',
                ], 403);
            }
        }

        $issue = ReceivedCartoonIssue::query()->create([
            'purchase_id' => (int) $purchase->id,
            'cartoon_id' => $cartoon?->id,
            'concern_warehouse_id' => $concernWarehouseId,
            'raised_by' => (int) $user->id,
            'title' => trim((string) $validated['title']),
            'description' => isset($validated['description']) ? trim((string) $validated['description']) : null,
            'status' => 'open',
        ]);

        $issue->load([
            'purchase:id,po_number',
            'cartoon:id,cartoon_number',
            'warehouse:id,name',
            'raisedByUser:id,name',
        ]);

        return response()->json($this->formatIssue($issue), 201);
    }
}
