<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class DonanteController extends Controller
{
    /**
     * Listar donantes de una campaña
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

        $query = Donante::with(['municipio.departamento', 'donaciones'])
            ->where('campana_id', $campanaId);

        // Filtros
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }

        if ($request->has('grandes')) {
            $minimo = $request->get('minimo', 10000000);
            $query->grandes($minimo);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombres', 'ILIKE', "%{$search}%")
                  ->orWhere('apellidos', 'ILIKE', "%{$search}%")
                  ->orWhere('razon_social', 'ILIKE', "%{$search}%")
                  ->orWhere('documento', 'ILIKE', "%{$search}%")
                  ->orWhere('nit', 'ILIKE', "%{$search}%");
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'total_donado');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $donantes = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $donantes->items(),
            'pagination' => [
                'total' => $donantes->total(),
                'per_page' => $donantes->perPage(),
                'current_page' => $donantes->currentPage(),
                'last_page' => $donantes->lastPage(),
            ],
        ], 200);
    }

    /**
     * Registrar nuevo donante
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'campana_id' => 'required|exists:campanas,id',
            'tipo' => 'required|in:persona_natural,persona_juridica',
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'municipio_id' => 'nullable|exists:municipios,id',
            'acepta_publicacion' => 'boolean',
        ];

        if ($request->tipo === 'persona_natural') {
            $rules['documento'] = 'required|string|max:20';
            $rules['tipo_documento'] = 'required|in:CC,CE,PA,TI';
            $rules['nombres'] = 'required|string|max:100';
            $rules['apellidos'] = 'required|string|max:100';
        } else {
            $rules['nit'] = 'required|string|max:20';
            $rules['razon_social'] = 'required|string|max:200';
            $rules['representante_legal'] = 'nullable|string|max:200';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        // Sin este chequeo, cualquier usuario con acceso a UNA campaña podía
        // registrar donantes en CUALQUIER otra solo enviando su campana_id.
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        // Verificar duplicados
        $query = Donante::where('campana_id', $request->campana_id);

        if ($request->tipo === 'persona_natural') {
            $query->where('documento', $request->documento);
        } else {
            $query->where('nit', $request->nit);
        }

        if ($query->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Ya existe un donante registrado con este documento/NIT',
            ], 409);
        }

        // Solo los campos validados arriba -pasar $request->all() permitía
        // fijar directamente total_donado/numero_donaciones/razon_invalido
        // (todos fillable), datos que deben salir únicamente del flujo real
        // de DonacionController (mismo patrón de bug ya corregido en
        // update() de este controlador).
        $donante = Donante::create(array_merge($validator->validated(), [
            'es_valido' => true,
        ]));

        $donante->load(['municipio.departamento']);

        return response()->json([
            'success' => true,
            'message' => 'Donante registrado exitosamente',
            'data' => $donante,
        ], 201);
    }

    /**
     * Ver donante específico
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $donante = Donante::with([
            'municipio.departamento',
            'donaciones' => function($q) {
                $q->orderBy('fecha_donacion', 'desc')->limit(10);
            },
        ])->find($id);

        if (!$donante) {
            return response()->json([
                'success' => false,
                'message' => 'Donante no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este donante',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $donante,
        ], 200);
    }

    /**
     * Actualizar donante
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $donante = Donante::find($id);

        if (!$donante) {
            return response()->json([
                'success' => false,
                'message' => 'Donante no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este donante',
            ], 403);
        }

        $rules = [
            'email' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:255',
            'municipio_id' => 'nullable|exists:municipios,id',
            'categoria' => 'nullable|in:menor,regular,mayor,frecuente',
            'notas' => 'nullable|string',
            'acepta_publicacion' => 'boolean',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Solo los campos validados arriba -pasar $request->all() permitía
        // reescribir documento/nit/nombres/campana_id/total_donado/es_valido
        // (todos fillable), saltándose la validación de identidad legal del
        // donante y el flujo de auditoría de marcarInvalido().
        $donante->update($validator->validated());
        $donante->load(['municipio.departamento']);

        return response()->json([
            'success' => true,
            'message' => 'Donante actualizado exitosamente',
            'data' => $donante,
        ], 200);
    }

    /**
     * Marcar donante como inválido
     */
    public function marcarInvalido(Request $request, int $id): JsonResponse
    {
        $donante = Donante::find($id);

        if (!$donante) {
            return response()->json([
                'success' => false,
                'message' => 'Donante no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este donante',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'razon_invalido' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar la razón',
                'errors' => $validator->errors(),
            ], 422);
        }

        $donante->update([
            'es_valido' => false,
            'razon_invalido' => $request->razon_invalido,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donante marcado como inválido',
            'data' => $donante,
        ], 200);
    }

    /**
     * Historial de donaciones del donante
     */
    public function historialDonaciones(Request $request, int $id): JsonResponse
    {
        $donante = Donante::find($id);

        if (!$donante) {
            return response()->json([
                'success' => false,
                'message' => 'Donante no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este donante',
            ], 403);
        }

        $donaciones = $donante->donaciones()
            ->with('registradoPor')
            ->orderBy('fecha_donacion', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => [
                'donante' => $donante->nombre_completo,
                'total_donado' => $donante->total_donado,
                'numero_donaciones' => $donante->numero_donaciones,
                'donaciones' => $donaciones->items(),
            ],
            'pagination' => [
                'total' => $donaciones->total(),
                'per_page' => $donaciones->perPage(),
                'current_page' => $donaciones->currentPage(),
                'last_page' => $donaciones->lastPage(),
            ],
        ], 200);
    }
}
