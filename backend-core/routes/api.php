<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartamentoController;

/*
|--------------------------------------------------------------------------
| API Routes - Plataforma Electoral Colombia
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Plataforma Electoral Colombia - Backend Core API',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Autenticación (público)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

/*
|--------------------------------------------------------------------------
| Rutas protegidas (requieren autenticación)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Estructura Electoral
    Route::prefix('electoral')->group(function () {
        // Departamentos
        Route::get('/departamentos', [DepartamentoController::class, 'index']);
        Route::get('/departamentos/{id}', [DepartamentoController::class, 'show']);
        Route::get('/departamentos/{id}/municipios', [DepartamentoController::class, 'municipios']);
        Route::get('/departamentos/{id}/estadisticas', [DepartamentoController::class, 'estadisticas']);
    });
});
