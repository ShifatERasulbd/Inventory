<?php

namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Every remote order store menu (1971co/Viveren/Joor/Amazon) shares RemoteOrderController and
 * BookingController, filtered by the order's `order_from` value - so permission checks can't be
 * a single route middleware and instead map order_from -> its own permission category here.
 */
trait AuthorizesOrderCategory
{
    private const ORDER_FROM_CATEGORIES = [
        '1971co' => '1971co-orders',
        'website' => 'viveren-orders',
        'joor' => 'joor-orders',
        'amazon' => 'amazon-orders',
    ];

    private function categoryForOrderFrom(?string $orderFrom): ?string
    {
        return self::ORDER_FROM_CATEGORIES[$orderFrom] ?? null;
    }

    /**
     * Require permission for the given action. Pass $orderFrom to check a single store's
     * category, or null to allow if the user has that action on ANY store category (used for
     * endpoints that aggregate across stores, e.g. sync).
     */
    private function authorizeOrderAction(Request $request, string $action, ?string $orderFrom): ?JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $category = $this->categoryForOrderFrom($orderFrom);
        $categoriesToCheck = $category ? [$category] : array_values(self::ORDER_FROM_CATEGORIES);

        foreach ($categoriesToCheck as $checkCategory) {
            if ($user->hasPermission("{$action}-{$checkCategory}")) {
                return null;
            }
        }

        return response()->json([
            'message' => 'You do not have permission to perform this action.',
            'permission' => "{$action}-" . ($category ?? 'orders'),
        ], 403);
    }
}
