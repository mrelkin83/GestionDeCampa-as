<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\PrecountEvidence;
use App\Models\PrecountMetadata;
use App\Models\PrecountValidation;
use App\Models\PrecountAggregate;
use App\Models\MesaCargoStatus;
use App\Services\AgregadosService;
use App\Jobs\RecalcularAgregadosJob;
use App\Jobs\ProcesarImagenActaJob;
use App\Jobs\NotificarAlertaCriticaJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

/**
 * PrecountController
 * 
 * Controlador para el sistema de preconteo electoral.
 * Endpoints públicos para consulta de resultados y endpoints internos para captura.
 */
class PrecountController extends Controller
{
    protected AgregadosService $agregadosService;

    public function __construct(AgregadosService $agregadosService)
    {
        $this->agregadosService = $agregadosService;
    }

    /**
     * GET /api/preconteo/elecciones
     * 
     * Listar elecciones disponibles para preconteo
     */
    public function getElecciones()
    {
        try {
            // Por ahora retornar elecciones hardcodeadas o desde tabla elections
            $elecciones = DB::table('elections')
                ->where('activa', true)
                ->orderBy('fecha', 'desc')
                ->get()
                ->map(function ($eleccion) {
                    return [
                        'id' => $eleccion->id,
                        'year' => $eleccion->year,
                        'tipo' => $eleccion->tipo,
                        'fecha' => $eleccion->fecha,
                        'nombre' => $eleccion->nombre
                    ];
                });

            // Datos de ejemplo SOLO fuera de producción: en un sistema de
            // resultados electorales en vivo, devolver una elección falsa
            // cuando la BD está vacía es un riesgo real (un cliente podría
            // mostrarla como si fuera real). 'is_example_data' deja al
            // consumidor decidir si la muestra o prefiere un estado vacío.
            $isExampleData = false;
            if ($elecciones->isEmpty() && !app()->environment('production')) {
                $isExampleData = true;
                $elecciones = collect([
                    [
                        'id' => 1,
                        'year' => 2027,
                        'tipo' => 'territorial',
                        'fecha' => '2027-10-24',
                        'nombre' => 'Elecciones Territoriales 2027 (ejemplo)'
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'is_example_data' => $isExampleData,
                'data' => $elecciones
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo elecciones', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener elecciones'
            ], 500);
        }
    }

    /**
     * GET /api/preconteo/elecciones/{id}/cargos
     * 
     * Obtener cargos por elección
     */
    public function getCargosByEleccion($eleccionId)
    {
        try {
            if (!DB::table('elections')->where('id', $eleccionId)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Elección no encontrada',
                ], 404);
            }

            $cargos = DB::table('election_positions')
                ->where('election_id', $eleccionId)
                ->orderBy('nivel')
                ->orderBy('nombre')
                ->get()
                ->map(function ($cargo) {
                    return [
                        'id' => $cargo->id,
                        'tipo' => $cargo->tipo,
                        'nombre' => $cargo->nombre,
                        'nivel' => $cargo->nivel
                    ];
                });

            // Datos de ejemplo solo fuera de producción (ver getElecciones)
            $isExampleData = false;
            if ($cargos->isEmpty() && !app()->environment('production')) {
                $isExampleData = true;
                $cargos = collect([
                    ['id' => 1, 'tipo' => 'alcaldia', 'nombre' => 'Alcaldía (ejemplo)', 'nivel' => 'municipal'],
                    ['id' => 2, 'tipo' => 'concejo', 'nombre' => 'Concejo Municipal (ejemplo)', 'nivel' => 'municipal'],
                    ['id' => 3, 'tipo' => 'gobernacion', 'nombre' => 'Gobernación (ejemplo)', 'nivel' => 'departamental'],
                    ['id' => 4, 'tipo' => 'asamblea', 'nombre' => 'Asamblea Departamental (ejemplo)', 'nivel' => 'departamental'],
                ]);
            }

            return response()->json([
                'success' => true,
                'is_example_data' => $isExampleData,
                'data' => $cargos
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo cargos', ['eleccion_id' => $eleccionId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener cargos'
            ], 500);
        }
    }

    /**
     * GET /api/preconteo/candidatos?election_position_id={id}
     *
     * Listar candidatos activos de un cargo electoral
     */
    public function getCandidatosByCargo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_position_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $candidatos = DB::table('candidates')
                ->where('election_position_id', $request->election_position_id)
                ->where('activo', true)
                ->orderBy('numero_tarjeton')
                ->get()
                ->map(function ($candidato) {
                    return [
                        'id' => $candidato->id,
                        'nombre' => $candidato->nombre,
                        'partido_politico' => $candidato->partido_politico,
                        'numero_tarjeton' => $candidato->numero_tarjeton,
                        'foto_url' => $candidato->foto_url,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $candidatos
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo candidatos', [
                'election_position_id' => $request->election_position_id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener candidatos'
            ], 500);
        }
    }

    /**
     * GET /api/preconteo/resultados
     * 
     * Obtener resultados agregados tipo Registraduría
     * Query params: election_position_id, scope_type, scope_id
     */
    public function getResultados(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_position_id' => 'required|integer',
            'scope_type' => 'required|in:MESA,PUESTO,MUNICIPIO,DEPARTAMENTO',
            'scope_id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $resultados = $this->agregadosService->obtenerResultados(
                $request->scope_type,
                $request->scope_id,
                $request->election_position_id
            );

            // Obtener info del scope
            $scopeInfo = $this->obtenerInfoScope($request->scope_type, $request->scope_id, $request->election_position_id);

            return response()->json([
                'success' => true,
                'data' => [
                    'scope' => $request->scope_type,
                    'scope_id' => $request->scope_id,
                    'scope_nombre' => $scopeInfo['nombre'] ?? null,
                    'election_position_id' => $request->election_position_id,
                    'total_votos' => $resultados['total_votos'],
                    'total_mesas' => $scopeInfo['total_mesas'] ?? null,
                    'mesas_reportadas' => $scopeInfo['mesas_reportadas'] ?? null,
                    'porcentaje_avance' => $scopeInfo['porcentaje_avance'] ?? 0,
                    'resultados' => $resultados['resultados'],
                    'ganador' => $resultados['ganador']
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo resultados', [
                'params' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener resultados'
            ], 500);
        }
    }

    /**
     * GET /api/preconteo/progreso
     * 
     * Obtener progreso de reporte por mesas
     */
    public function getProgreso(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_position_id' => 'required|integer',
            'municipality_id' => 'nullable|integer',
            'departamento_id' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cargoId = $request->election_position_id;

            // Query base
            $query = MesaCargoStatus::where('cargo_id', $cargoId);

            // Filtrar por municipio si se especifica
            if ($request->municipality_id) {
                $query->whereHas('mesa.puestoVotacion', function($q) use ($request) {
                    $q->where('municipio_id', $request->municipality_id);
                });
            }

            // Filtrar por departamento si se especifica
            if ($request->departamento_id) {
                $query->whereHas('mesa.puestoVotacion.municipio', function($q) use ($request) {
                    $q->where('departamento_id', $request->departamento_id);
                });
            }

            $total = $query->count();
            $reportadas = (clone $query)->reportadas()->count();
            $observadas = (clone $query)->byEstado('OBSERVADA')->count();
            $validadas = (clone $query)->validadas()->count();
            $pendientes = $total - $reportadas;

            // Actas recibidas en la última hora: proxy honesto de actividad
            // en vivo. Antes el dashboard de Día D mostraba una cifra de
            // "testigos conectados" inventada y fija (245); no hay forma
            // real de contar conexiones de testigos porque las apps de
            // testigos nunca abren WebSocket, solo hacen POST puntual al
            // reportar una acta.
            $actasQuery = PrecountRecord::where('election_position_id', $cargoId)
                ->where('created_at', '>=', now()->subHour());

            if ($request->municipality_id) {
                $actasQuery->whereHas('pollingTable.puestoVotacion', function ($q) use ($request) {
                    $q->where('municipio_id', $request->municipality_id);
                });
            }

            if ($request->departamento_id) {
                $actasQuery->whereHas('pollingTable.puestoVotacion.municipio', function ($q) use ($request) {
                    $q->where('departamento_id', $request->departamento_id);
                });
            }

            $actasUltimaHora = $actasQuery->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'election_position_id' => $cargoId,
                    'total_mesas' => $total,
                    'reportadas' => $reportadas,
                    'observadas' => $observadas,
                    'validadas' => $validadas,
                    'pendientes' => $pendientes,
                    'porcentaje_avance' => $total > 0 ? round(($reportadas / $total) * 100, 2) : 0,
                    'actas_ultima_hora' => $actasUltimaHora,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo progreso', [
                'params' => $request->all(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener progreso'
            ], 500);
        }
    }

    /**
     * GET /api/preconteo/alertas
     *
     * Alertas automáticas (PrecountValidation) no resueltas para un cargo,
     * opcionalmente filtradas por municipio/departamento. Antes el
     * dashboard de Día D (frontend-web) mostraba siempre una alerta de
     * ejemplo hardcodeada porque este endpoint nunca existió.
     */
    public function getAlertas(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'election_position_id' => 'required|integer',
            'municipality_id' => 'nullable|integer',
            'departamento_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $alertas = PrecountValidation::pendientes()
                ->whereHas('record', function ($q) use ($request) {
                    $q->where('election_position_id', $request->election_position_id);

                    if ($request->municipality_id) {
                        $q->whereHas('pollingTable.puestoVotacion', function ($qq) use ($request) {
                            $qq->where('municipio_id', $request->municipality_id);
                        });
                    }

                    if ($request->departamento_id) {
                        $q->whereHas('pollingTable.puestoVotacion.municipio', function ($qq) use ($request) {
                            $qq->where('departamento_id', $request->departamento_id);
                        });
                    }
                })
                ->with('record.pollingTable')
                ->orderByRaw("CASE severidad WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END")
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function (PrecountValidation $alerta) {
                    return [
                        'id' => $alerta->id,
                        'tipo' => $alerta->tipo,
                        'severidad' => $alerta->severidad,
                        'mensaje' => $alerta->mensaje,
                        'mesa_id' => $alerta->record?->polling_table_id,
                        'mesa_numero' => $alerta->record?->pollingTable?->numero,
                        'created_at' => $alerta->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $alertas,
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo alertas', [
                'params' => $request->all(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener alertas',
            ], 500);
        }
    }

    /**
     * POST /api/internal/preconteo/acta
     *
     * Cargar acta de preconteo (requiere autenticación)
     */
    public function storeActa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'polling_table_id' => 'required|integer|exists:mesas,id',
            'election_position_id' => 'required|integer|exists:election_positions,id',
            'total_sufragantes' => 'required|integer|min:0',
            'votos_nulos' => 'required|integer|min:0',
            'votos_no_marcados' => 'required|integer|min:0',
            'resultados' => 'required|array|min:1',
            'resultados.*.candidate_id' => 'required|integer|exists:candidates,id',
            'resultados.*.votos' => 'required|integer|min:0',
            'observaciones' => 'nullable|string|max:1000',
            // Antes solo se aceptaba una imagen (imagen_acta) aunque el testigo
            // podía tomar varias fotos en la app; el resto se descartaba en
            // silencio al sincronizar. PrecountEvidence ya soporta varias filas
            // por acta, así que ahora se acepta un array.
            'imagenes_acta' => 'nullable|array|max:5',
            'imagenes_acta.*' => 'string', // Base64
            'gps' => 'nullable|array',
            'gps.lat' => 'nullable|numeric',
            'gps.lng' => 'nullable|numeric',
            'offline' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // 1. Determinar versión
            $version = PrecountRecord::siguienteVersion(
                $request->polling_table_id,
                $request->election_position_id
            );

            // 2. Crear registro
            $record = PrecountRecord::create([
                'polling_table_id' => $request->polling_table_id,
                'election_position_id' => $request->election_position_id,
                'version' => $version,
                'total_sufragantes' => $request->total_sufragantes,
                'votos_nulos' => $request->votos_nulos,
                'votos_no_marcados' => $request->votos_no_marcados,
                'observaciones' => $request->observaciones,
                'estado' => 'CARGADA'
            ]);

            // 3. Guardar votos por candidato
            foreach ($request->resultados as $resultado) {
                PrecountVote::create([
                    'precount_record_id' => $record->id,
                    'candidate_id' => $resultado['candidate_id'],
                    'votos' => $resultado['votos']
                ]);
            }

            // 4. Guardar evidencias (una fila PrecountEvidence + un job por imagen)
            foreach ($request->imagenes_acta ?? [] as $imagenBase64) {
                if (!$imagenBase64) {
                    continue;
                }

                $hash = hash('sha256', $imagenBase64);

                // Crear registro inicial (sin URL aún)
                $evidence = PrecountEvidence::create([
                    'precount_record_id' => $record->id,
                    'imagen_url' => 'pending', // Se actualizará async
                    'hash_imagen' => $hash,
                    'ocr_text' => null,
                    'legible' => true,
                    'procesado' => false
                ]);

                // Disparar job async para procesar imagen
                ProcesarImagenActaJob::dispatch($evidence->id, $imagenBase64)
                    ->onQueue('imagenes');
            }

            // 5. Guardar metadata
            PrecountMetadata::create([
                'precount_record_id' => $record->id,
                'reportado_por_usuario_id' => auth()->id() ?? 1,
                'rol' => auth()->user()->rol ?? 'testigo',
                'gps_lat' => $request->gps['lat'] ?? null,
                'gps_lng' => $request->gps['lng'] ?? null,
                'dispositivo' => $request->header('User-Agent'),
                'offline' => $request->offline ?? false
            ]);

            // 6. Ejecutar validaciones automáticas
            $alertas = $this->ejecutarValidaciones($record);
            
            // Notificar alertas críticas
            foreach ($alertas as $alerta) {
                if ($alerta->severidad === 'CRITICAL') {
                    NotificarAlertaCriticaJob::dispatch($alerta->id)
                        ->onQueue('notificaciones');
                }
            }

            // 7. Determinar estado final
            $tieneCriticas = collect($alertas)->where('severidad', 'CRITICAL')->where('resuelta', false)->isNotEmpty();
            $estado = $tieneCriticas ? 'OBSERVADA' : 'REPORTADA';

            $record->update(['estado' => $estado]);

            // 8. Actualizar mesa_cargo_status
            MesaCargoStatus::updateOrCreate(
                [
                    'mesa_id' => $request->polling_table_id,
                    'cargo_id' => $request->election_position_id
                ],
                [
                    'estado' => $estado,
                    'precount_record_id' => $record->id,
                    'reportada_at' => now()
                ]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Acta registrada exitosamente',
                'data' => [
                    'record_id' => $record->id,
                    'version' => $version,
                    'estado' => $estado,
                    'alertas' => $alertas
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error registrando acta', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar acta: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /api/internal/preconteo/acta/{id}/validar
     * 
     * Validar acta (coordinador)
     */
    public function validarActa(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'accion' => 'required|in:VALIDAR,OBSERVAR',
            'comentario' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $record = PrecountRecord::findOrFail($id);
            
            $nuevoEstado = $request->accion === 'VALIDAR' ? 'VALIDADA' : 'OBSERVADA';
            $record->estado = $nuevoEstado;
            $record->save();

            // Actualizar mesa_cargo_status
            MesaCargoStatus::where('precount_record_id', $id)
                ->update([
                    'estado' => $nuevoEstado,
                    'validada_at' => $request->accion === 'VALIDAR' ? now() : null
                ]);

            // Si se valida, recalcular agregados (async)
            if ($request->accion === 'VALIDAR') {
                // Disparar job async para recalcular agregados
                RecalcularAgregadosJob::dispatch($record)
                    ->onQueue('agregados')
                    ->delay(now()->addSeconds(2)); // Pequeño delay para permitir commit DB
            }

            return response()->json([
                'success' => true,
                'message' => 'Acta ' . ($request->accion === 'VALIDAR' ? 'validada' : 'marcada como observada'),
                'data' => [
                    'record_id' => $record->id,
                    'estado' => $nuevoEstado
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error validando acta', ['record_id' => $id, 'error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al validar acta'
            ], 500);
        }
    }

    /**
     * GET /api/internal/preconteo/actas
     * 
     * Listar actas con filtros
     */
    public function listarActas(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'estado' => 'nullable|in:CARGADA,OBSERVADA,VALIDADA',
            'municipality_id' => 'nullable|integer',
            'election_position_id' => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // pollingTable.puestoVotacion.municipio: el dashboard de Día D
            // (frontend-web) necesita el nombre del puesto/municipio de cada
            // acta; sin este eager-load esas relaciones nunca llegaban.
            $query = PrecountRecord::with(['votes', 'metadata', 'validations', 'pollingTable.puestoVotacion.municipio']);

            if ($request->estado) {
                $query->byEstado($request->estado);
            }

            if ($request->election_position_id) {
                $query->byCargo($request->election_position_id);
            }

            if ($request->municipality_id) {
                $query->whereHas('pollingTable.puestoVotacion', function($q) use ($request) {
                    $q->where('municipio_id', $request->municipality_id);
                });
            }

            $actas = $query->orderBy('created_at', 'desc')
                ->paginate(50);

            return response()->json([
                'success' => true,
                'data' => $actas
            ]);

        } catch (\Exception $e) {
            Log::error('Error listando actas', ['error' => $e->getMessage()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al listar actas'
            ], 500);
        }
    }

    /**
     * Ejecutar validaciones automáticas sobre un acta
     */
    private function ejecutarValidaciones(PrecountRecord $record): array
    {
        $alertas = [];

        // Validación 1: Suma de votos
        $totalVotos = $record->total_votos;
        
        if ($totalVotos !== $record->total_sufragantes) {
            $alerta = PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'SUMA_INVALIDA',
                'severidad' => 'CRITICAL',
                'mensaje' => "Suma de votos ({$totalVotos}) no coincide con sufragantes ({$record->total_sufragantes})"
            ]);
            $alertas[] = $alerta;
        }

        // Validación 2: Votos superan sufragantes
        if ($record->votos_candidatos > $record->total_sufragantes) {
            $alerta = PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'VOTOS_SUPERAN_SUFRAGANTES',
                'severidad' => 'CRITICAL',
                'mensaje' => 'Votos por candidatos superan total de sufragantes'
            ]);
            $alertas[] = $alerta;
        }

        // Validación 3: Mesa duplicada
        $existenteValidada = PrecountRecord::where('polling_table_id', $record->polling_table_id)
            ->where('election_position_id', $record->election_position_id)
            ->where('id', '!=', $record->id)
            ->where('estado', 'VALIDADA')
            ->exists();

        if ($existenteValidada) {
            $alerta = PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'MESA_DUPLICADA',
                'severidad' => 'WARNING',
                'mensaje' => 'Esta mesa ya tiene un acta validada (versión anterior)'
            ]);
            $alertas[] = $alerta;
        }

        return $alertas;
    }

    /**
     * Obtener información del scope (nombre, totales, etc.)
     */
    private function obtenerInfoScope(string $scopeType, int $scopeId, ?int $cargoId = null): array
    {
        $info = ['nombre' => null, 'total_mesas' => 0, 'mesas_reportadas' => 0, 'porcentaje_avance' => 0];

        try {
            $mesaIds = collect();

            switch ($scopeType) {
                case 'MESA':
                    $mesa = DB::table('mesas')->find($scopeId);
                    if ($mesa) {
                        $info['nombre'] = 'Mesa ' . $mesa->numero;
                        $mesaIds = collect([$scopeId]);
                    }
                    break;

                case 'PUESTO':
                    $puesto = DB::table('puestos_votacion')->find($scopeId);
                    if ($puesto) {
                        $info['nombre'] = $puesto->nombre;
                        $mesaIds = DB::table('mesas')->where('puesto_votacion_id', $scopeId)->pluck('id');
                    }
                    break;

                case 'MUNICIPIO':
                    $municipio = DB::table('municipios')->find($scopeId);
                    if ($municipio) {
                        $info['nombre'] = $municipio->nombre;
                        $mesaIds = DB::table('mesas')
                            ->join('puestos_votacion', 'mesas.puesto_votacion_id', '=', 'puestos_votacion.id')
                            ->where('puestos_votacion.municipio_id', $scopeId)
                            ->pluck('mesas.id');
                    }
                    break;

                case 'DEPARTAMENTO':
                    $departamento = DB::table('departamentos')->find($scopeId);
                    if ($departamento) {
                        $info['nombre'] = $departamento->nombre;
                        $mesaIds = DB::table('mesas')
                            ->join('puestos_votacion', 'mesas.puesto_votacion_id', '=', 'puestos_votacion.id')
                            ->join('municipios', 'puestos_votacion.municipio_id', '=', 'municipios.id')
                            ->where('municipios.departamento_id', $scopeId)
                            ->pluck('mesas.id');
                    }
                    break;
            }

            $info['total_mesas'] = $mesaIds->count();

            if ($cargoId && $mesaIds->isNotEmpty()) {
                $info['mesas_reportadas'] = DB::table('mesa_cargo_status')
                    ->whereIn('mesa_id', $mesaIds)
                    ->where('cargo_id', $cargoId)
                    ->whereIn('estado', ['REPORTADA', 'OBSERVADA', 'VALIDADA'])
                    ->count();
            }

            $info['porcentaje_avance'] = $info['total_mesas'] > 0
                ? round(($info['mesas_reportadas'] / $info['total_mesas']) * 100, 2)
                : 0;

        } catch (\Exception $e) {
            Log::warning('Error obteniendo info scope', ['type' => $scopeType, 'id' => $scopeId]);
        }

        return $info;
    }
}
