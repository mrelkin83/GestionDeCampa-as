<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        // Verificar si el usuario tiene alguno de los roles especificados
        if (!in_array($user->role->name, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes el rol necesario para acceder a este recurso',
                'required_roles' => $roles,
                'current_role' => $user->role->name,
            ], 403);
        }

        return $next($request);
    }
}
