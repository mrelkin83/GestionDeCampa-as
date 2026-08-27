<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCampanaAccess
{
    /**
     * Handle an incoming request.
     *
     * Verifica que el usuario tenga acceso a la campaña especificada
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        // Super admin tiene acceso a todas las campañas
        if ($user->role->name === 'super_admin') {
            return $next($request);
        }

        // Obtener campaña_id del request
        $campanaId = $request->route('campana_id')
            ?? $request->input('campana_id')
            ?? $request->query('campana_id');

        if (!$campanaId) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar campana_id',
            ], 400);
        }

        // Verificar acceso
        if (!$user->hasAccessToCampana($campanaId)) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes acceso a esta campaña',
            ], 403);
        }

        return $next($request);
    }
}
