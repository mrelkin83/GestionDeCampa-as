<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        // Super admin tiene todos los permisos
        if ($user->role->name === 'super_admin') {
            return $next($request);
        }

        // Verificar si el usuario tiene el permiso
        if (!$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para realizar esta acción',
                'required_permission' => $permission,
            ], 403);
        }

        return $next($request);
    }
}
