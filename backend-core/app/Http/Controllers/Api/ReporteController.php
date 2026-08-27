<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reporte;
use App\Services\ReporteService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ReporteController extends Controller
{
    public function __construct(private readonly ReporteService $reporteService)
    {
    }

    /**
     * Listar reportes generados en una campaña.
     */
    public function index(Request $request): JsonResponse
    {
        $campanaId = $request->get('campana_id');

        if (!$campanaId) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar campana_id',
            ], 400);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campanaId)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $reportes = Reporte::where('campana_id', $campanaId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reportes,
        ], 200);
    }

    /**
     * Generar un nuevo reporte. La generación corre de forma síncrona
     * (los volúmenes de una sola campaña son manejables); el registro queda
     * en 'completado' o 'error' antes de responder, sin necesidad de sondeo.
     */
    public function generar(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'nombre' => 'required|string|max:200',
            'descripcion' => 'nullable|string|max:500',
            'tipo' => 'required|in:votantes,financiero,comunicacion,eventos,general',
            'formato' => 'required|in:pdf,excel,csv',
            'filtros' => 'nullable|array',
            'filtros.fecha_inicio' => 'nullable|date',
            'filtros.fecha_fin' => 'nullable|date',
            'incluir_graficos' => 'boolean',
            'incluir_tablas_detalle' => 'boolean',
            'incluir_comparativas' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $reporte = Reporte::create([
            'campana_id' => $request->campana_id,
            'generado_por_id' => $user->id,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'tipo' => $request->tipo,
            'formato' => $request->formato,
            'filtros' => $request->filtros ?? [],
            'incluir_graficos' => $request->boolean('incluir_graficos', true),
            'incluir_tablas_detalle' => $request->boolean('incluir_tablas_detalle', true),
            'incluir_comparativas' => $request->boolean('incluir_comparativas', true),
            'estado' => 'generando',
        ]);

        $this->reporteService->generar($reporte);

        return response()->json([
            'success' => true,
            'message' => $reporte->fresh()->estado === 'completado'
                ? 'Reporte generado exitosamente'
                : 'No se pudo generar el reporte',
            'data' => $reporte->fresh(),
        ], 201);
    }

    /**
     * Descargar el archivo de un reporte ya completado.
     */
    public function descargar(Request $request, int $id)
    {
        $reporte = Reporte::find($id);

        if (!$reporte) {
            return response()->json([
                'success' => false,
                'message' => 'Reporte no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($reporte->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este reporte',
            ], 403);
        }

        if ($reporte->estado !== 'completado' || !$reporte->archivo_path) {
            return response()->json([
                'success' => false,
                'message' => 'El reporte todavía no está listo para descargar',
            ], 409);
        }

        if (!Storage::disk('local')->exists($reporte->archivo_path)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo del reporte ya no existe',
            ], 404);
        }

        $nombreDescarga = \Illuminate\Support\Str::slug($reporte->nombre)
            . '.' . pathinfo($reporte->archivo_path, PATHINFO_EXTENSION);

        return Storage::disk('local')->download($reporte->archivo_path, $nombreDescarga);
    }

    /**
     * Eliminar un reporte (registro + archivo generado).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $reporte = Reporte::find($id);

        if (!$reporte) {
            return response()->json([
                'success' => false,
                'message' => 'Reporte no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($reporte->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este reporte',
            ], 403);
        }

        if ($reporte->archivo_path) {
            Storage::disk('local')->delete($reporte->archivo_path);
        }

        $reporte->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reporte eliminado exitosamente',
        ], 200);
    }
}
