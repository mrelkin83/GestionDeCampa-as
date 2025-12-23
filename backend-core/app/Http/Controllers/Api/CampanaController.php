<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campana;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CampanaController extends Controller
{
    /**
     * Listar campañas del usuario autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Si es super_admin, ver todas las campañas
        if ($user->role->name === 'super_admin') {
            $query = Campana::with(['cargoElectoral', 'departamento', 'municipio']);
        } else {
            // Solo campañas asignadas al usuario
            $query = $user->campanas()->with(['cargoElectoral', 'departamento', 'municipio']);
        }

        // Filtros
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('tipo_eleccion')) {
            $query->where('tipo_eleccion', $request->tipo_eleccion);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_eleccion');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $campanas = $query->get();

        return response()->json([
            'success' => true,
            'data' => $campanas,
            'total' => $campanas->count(),
        ], 200);
    }

    /**
     * Crear nueva campaña
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:200',
            'cargo_electoral_id' => 'required|exists:cargos_electorales,id',
            'fecha_eleccion' => 'required|date',
            'tipo_eleccion' => 'required|in:primera_vuelta,segunda_vuelta,consulta',
            'departamento_id' => 'nullable|exists:departamentos,id',
            'municipio_id' => 'nullable|exists:municipios,id',
            'candidato_nombre' => 'required|string|max:200',
            'candidato_documento' => 'nullable|string|max:20',
            'partido_politico' => 'nullable|string|max:150',
            'slogan' => 'nullable|string',
            'tope_gastos' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Generar slug único
        $slug = Str::slug($request->nombre);
        $slugOriginal = $slug;
        $counter = 1;
        while (Campana::where('slug', $slug)->exists()) {
            $slug = $slugOriginal . '-' . $counter;
            $counter++;
        }

        $campana = Campana::create([
            'nombre' => $request->nombre,
            'slug' => $slug,
            'cargo_electoral_id' => $request->cargo_electoral_id,
            'fecha_eleccion' => $request->fecha_eleccion,
            'tipo_eleccion' => $request->tipo_eleccion,
            'departamento_id' => $request->departamento_id,
            'municipio_id' => $request->municipio_id,
            'candidato_nombre' => $request->candidato_nombre,
            'candidato_documento' => $request->candidato_documento,
            'partido_politico' => $request->partido_politico,
            'slogan' => $request->slogan,
            'tope_gastos' => $request->tope_gastos,
            'estado' => 'planificacion',
        ]);

        // Asignar el usuario creador como admin de la campaña
        $adminRole = \App\Models\Role::where('name', 'admin_campana')->first();
        $campana->users()->attach($request->user()->id, [
            'role_id' => $adminRole->id,
            'is_active' => true,
            'fecha_asignacion' => now(),
        ]);

        $campana->load(['cargoElectoral', 'departamento', 'municipio']);

        return response()->json([
            'success' => true,
            'message' => 'Campaña creada exitosamente',
            'data' => $campana,
        ], 201);
    }

    /**
     * Ver campaña específica
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $campana = Campana::with(['cargoElectoral', 'departamento', 'municipio', 'users'])->find($id);

        if (!$campana) {
            return response()->json([
                'success' => false,
                'message' => 'Campaña no encontrada',
            ], 404);
        }

        // Verificar acceso (solo super_admin o usuarios asignados)
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $campana,
        ], 200);
    }

    /**
     * Actualizar campaña
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $campana = Campana::find($id);

        if (!$campana) {
            return response()->json([
                'success' => false,
                'message' => 'Campaña no encontrada',
            ], 404);
        }

        // Verificar acceso
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:200',
            'estado' => 'sometimes|in:planificacion,activa,finalizada,suspendida',
            'slogan' => 'nullable|string',
            'tope_gastos' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $campana->update($request->only([
            'nombre', 'estado', 'slogan', 'tope_gastos', 'logo_url',
            'fecha_inicio', 'fecha_fin', 'configuracion',
        ]));

        $campana->load(['cargoElectoral', 'departamento', 'municipio']);

        return response()->json([
            'success' => true,
            'message' => 'Campaña actualizada exitosamente',
            'data' => $campana,
        ], 200);
    }

    /**
     * Estadísticas de campaña
     */
    public function estadisticas(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $campana = Campana::find($id);

        if (!$campana) {
            return response()->json([
                'success' => false,
                'message' => 'Campaña no encontrada',
            ], 404);
        }

        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $stats = [
            'nombre' => $campana->nombre,
            'estado' => $campana->estado,
            'fecha_eleccion' => $campana->fecha_eleccion,
            'candidato' => $campana->candidato_nombre,
            'alcance_territorial' => [
                'departamento' => $campana->departamento?->nombre,
                'municipio' => $campana->municipio?->nombre,
            ],
            'equipo' => [
                'total_usuarios' => $campana->users()->count(),
            ],
            'financiero' => [
                'tope_gastos' => $campana->tope_gastos,
                'total_donaciones' => $campana->total_donaciones,
                'total_gastos' => $campana->total_gastos,
                'porcentaje_tope_usado' => $campana->tope_gastos > 0
                    ? round(($campana->total_gastos / $campana->tope_gastos) * 100, 2)
                    : 0,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }
}
