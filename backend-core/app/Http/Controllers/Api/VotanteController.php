<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Votante;
use App\Models\Contacto;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class VotanteController extends Controller
{
    /**
     * Listar votantes de una campaña
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $campanaId = $request->get('campana_id');

        // Verificar acceso a la campaña
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

        $query = Votante::with(['municipio', 'puestoVotacion', 'liderAsignado'])
            ->campana($campanaId)
            ->activos();

        // Filtros
        if ($request->has('intencion_voto')) {
            $query->intencionVoto($request->intencion_voto);
        }

        if ($request->has('es_lider')) {
            $query->where('es_lider', $request->boolean('es_lider'));
        }

        if ($request->has('municipio_id')) {
            $query->where('municipio_id', $request->municipio_id);
        }

        if ($request->has('scoring_min')) {
            $query->where('scoring', '>=', $request->scoring_min);
        }

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('documento', 'LIKE', "%{$search}%")
                  ->orWhere('primer_nombre', 'ILIKE', "%{$search}%")
                  ->orWhere('primer_apellido', 'ILIKE', "%{$search}%")
                  ->orWhere('celular', 'LIKE', "%{$search}%");
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginación
        $perPage = $request->get('per_page', 50);
        $votantes = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $votantes->items(),
            'pagination' => [
                'total' => $votantes->total(),
                'per_page' => $votantes->perPage(),
                'current_page' => $votantes->currentPage(),
                'last_page' => $votantes->lastPage(),
            ],
        ], 200);
    }

    /**
     * Crear nuevo votante
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'documento' => 'required|string|max:20',
            'tipo_documento' => 'required|in:CC,CE,TI,PAS',
            'primer_nombre' => 'required|string|max:50',
            'primer_apellido' => 'required|string|max:50',
            'celular' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'municipio_id' => 'nullable|exists:municipios,id',
            'intencion_voto' => 'nullable|in:a_favor,en_contra,indeciso,sin_definir',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verificar duplicado
        $existe = Votante::where('campana_id', $request->campana_id)
            ->where('documento', $request->documento)
            ->first();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe un votante con ese documento en esta campaña',
                'data' => $existe,
            ], 409);
        }

        $votante = Votante::create(array_merge($request->all(), [
            'estado' => 'activo',
            'numero_contactos' => 0,
        ]));

        $votante->load(['municipio', 'puestoVotacion']);

        return response()->json([
            'success' => true,
            'message' => 'Votante creado exitosamente',
            'data' => $votante,
        ], 201);
    }

    /**
     * Ver votante específico
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $votante = Votante::with([
            'municipio.departamento',
            'puestoVotacion',
            'mesa',
            'liderAsignado',
            'subordinados',
            'contactos' => function($q) {
                $q->latest()->limit(10);
            }
        ])->find($id);

        if (!$votante) {
            return response()->json([
                'success' => false,
                'message' => 'Votante no encontrado',
            ], 404);
        }

        // Verificar acceso
        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($votante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este votante',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $votante,
        ], 200);
    }

    /**
     * Actualizar votante
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $votante = Votante::find($id);

        if (!$votante) {
            return response()->json([
                'success' => false,
                'message' => 'Votante no encontrado',
            ], 404);
        }

        // Verificar acceso
        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($votante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este votante',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'celular' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:150',
            'intencion_voto' => 'nullable|in:a_favor,en_contra,indeciso,sin_definir',
            'probabilidad_voto' => 'nullable|integer|min:0|max:100',
            'scoring' => 'nullable|integer|min:0|max:100',
            'observaciones' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Solo campos validados arriba -pasar $request->all() permitía
        // reescribir documento/tipo_documento/nombres/campana_id/
        // es_verificado/etc. (todos fillable), es decir alterar la
        // identidad de un votante o su verificación desde este endpoint.
        $votante->update(array_merge($validator->validated(), [
            'ultima_actualizacion_datos' => now(),
        ]));

        $votante->load(['municipio', 'puestoVotacion']);

        return response()->json([
            'success' => true,
            'message' => 'Votante actualizado exitosamente',
            'data' => $votante,
        ], 200);
    }

    /**
     * Registrar contacto con votante
     */
    public function registrarContacto(Request $request, int $id): JsonResponse
    {
        $votante = Votante::find($id);

        if (!$votante) {
            return response()->json([
                'success' => false,
                'message' => 'Votante no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($votante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este votante',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'tipo' => 'required|in:llamada,visita,sms,email,whatsapp,evento',
            'resultado' => 'required|in:exitoso,sin_respuesta,rechazado,pendiente',
            'notas' => 'nullable|string',
            'intencion_voto_despues' => 'nullable|in:a_favor,en_contra,indeciso,sin_definir',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contacto = Contacto::create([
            'campana_id' => $votante->campana_id,
            'votante_id' => $votante->id,
            'user_id' => $request->user()->id,
            'tipo' => $request->tipo,
            'resultado' => $request->resultado,
            'notas' => $request->notas,
            'intencion_voto_antes' => $votante->intencion_voto,
            'intencion_voto_despues' => $request->intencion_voto_despues,
        ]);

        // Actualizar votante
        $votante->update([
            'numero_contactos' => $votante->numero_contactos + 1,
            'ultimo_contacto' => now(),
            'intencion_voto' => $request->intencion_voto_despues ?? $votante->intencion_voto,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contacto registrado exitosamente',
            'data' => $contacto,
        ], 201);
    }

    /**
     * Estadísticas de votantes
     */
    public function estadisticas(Request $request): JsonResponse
    {
        $campanaId = $request->get('campana_id');

        if (!$campanaId) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar campana_id',
            ], 400);
        }

        $stats = [
            'total_votantes' => Votante::where('campana_id', $campanaId)->activos()->count(),
            'por_intencion_voto' => [
                'a_favor' => Votante::where('campana_id', $campanaId)->intencionVoto('a_favor')->count(),
                'en_contra' => Votante::where('campana_id', $campanaId)->intencionVoto('en_contra')->count(),
                'indeciso' => Votante::where('campana_id', $campanaId)->intencionVoto('indeciso')->count(),
                'sin_definir' => Votante::where('campana_id', $campanaId)->intencionVoto('sin_definir')->count(),
            ],
            'lideres' => Votante::where('campana_id', $campanaId)->lideres()->count(),
            'scoring_promedio' => round(Votante::where('campana_id', $campanaId)->avg('scoring') ?? 0, 2),
            'contactos_ultimo_mes' => Contacto::where('campana_id', $campanaId)
                ->where('created_at', '>=', now()->subMonth())
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }

    /**
     * Historial de contactos de un votante. registrarContacto() ya existía
     * y funcionaba, pero no había ningún endpoint para listar el historial
     * -el frontend siempre mostraba "No hay contactos registrados" y el
     * botón para registrar uno nuevo no tenía onClick.
     */
    public function listarContactos(Request $request, int $id): JsonResponse
    {
        $votante = Votante::find($id);

        if (!$votante) {
            return response()->json([
                'success' => false,
                'message' => 'Votante no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($votante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este votante',
            ], 403);
        }

        $contactos = Contacto::where('votante_id', $id)
            ->with('user:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contactos,
        ], 200);
    }
}
