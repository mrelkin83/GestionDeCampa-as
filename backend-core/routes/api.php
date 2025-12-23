<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartamentoController;
use App\Http\Controllers\Api\MunicipioController;
use App\Http\Controllers\Api\PuestoVotacionController;
use App\Http\Controllers\Api\CampanaController;
use App\Http\Controllers\Api\VotanteController;

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

        // Municipios
        Route::get('/municipios', [MunicipioController::class, 'index']);
        Route::get('/municipios/{id}', [MunicipioController::class, 'show']);
        Route::get('/municipios/{id}/puestos', [MunicipioController::class, 'puestos']);
        Route::get('/municipios/{id}/estadisticas', [MunicipioController::class, 'estadisticas']);

        // Puestos de Votación
        Route::get('/puestos', [PuestoVotacionController::class, 'index']);
        Route::get('/puestos/{id}', [PuestoVotacionController::class, 'show']);
        Route::get('/puestos/cercanos', [PuestoVotacionController::class, 'cercanos']);
        Route::get('/puestos/{id}/estadisticas', [PuestoVotacionController::class, 'estadisticas']);
    });

    // Campañas
    Route::prefix('campanas')->group(function () {
        Route::get('/', [CampanaController::class, 'index']);
        Route::post('/', [CampanaController::class, 'store']);
        Route::get('/{id}', [CampanaController::class, 'show']);
        Route::put('/{id}', [CampanaController::class, 'update']);
        Route::get('/{id}/estadisticas', [CampanaController::class, 'estadisticas']);
    });

    // CRM - Votantes
    Route::prefix('crm/votantes')->group(function () {
        Route::get('/', [VotanteController::class, 'index']);
        Route::post('/', [VotanteController::class, 'store']);
        Route::get('/estadisticas', [VotanteController::class, 'estadisticas']);
        Route::get('/{id}', [VotanteController::class, 'show']);
        Route::put('/{id}', [VotanteController::class, 'update']);
        Route::post('/{id}/contacto', [VotanteController::class, 'registrarContacto']);
    });
});
