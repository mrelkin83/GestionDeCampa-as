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
use App\Http\Controllers\Api\PrecountController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\AnalyticsController;

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
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
});

/*
|--------------------------------------------------------------------------
| Rutas protegidas (requieren autenticación)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'active'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        // Registrar nuevo usuario: solo super_admin puede crear cuentas y asignar roles
        Route::post('/register', [AuthController::class, 'register'])->middleware('role:super_admin');
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'changePassword']);
    });

    // Roles (para el selector al crear usuarios)
    Route::get('/roles', [RoleController::class, 'index'])->middleware('role:super_admin');

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
        // /cercanos debe ir antes de /{id}: si no, Laravel matchea la ruta
        // comodín primero y "cercanos" llega a show() como si fuera un id,
        // lo que rompía este endpoint siempre (TypeError: string a int).
        Route::get('/puestos/cercanos', [PuestoVotacionController::class, 'cercanos']);
        Route::get('/puestos/{id}', [PuestoVotacionController::class, 'show']);
        Route::get('/puestos/{id}/estadisticas', [PuestoVotacionController::class, 'estadisticas']);
    });

    // Campañas
    Route::prefix('campanas')->group(function () {
        Route::get('/', [CampanaController::class, 'index']);
        // store() asigna al creador como admin_campana de la nueva campaña
        // -sin esto, cualquier usuario autenticado (incluido un 'testigo',
        // el rol de menor privilegio) podía crear una campaña propia y
        // auto-nombrarse su admin, igual que register()/'/roles' ya
        // restringen a super_admin. Sin uso real desde el frontend (no
        // existe ningún formulario de creación de Campana en frontend-web).
        Route::post('/', [CampanaController::class, 'store'])->middleware('role:super_admin');
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
        Route::get('/{id}/contactos', [VotanteController::class, 'listarContactos']);
    });

    // CRM - Segmentos
    Route::prefix('crm/segmentos')->group(function () {
        Route::get('/', [SegmentoController::class, 'index']);
        Route::post('/', [SegmentoController::class, 'store']);
        Route::get('/{id}', [SegmentoController::class, 'show']);
        Route::get('/{id}/votantes', [SegmentoController::class, 'getVotantes']);
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
        Route::get('/{id}/asistencias', [EventoController::class, 'asistencias']);
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
        Route::post('/{id}/confirmar', [DonacionController::class, 'confirmar'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/{id}/rechazar', [DonacionController::class, 'rechazar'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/{id}/reportar-cne', [DonacionController::class, 'reportarCNE'])
            ->middleware('role:admin_campana,super_admin');
    });

    // Comunicación
    Route::prefix('comunicacion')->group(function () {
        // Templates
        Route::get('/templates', [ComunicacionController::class, 'indexTemplates']);
        Route::post('/templates', [ComunicacionController::class, 'storeTemplate']);
        Route::get('/templates/{id}', [ComunicacionController::class, 'showTemplate']);
        Route::put('/templates/{id}', [ComunicacionController::class, 'updateTemplate']);
        Route::delete('/templates/{id}', [ComunicacionController::class, 'destroyTemplate']);
        Route::get('/templates/{id}/preview/{votanteId}', [ComunicacionController::class, 'previewTemplate']);

        // Campañas de comunicación
        Route::get('/campanas', [ComunicacionController::class, 'indexCampanas']);
        Route::post('/campanas', [ComunicacionController::class, 'storeCampana']);
        Route::get('/campanas/{id}', [ComunicacionController::class, 'showCampana']);
        Route::put('/campanas/{id}', [ComunicacionController::class, 'updateCampana']);
        Route::delete('/campanas/{id}', [ComunicacionController::class, 'destroyCampana']);
        Route::post('/campanas/{id}/enviar', [ComunicacionController::class, 'enviarCampana'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/campanas/{id}/programar', [ComunicacionController::class, 'programarCampana'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/campanas/{id}/cancelar', [ComunicacionController::class, 'cancelarCampana'])
            ->middleware('role:admin_campana,super_admin');
        Route::get('/campanas/{id}/estadisticas', [ComunicacionController::class, 'estadisticasCampana']);

        // Mensajes individuales
        Route::get('/mensajes', [ComunicacionController::class, 'indexMensajes']);
        Route::get('/mensajes/{id}', [ComunicacionController::class, 'showMensaje']);
        Route::post('/mensajes/individual', [ComunicacionController::class, 'enviarMensajeIndividual']);
        Route::post('/mensajes/{id}/reenviar', [ComunicacionController::class, 'reenviarMensaje']);
    });

    // Gastos
    Route::prefix('gastos')->group(function () {
        Route::get('/', [GastoController::class, 'index']);
        Route::post('/', [GastoController::class, 'store']);
        Route::get('/estadisticas', [GastoController::class, 'estadisticas']);
        Route::get('/{id}', [GastoController::class, 'show']);
        Route::put('/{id}', [GastoController::class, 'update']);
        Route::post('/{id}/aprobar', [GastoController::class, 'aprobar'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/{id}/rechazar', [GastoController::class, 'rechazar'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/{id}/pagar', [GastoController::class, 'pagar'])
            ->middleware('role:admin_campana,super_admin');
        Route::post('/{id}/reportar-cne', [GastoController::class, 'reportarCNE'])
            ->middleware('role:admin_campana,super_admin');
    });

    Route::prefix('analytics')->group(function () {
        Route::get('/general', [AnalyticsController::class, 'general']);
        Route::get('/votantes', [AnalyticsController::class, 'votantes']);
        Route::get('/financiero', [AnalyticsController::class, 'financiero']);
        Route::get('/comunicacion', [AnalyticsController::class, 'comunicacion']);
        Route::get('/eventos', [AnalyticsController::class, 'eventos']);
    });

    Route::prefix('reportes')->group(function () {
        Route::get('/', [ReporteController::class, 'index']);
        Route::post('/generar', [ReporteController::class, 'generar']);
        Route::get('/{id}/descargar', [ReporteController::class, 'descargar']);
        Route::delete('/{id}', [ReporteController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Preconteo Electoral (Día D) - Endpoints Internos
    |--------------------------------------------------------------------------
    | Captura y gestión de actas (requiere autenticación)
    */
    Route::prefix('internal/preconteo')->group(function () {
        Route::post('/acta', [PrecountController::class, 'storeActa']);
        Route::get('/actas', [PrecountController::class, 'listarActas']);
        // Validar/observar un acta es una acción de coordinador, no del testigo que la reportó
        Route::post('/acta/{id}/validar', [PrecountController::class, 'validarActa'])
            ->middleware('role:coordinador,admin_campana,super_admin');
    });
});

/*
|--------------------------------------------------------------------------
| Preconteo Electoral (Día D) - Endpoints Públicos
|--------------------------------------------------------------------------
| Consulta de catálogos, resultados y progreso (no requiere auth: son datos
| de transparencia electoral en tiempo real). Estaban anidados por error
| dentro del grupo auth:sanctum, lo que los hacía inaccesibles a testigos
| aún no autenticados y a las apps móviles/PWA que los consumen sin token.
*/
Route::prefix('preconteo')->group(function () {
    Route::get('/elecciones', [PrecountController::class, 'getElecciones']);
    Route::get('/elecciones/{id}/cargos', [PrecountController::class, 'getCargosByEleccion']);
    Route::get('/candidatos', [PrecountController::class, 'getCandidatosByCargo']);
    Route::get('/resultados', [PrecountController::class, 'getResultados']);
    Route::get('/progreso', [PrecountController::class, 'getProgreso']);
    Route::get('/alertas', [PrecountController::class, 'getAlertas']);
});

/*
|--------------------------------------------------------------------------
| Webhooks (No auth required)
|--------------------------------------------------------------------------
| Routes para webhooks de servicios externos (Twilio, AWS SES, WhatsApp)
*/

use App\Http\Controllers\Api\WebhookController;

// Twilio SMS Webhook
Route::post('/webhooks/twilio/sms', [WebhookController::class, 'twilioSMS']);

// AWS SES Webhooks
Route::post('/webhooks/ses/events', [WebhookController::class, 'sesEvents']);

// WhatsApp Business API Webhooks
Route::match(['get', 'post'], '/webhooks/whatsapp/events', [WebhookController::class, 'whatsappEvents']);
