<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Requerido por el middleware `throttle:api` (activado globalmente
        // vía $middleware->throttleApi() en bootstrap/app.php). Sin este
        // limiter registrado, CUALQUIER petición al API responde con
        // "Rate limiter [api] is not defined" -- confirmado con evidencia
        // real ejecutando el test suite contra Postgres.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
