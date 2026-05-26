<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $search = trim((string) ($validated['search'] ?? ''));
        $perPage = (int) ($validated['per_page'] ?? 25);

        $query = Activity::query()
            ->with([
                'causer:id,name,email',
                'subject',
            ])
            ->latest();

        if ($search !== '') {
            $query->where(function ($innerQuery) use ($search) {
                $innerQuery
                    ->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('causer_type', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate($perPage);

        $logs->getCollection()->transform(function (Activity $activity) {
            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'causer_type' => $activity->causer_type,
                'causer_id' => $activity->causer_id,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name ?? null,
                    'email' => $activity->causer->email ?? null,
                ] : null,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at,
                'updated_at' => $activity->updated_at,
            ];
        });

        return response()->json($logs);
    }
}
