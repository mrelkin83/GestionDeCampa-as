<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->throttleApi();

        // Sin esto, Authenticate::redirectTo() intenta route('login') para
        // peticiones sin "Accept: application/json" -no existe ninguna
        // ruta 'login' en esta API- y explota con RouteNotFoundException
        // (500 con stack trace) antes de que AuthenticationException
        // llegue a construirse. Forzar "nunca redirigir" es lo correcto en
        // una API pura sin vistas de login por sesión.
        $middleware->redirectGuestsTo(fn () => null);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'campana.access' => \App\Http\Middleware\CheckCampanaAccess::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // API pura, sin login de sesión web: por defecto, Laravel intenta
        // redirigir las peticiones no autenticadas que no llevan
        // "Accept: application/json" a una ruta con name('login') -que no
        // existe aquí- y eso revienta con RouteNotFoundException (500 con
        // stack trace filtrado en vez de un 401 limpio). Confirmado en vivo
        // con curl sin ese header. Forzar siempre JSON para 401.
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        });
    })->create();
