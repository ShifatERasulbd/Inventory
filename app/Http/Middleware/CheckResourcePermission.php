<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckResourcePermission
{
    /**
     * Map an HTTP method to a CRUD action.
     */
    private function actionForMethod(string $method): string
    {
        return match (strtoupper($method)) {
            'POST'          => 'create',
            'PUT', 'PATCH'  => 'update',
            'DELETE'        => 'delete',
            default         => 'read',   // GET, HEAD, OPTIONS
        };
    }

    /**
     * Handle an incoming request.
     *
     * Usage in routes:  ->middleware('resource.permission:countries')
     *
     * @param  string  $resource  e.g. "countries"
     */
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $action     = $this->actionForMethod($request->method());
        $permission = "{$action}-{$resource}";

        if (! $user->hasPermission($permission)) {
            return response()->json([
                'message'    => 'You do not have permission to perform this action.',
                'permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}
