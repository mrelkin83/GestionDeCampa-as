<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartamentoController;
use App\Http\Controllers\Api\MunicipioController;
use App\Http\Controllers\Api\PuestoVotacionController;
use App\Http\Controllers\Api\CampanaController;
use App\Http\Controllers\Api\VotanteController;
use App\Http\Controllers\Api\EventoController;
use App\Http\Controllers\Api\DonacionController;
use App\Http\Controllers\Api\DonanteController;
use App\Http\Controllers\Api\ComunicacionController;
use App\Http\Controllers\Api\GastoController;
use App\Http\Controllers\Api\SegmentoController;

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

    // CRM - Segmentos
    Route::prefix('crm/segmentos')->group(function () {
        Route::get('/', [SegmentoController::class, 'index']);
        Route::post('/', [SegmentoController::class, 'store']);
        Route::get('/{id}', [SegmentoController::class, 'show']);
        Route::put('/{id}', [SegmentoController::class, 'update']);
        Route::delete('/{id}', [SegmentoController::class, 'destroy']);
        Route::post('/{id}/agregar-votantes', [SegmentoController::class, 'agregarVotantes']);
        Route::post('/{id}/remover-votantes', [SegmentoController::class, 'removerVotantes']);
        Route::post('/{id}/recalcular', [SegmentoController::class, 'recalcular']);
    });

    // Eventos
    Route::prefix('eventos')->group(function () {
        Route::get('/', [EventoController::class, 'index']);
        Route::post('/', [EventoController::class, 'store']);
        Route::get('/{id}', [EventoController::class, 'show']);
        Route::put('/{id}', [EventoController::class, 'update']);
        Route::post('/{id}/confirmar-asistencia', [EventoController::class, 'confirmarAsistencia']);
        Route::post('/checkin/{qrToken}', [EventoController::class, 'checkin']);
        Route::get('/{id}/estadisticas', [EventoController::class, 'estadisticas']);
    });

    // Donantes
    Route::prefix('donantes')->group(function () {
        Route::get('/', [DonanteController::class, 'index']);
        Route::post('/', [DonanteController::class, 'store']);
        Route::get('/{id}', [DonanteController::class, 'show']);
        Route::put('/{id}', [DonanteController::class, 'update']);
        Route::post('/{id}/marcar-invalido', [DonanteController::class, 'marcarInvalido']);
        Route::get('/{id}/historial', [DonanteController::class, 'historialDonaciones']);
    });

    // Donaciones
    Route::prefix('donaciones')->group(function () {
        Route::get('/', [DonacionController::class, 'index']);
        Route::post('/', [DonacionController::class, 'store']);
        Route::get('/estadisticas', [DonacionController::class, 'estadisticas']);
        Route::get('/{id}', [DonacionController::class, 'show']);
        Route::post('/{id}/confirmar', [DonacionController::class, 'confirmar']);
        Route::post('/{id}/rechazar', [DonacionController::class, 'rechazar']);
        Route::post('/{id}/reportar-cne', [DonacionController::class, 'reportarCNE']);
    });

    // Comunicación
    Route::prefix('comunicacion')->group(function () {
        // Templates
        Route::get('/templates', [ComunicacionController::class, 'indexTemplates']);
        Route::post('/templates', [ComunicacionController::class, 'storeTemplate']);
        Route::put('/templates/{id}', [ComunicacionController::class, 'updateTemplate']);

        // Campañas de comunicación
        Route::get('/campanas', [ComunicacionController::class, 'indexCampanas']);
        Route::post('/campanas', [ComunicacionController::class, 'storeCampana']);
        Route::post('/campanas/{id}/enviar', [ComunicacionController::class, 'enviarCampana']);
        Route::get('/campanas/{id}/estadisticas', [ComunicacionController::class, 'estadisticasCampana']);

        // Mensajes individuales
        Route::post('/mensajes/individual', [ComunicacionController::class, 'enviarMensajeIndividual']);
    });

    // Gastos
    Route::prefix('gastos')->group(function () {
        Route::get('/', [GastoController::class, 'index']);
        Route::post('/', [GastoController::class, 'store']);
        Route::get('/estadisticas', [GastoController::class, 'estadisticas']);
        Route::get('/{id}', [GastoController::class, 'show']);
        Route::put('/{id}', [GastoController::class, 'update']);
        Route::post('/{id}/aprobar', [GastoController::class, 'aprobar']);
        Route::post('/{id}/rechazar', [GastoController::class, 'rechazar']);
        Route::post('/{id}/reportar-cne', [GastoController::class, 'reportarCNE']);
    });
});
