<?php

namespace App\Http\Traits;

/**
 * Trait for resolving warehouse IDs accessible to a user.
 * Ensures users have at least their default warehouse_id if no explicit warehouse_ids are set.
 */
trait ResolvesWarehouseIds
{
    /**
     * Resolve warehouse IDs accessible to a user.
     *
     * Returns:
     * - null if user is a super-admin (no restrictions)
     * - array of warehouse IDs otherwise (includes default warehouse_id if warehouse_ids is empty)
     */
    protected function resolveWarehouseIds($user): ?array
    {
        if ($user->hasRole('super-admin')) {
            return null; // no restriction
        }

        $ids = is_array($user->warehouse_ids)
            ? array_values(array_unique(array_filter(array_map('intval', $user->warehouse_ids), fn (int $id) => $id > 0)))
            : [];

        // If user has no explicit warehouse_ids but has a default warehouse, include it
        if (empty($ids) && ! empty($user->warehouse_id)) {
            $ids = [(int) $user->warehouse_id];
        }

        return $ids;
    }
}
