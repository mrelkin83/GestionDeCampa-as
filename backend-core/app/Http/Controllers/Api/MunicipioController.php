<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Municipio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MunicipioController extends Controller
{
    /**
     * Listar municipios con filtros
     */
    public function index(Request $request): JsonResponse
    {
        $query = Municipio::with('departamento');

        // Filtro por departamento
        if ($request->has('departamento_id')) {
            $query->departamento($request->departamento_id);
        }

        // Filtro por tipo
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        // Búsqueda por nombre
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'ILIKE', "%{$search}%")
                  ->orWhere('codigo', 'LIKE', "%{$search}%");
            });
        }

        // Paginación
        $perPage = $request->get('per_page', 50);
        $municipios = $query->orderBy('nombre', 'asc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $municipios->items(),
            'pagination' => [
                'total' => $municipios->total(),
                'per_page' => $municipios->perPage(),
                'current_page' => $municipios->currentPage(),
                'last_page' => $municipios->lastPage(),
            ],
        ], 200);
    }

    /**
     * Obtener un municipio específico
     */
    public function show(int $id): JsonResponse
    {
        $municipio = Municipio::with(['departamento', 'zonasElectorales', 'puestosVotacion'])->find($id);

        if (!$municipio) {
            return response()->json([
                'success' => false,
                'message' => 'Municipio no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $municipio,
        ], 200);
    }

    /**
     * Obtener puestos de votación de un municipio
     */
    public function puestos(int $id): JsonResponse
    {
        $municipio = Municipio::find($id);

        if (!$municipio) {
            return response()->json([
                'success' => false,
                'message' => 'Municipio no encontrado',
            ], 404);
        }

        $puestos = $municipio->puestosVotacion()
            ->with('zonaElectoral')
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $puestos,
            'total' => $puestos->count(),
        ], 200);
    }

    /**
     * Estadísticas del municipio
     */
    public function estadisticas(int $id): JsonResponse
    {
        $municipio = Municipio::find($id);

        if (!$municipio) {
            return response()->json([
                'success' => false,
                'message' => 'Municipio no encontrado',
            ], 404);
        }

        $stats = [
            'municipio' => $municipio->nombre,
            'departamento' => $municipio->departamento->nombre,
            'codigo' => $municipio->codigo,
            'poblacion' => $municipio->poblacion,
            'tipo' => $municipio->tipo,
            'total_puestos_votacion' => $municipio->puestosVotacion()->count(),
            'total_zonas_electorales' => $municipio->zonasElectorales()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }
}
