<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * User::is_active solo se verificaba en el login (AuthController::login).
 * Un token Sanctum emitido antes de desactivar la cuenta seguia siendo
 * valido indefinidamente: desactivar a un usuario (ej. tras salir del
 * equipo de campaña) no le revocaba el acceso a la API mientras conservara
 * su token. Se revoca aqui, en cada peticion autenticada.
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            $user->currentAccessToken()?->delete();

            return response()->json([
                'success' => false,
                'message' => 'Usuario inactivo. Contacte al administrador.',
            ], 403);
        }

        return $next($request);
    }
}
