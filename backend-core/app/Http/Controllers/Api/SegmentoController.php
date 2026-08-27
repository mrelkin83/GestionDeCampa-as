<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Segmento;
use App\Models\Votante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SegmentoController extends Controller
{
    /**
     * Listar segmentos de una campaña
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

        $query = Segmento::where('campana_id', $campanaId)
            ->withCount('votantes');

        if ($request->has('tipo')) {
            $query->where('es_dinamico', $request->tipo === 'dinamico');
        }

        $segmentos = $query->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'data' => $segmentos,
        ], 200);
    }

    /**
     * Crear segmento
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'tipo' => 'required|in:dinamico,estatico',
            'criterios' => 'required_if:tipo,dinamico|nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        // Sin este chequeo, cualquier usuario con acceso a UNA campaña podía
        // crear segmentos en CUALQUIER otra solo enviando su campana_id.
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $segmento = Segmento::create([
            'campana_id' => $request->campana_id,
            'created_by_id' => $request->user()->id,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'criterios' => $request->criterios,
            'es_dinamico' => $request->tipo === 'dinamico',
            'total_votantes' => 0,
        ]);

        // Si es dinámico, calcular votantes
        if ($segmento->es_dinamico && $request->has('criterios')) {
            $this->recalcularSegmento($segmento);
        }

        return response()->json([
            'success' => true,
            'message' => 'Segmento creado exitosamente',
            'data' => $segmento->load(['votantes']),
        ], 201);
    }

    /**
     * Ver segmento específico
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $segmento = Segmento::withCount('votantes')
            ->with(['votantes' => function($q) {
                $q->limit(100);
            }])
            ->find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $segmento,
        ], 200);
    }

    /**
     * Actualizar segmento
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $segmento = Segmento::find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:100',
            'descripcion' => 'nullable|string|max:500',
            'criterios' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $segmento->update($validator->validated());

        // Si se actualizaron criterios y es dinámico, recalcular
        if ($request->has('criterios') && $segmento->es_dinamico) {
            $this->recalcularSegmento($segmento);
        }

        return response()->json([
            'success' => true,
            'message' => 'Segmento actualizado exitosamente',
            'data' => $segmento->load(['votantes']),
        ], 200);
    }

    /**
     * Eliminar segmento
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $segmento = Segmento::find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        $segmento->delete();

        return response()->json([
            'success' => true,
            'message' => 'Segmento eliminado exitosamente',
        ], 200);
    }

    /**
     * Listado paginado de votantes de un segmento. Esta ruta nunca existió
     * -segmentosAPI.getVotantes() (frontend-web) siempre apuntaba a un 404,
     * dejando la tabla "Votantes en este Segmento" de SegmentoDetalle.tsx
     * permanentemente vacía sin importar cuántos votantes tuviera el
     * segmento. El frontend espera el paginador de Laravel plano (sin el
     * envoltorio {success, data} del resto de la API), coincidiendo con el
     * tipo VotantePagination ya declarado.
     */
    public function getVotantes(Request $request, int $id)
    {
        $segmento = Segmento::find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        $perPage = $request->get('per_page', 15);

        return $segmento->votantes()->paginate($perPage);
    }

    /**
     * Agregar votantes a segmento estático
     */
    public function agregarVotantes(Request $request, int $id): JsonResponse
    {
        $segmento = Segmento::find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        if ($segmento->es_dinamico) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden agregar votantes manualmente a segmentos estáticos',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'votantes_ids' => 'required|array|min:1',
            'votantes_ids.*' => 'exists:votantes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Agregar votantes sin duplicar
        $segmento->votantes()->syncWithoutDetaching($request->votantes_ids);

        // Actualizar contador
        $segmento->update([
            'total_votantes' => $segmento->votantes()->count(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Votantes agregados al segmento',
            'data' => [
                'total_votantes' => $segmento->total_votantes,
            ],
        ], 200);
    }

    /**
     * Remover votantes de segmento estático
     */
    public function removerVotantes(Request $request, int $id): JsonResponse
    {
        $segmento = Segmento::find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        if ($segmento->es_dinamico) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden remover votantes manualmente de segmentos estáticos',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'votantes_ids' => 'required|array|min:1',
            'votantes_ids.*' => 'exists:votantes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Remover votantes
        $segmento->votantes()->detach($request->votantes_ids);

        // Actualizar contador
        $segmento->update([
            'total_votantes' => $segmento->votantes()->count(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Votantes removidos del segmento',
            'data' => [
                'total_votantes' => $segmento->total_votantes,
            ],
        ], 200);
    }

    /**
     * Recalcular segmento dinámico
     */
    public function recalcular(Request $request, int $id): JsonResponse
    {
        $segmento = Segmento::find($id);

        if (!$segmento) {
            return response()->json([
                'success' => false,
                'message' => 'Segmento no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($segmento->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este segmento',
            ], 403);
        }

        if (!$segmento->es_dinamico) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden recalcular segmentos dinámicos',
            ], 400);
        }

        $this->recalcularSegmento($segmento);

        return response()->json([
            'success' => true,
            'message' => 'Segmento recalculado exitosamente',
            'data' => [
                'total_votantes' => $segmento->total_votantes,
                'ultima_actualizacion' => $segmento->updated_at,
            ],
        ], 200);
    }

    /**
     * Lógica para recalcular segmento dinámico
     */
    private function recalcularSegmento(Segmento $segmento): void
    {
        if (!$segmento->criterios) {
            return;
        }

        $query = Votante::where('campana_id', $segmento->campana_id);

        // Aplicar criterios
        foreach ($segmento->criterios as $campo => $valor) {
            if ($campo === 'intencion_voto') {
                $query->intencionVoto($valor);
            } elseif ($campo === 'scoring_minimo') {
                $query->altoScoring($valor);
            } elseif ($campo === 'municipio_id') {
                $query->where('municipio_id', $valor);
            } elseif ($campo === 'genero') {
                $query->where('genero', $valor);
            } elseif ($campo === 'rango_edad') {
                [$min, $max] = explode('-', $valor);
                $query->whereRaw('EXTRACT(YEAR FROM AGE(fecha_nacimiento)) BETWEEN ? AND ?', [$min, $max]);
            }
        }

        $votantesIds = $query->pluck('id')->toArray();

        // Sincronizar votantes
        $segmento->votantes()->sync($votantesIds);

        // Actualizar contador
        $segmento->update([
            'total_votantes' => count($votantesIds),
        ]);
    }
}
