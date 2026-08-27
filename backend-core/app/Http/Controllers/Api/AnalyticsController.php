<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analyticsService)
    {
    }

    public function general(Request $request): JsonResponse
    {
        return $this->responder($request, fn (int $campanaId, array $filtros) => $this->analyticsService->general($campanaId, $filtros));
    }

    public function votantes(Request $request): JsonResponse
    {
        return $this->responder($request, fn (int $campanaId, array $filtros) => $this->analyticsService->votantes($campanaId, $filtros));
    }

    public function financiero(Request $request): JsonResponse
    {
        return $this->responder($request, fn (int $campanaId, array $filtros) => $this->analyticsService->financiero($campanaId, $filtros));
    }

    public function comunicacion(Request $request): JsonResponse
    {
        return $this->responder($request, fn (int $campanaId, array $filtros) => $this->analyticsService->comunicacion($campanaId, $filtros));
    }

    public function eventos(Request $request): JsonResponse
    {
        return $this->responder($request, fn (int $campanaId, array $filtros) => $this->analyticsService->eventos($campanaId, $filtros));
    }

    private function responder(Request $request, \Closure $calcular): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date',
            'departamento_id' => 'nullable|integer',
            'municipio_id' => 'nullable|integer',
            'segmento_id' => 'nullable|integer',
            'categoria_gasto_id' => 'nullable|integer',
            'tipo_evento' => 'nullable|string',
            'canal_comunicacion' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $campanaId = (int) $request->campana_id;
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campanaId)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $filtros = $request->only(['fecha_inicio', 'fecha_fin', 'departamento_id', 'municipio_id', 'segmento_id', 'categoria_gasto_id', 'tipo_evento', 'canal_comunicacion']);

        return response()->json([
            'success' => true,
            'data' => $calcular($campanaId, $filtros),
        ], 200);
    }
}
