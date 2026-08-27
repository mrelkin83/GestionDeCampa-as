<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evento;
use App\Models\EventoAsistencia;
use App\Models\Votante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EventoController extends Controller
{
    /**
     * Listar eventos de una campaña
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $campanaId = $request->get('campana_id');

        if (!$campanaId) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar campana_id',
            ], 400);
        }

        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campanaId)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $query = Evento::with(['municipio', 'coordinador'])
            ->where('campana_id', $campanaId);

        // Filtros
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('proximos')) {
            $query->proximos();
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_inicio');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $eventos = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $eventos->items(),
            'pagination' => [
                'total' => $eventos->total(),
                'per_page' => $eventos->perPage(),
                'current_page' => $eventos->currentPage(),
                'last_page' => $eventos->lastPage(),
            ],
        ], 200);
    }

    /**
     * Crear nuevo evento
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'nombre' => 'required|string|max:200',
            'tipo' => 'required|in:mitin,reunion,puerta_puerta,capacitacion,movilizacion,otro',
            'fecha_inicio' => 'required|date',
            'ubicacion_nombre' => 'nullable|string|max:200',
            'direccion' => 'nullable|string|max:255',
            'municipio_id' => 'nullable|exists:municipios,id',
            'capacidad_maxima' => 'nullable|integer|min:1',
            'meta_asistentes' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $evento = Evento::create(array_merge($request->all(), [
            'created_by_id' => $request->user()->id,
            'estado' => 'planificado',
        ]));

        $evento->load(['municipio', 'coordinador']);

        return response()->json([
            'success' => true,
            'message' => 'Evento creado exitosamente',
            'data' => $evento,
        ], 201);
    }

    /**
     * Ver evento específico
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $evento = Evento::with([
            'municipio.departamento',
            'zonaElectoral',
            'coordinador',
            'asistencias' => function($q) {
                $q->with('votante')->latest();
            }
        ])->find($id);

        if (!$evento) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($evento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este evento',
            ], 403);
        }

        // Agregar estadísticas
        $evento->estadisticas = [
            'total_confirmados' => $evento->total_confirmados,
            'total_asistentes' => $evento->total_asistentes,
            'tasa_asistencia' => $evento->total_confirmados > 0
                ? round(($evento->total_asistentes / $evento->total_confirmados) * 100, 2)
                : 0,
            'porcentaje_meta' => $evento->meta_asistentes > 0
                ? round(($evento->total_asistentes / $evento->meta_asistentes) * 100, 2)
                : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $evento,
        ], 200);
    }

    /**
     * Actualizar evento
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $evento = Evento::find($id);

        if (!$evento) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($evento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este evento',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:200',
            'descripcion' => 'nullable|string',
            'tipo' => 'sometimes|string|max:50',
            'estado' => 'sometimes|in:planificado,confirmado,en_curso,finalizado,cancelado,pospuesto',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'nullable|date',
            'ubicacion_nombre' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'capacidad_maxima' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Solo campos validados arriba -pasar $request->all() permitía
        // reescribir campana_id/coordinador_id/costo_real/qr_code_token/
        // total_confirmados/etc. (todos fillable), incluyendo el token QR
        // que verifica asistencia real al evento.
        $evento->update($validator->validated());
        $evento->load(['municipio', 'coordinador']);

        return response()->json([
            'success' => true,
            'message' => 'Evento actualizado exitosamente',
            'data' => $evento,
        ], 200);
    }

    /**
     * Confirmar asistencia a evento
     */
    public function confirmarAsistencia(Request $request, int $id): JsonResponse
    {
        $evento = Evento::find($id);

        if (!$evento) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($evento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este evento',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'votante_id' => 'required|exists:votantes,id',
            'medio_confirmacion' => 'nullable|in:app,sms,llamada,presencial,otro',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verificar si ya está confirmado
        $existe = EventoAsistencia::where('evento_id', $id)
            ->where('votante_id', $request->votante_id)
            ->first();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'El votante ya tiene confirmación para este evento',
            ], 409);
        }

        $asistencia = EventoAsistencia::create([
            'evento_id' => $id,
            'votante_id' => $request->votante_id,
            'confirmado' => true,
            'fecha_confirmacion' => now(),
            'medio_confirmacion' => $request->medio_confirmacion ?? 'app',
        ]);

        // Actualizar contador
        $evento->increment('total_confirmados');

        return response()->json([
            'success' => true,
            'message' => 'Asistencia confirmada exitosamente',
            'data' => $asistencia->load('votante'),
        ], 201);
    }

    /**
     * Check-in con QR
     */
    public function checkin(Request $request, string $qrToken): JsonResponse
    {
        $evento = Evento::where('qr_code_token', $qrToken)->first();

        if (!$evento) {
            return response()->json([
                'success' => false,
                'message' => 'Código QR inválido',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'votante_id' => 'required|exists:votantes,id',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $asistencia = EventoAsistencia::firstOrCreate(
            [
                'evento_id' => $evento->id,
                'votante_id' => $request->votante_id,
            ],
            [
                'confirmado' => true,
                'fecha_confirmacion' => now(),
                'medio_confirmacion' => 'app',
            ]
        );

        // Registrar check-in
        $asistencia->update([
            'asistio' => true,
            'fecha_checkin' => now(),
            'metodo_checkin' => 'qr',
            'registrado_por_id' => $request->user()->id,
            'checkin_latitud' => $request->latitud,
            'checkin_longitud' => $request->longitud,
        ]);

        // Actualizar contadores del evento
        if (!$asistencia->wasRecentlyCreated && !$asistencia->getOriginal('confirmado')) {
            $evento->increment('total_confirmados');
        }
        $evento->increment('total_asistentes');

        return response()->json([
            'success' => true,
            'message' => 'Check-in registrado exitosamente',
            'data' => [
                'evento' => $evento->nombre,
                'votante' => $asistencia->votante->nombre_completo,
                'hora_checkin' => $asistencia->fecha_checkin,
            ],
        ], 200);
    }

    /**
     * Estadísticas del evento
     */
    public function estadisticas(Request $request, int $id): JsonResponse
    {
        $evento = Evento::find($id);

        if (!$evento) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($evento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este evento',
            ], 403);
        }

        $stats = [
            'evento' => $evento->nombre,
            'fecha' => $evento->fecha_inicio,
            'estado' => $evento->estado,
            'asistencia' => [
                'confirmados' => $evento->total_confirmados,
                'asistentes' => $evento->total_asistentes,
                'ausentes' => $evento->total_ausentes,
                'tasa_asistencia' => $evento->total_confirmados > 0
                    ? round(($evento->total_asistentes / $evento->total_confirmados) * 100, 2)
                    : 0,
            ],
            'meta' => [
                'objetivo' => $evento->meta_asistentes,
                'alcanzado' => $evento->total_asistentes,
                'porcentaje' => $evento->meta_asistentes > 0
                    ? round(($evento->total_asistentes / $evento->meta_asistentes) * 100, 2)
                    : 0,
            ],
            'costos' => [
                'presupuesto' => $evento->presupuesto_estimado,
                'real' => $evento->costo_real,
                'diferencia' => $evento->presupuesto_estimado - $evento->costo_real,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }

    /**
     * Listado detallado de asistencias de un evento (con datos del votante).
     * Antes no existía este endpoint: la vista de detalle del evento en el
     * frontend siempre mostraba la tabla de asistentes vacía, aunque sí
     * existieran registros reales en eventos_asistencia.
     */
    public function asistencias(Request $request, int $id): JsonResponse
    {
        $evento = Evento::find($id);

        if (!$evento) {
            return response()->json([
                'success' => false,
                'message' => 'Evento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($evento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este evento',
            ], 403);
        }

        $asistencias = $evento->asistencias()
            ->with('votante:id,documento,primer_nombre,primer_apellido,celular')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $asistencias,
        ], 200);
    }
}
