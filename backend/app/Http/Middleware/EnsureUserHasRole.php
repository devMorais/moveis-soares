<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$papeis): Response
    {
        if (! in_array($request->user()?->role, $papeis, true)) {
            throw new AuthorizationException('Você não tem permissão para acessar este recurso.');
        }

        return $next($request);
    }
}
