<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole('super-admin')) {
            abort(403, 'Forbidden');
        }

        activity('super-admin-access')
            ->causedBy($user)
            ->event('access')
            ->withProperties([
                'method' => $request->method(),
                'path' => $request->path(),
                'ip' => $request->ip(),
            ])
            ->log('Super admin route accessed');

        return $next($request);
    }
}
