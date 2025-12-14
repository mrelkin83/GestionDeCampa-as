<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Plataforma Electoral Colombia
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'service' => 'Backend Core API',
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0.0',
        ]);
    });

    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login']);
        Route::post('/register', [\App\Http\Controllers\Api\V1\AuthController::class, 'register']);
        Route::post('/logout', [\App\Http\Controllers\Api\V1\AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('/me', [\App\Http\Controllers\Api\V1\AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {

        // Campaigns
        Route::apiResource('campaigns', \App\Http\Controllers\Api\V1\CampaignController::class);

        // Electoral structure
        Route::prefix('electoral')->group(function () {
            Route::apiResource('departamentos', \App\Http\Controllers\Api\V1\Electoral\DepartamentoController::class);
            Route::apiResource('municipios', \App\Http\Controllers\Api\V1\Electoral\MunicipioController::class);
            Route::apiResource('circunscripciones', \App\Http\Controllers\Api\V1\Electoral\CircunscripcionController::class);
            Route::apiResource('zonas', \App\Http\Controllers\Api\V1\Electoral\ZonaController::class);
            Route::apiResource('puestos', \App\Http\Controllers\Api\V1\Electoral\PuestoController::class);
            Route::apiResource('mesas', \App\Http\Controllers\Api\V1\Electoral\MesaController::class);
        });

        // CRM
        Route::prefix('crm')->group(function () {
            Route::apiResource('votantes', \App\Http\Controllers\Api\V1\Crm\VotanteController::class);
            Route::apiResource('segmentos', \App\Http\Controllers\Api\V1\Crm\SegmentoController::class);
            Route::apiResource('eventos', \App\Http\Controllers\Api\V1\Crm\EventoController::class);
        });

        // Communications
        Route::prefix('communications')->group(function () {
            Route::apiResource('campaigns', \App\Http\Controllers\Api\V1\Communication\CampaignController::class);
            Route::post('send-sms', [\App\Http\Controllers\Api\V1\Communication\SmsController::class, 'send']);
            Route::post('send-email', [\App\Http\Controllers\Api\V1\Communication\EmailController::class, 'send']);
        });

        // Usuarios y roles
        Route::apiResource('users', \App\Http\Controllers\Api\V1\UserController::class);
        Route::apiResource('roles', \App\Http\Controllers\Api\V1\RoleController::class);
    });
});
