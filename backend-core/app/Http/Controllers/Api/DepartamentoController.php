<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepartamentoController extends Controller
{
    /**
     * Listar todos los departamentos
     */
    public function index(Request $request): JsonResponse
    {
        $query = Departamento::query();

        // Filtro por región
        if ($request->has('region')) {
            $query->region($request->region);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'nombre');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $departamentos = $query->get();

        return response()->json([
            'success' => true,
            'data' => $departamentos,
            'total' => $departamentos->count(),
        ], 200);
    }

    /**
     * Obtener un departamento específico
     */
    public function show(int $id): JsonResponse
    {
        $departamento = Departamento::with(['municipios'])->find($id);

        if (!$departamento) {
            return response()->json([
                'success' => false,
                'message' => 'Departamento no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $departamento,
        ], 200);
    }

    /**
     * Obtener municipios de un departamento
     */
    public function municipios(int $id): JsonResponse
    {
        $departamento = Departamento::find($id);

        if (!$departamento) {
            return response()->json([
                'success' => false,
                'message' => 'Departamento no encontrado',
            ], 404);
        }

        $municipios = $departamento->municipios()
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $municipios,
            'total' => $municipios->count(),
        ], 200);
    }

    /**
     * Obtener estadísticas del departamento
     */
    public function estadisticas(int $id): JsonResponse
    {
        $departamento = Departamento::find($id);

        if (!$departamento) {
            return response()->json([
                'success' => false,
                'message' => 'Departamento no encontrado',
            ], 404);
        }

        $stats = [
            'departamento' => $departamento->nombre,
            'codigo' => $departamento->codigo,
            'poblacion' => $departamento->poblacion,
            'total_municipios' => $departamento->municipios()->count(),
            'municipios_capitales' => $departamento->municipios()->capitales()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }
}
