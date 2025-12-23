<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PuestoVotacion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PuestoVotacionController extends Controller
{
    /**
     * Listar puestos de votación
     */
    public function index(Request $request): JsonResponse
    {
        $query = PuestoVotacion::with(['municipio', 'zonaElectoral']);

        // Filtro por municipio
        if ($request->has('municipio_id')) {
            $query->where('municipio_id', $request->municipio_id);
        }

        // Filtro por zona
        if ($request->has('zona')) {
            $query->where('zona', $request->zona);
        }

        // Búsqueda
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'ILIKE', "%{$search}%")
                  ->orWhere('direccion', 'ILIKE', "%{$search}%")
                  ->orWhere('codigo', 'LIKE', "%{$search}%");
            });
        }

        // Paginación
        $perPage = $request->get('per_page', 50);
        $puestos = $query->orderBy('nombre', 'asc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $puestos->items(),
            'pagination' => [
                'total' => $puestos->total(),
                'per_page' => $puestos->perPage(),
                'current_page' => $puestos->currentPage(),
                'last_page' => $puestos->lastPage(),
            ],
        ], 200);
    }

    /**
     * Obtener un puesto específico
     */
    public function show(int $id): JsonResponse
    {
        $puesto = PuestoVotacion::with(['municipio.departamento', 'zonaElectoral', 'mesas'])->find($id);

        if (!$puesto) {
            return response()->json([
                'success' => false,
                'message' => 'Puesto de votación no encontrado',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $puesto,
        ], 200);
    }

    /**
     * Buscar puestos cercanos (geolocalización)
     */
    public function cercanos(Request $request): JsonResponse
    {
        $validator = validator($request->all(), [
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
            'radio_km' => 'nullable|numeric|min:0.1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $latitud = $request->latitud;
        $longitud = $request->longitud;
        $radioKm = $request->get('radio_km', 5); // Default 5km

        // Query PostGIS para buscar puestos cercanos
        $puestos = PuestoVotacion::with(['municipio', 'zonaElectoral'])
            ->whereNotNull('location')
            ->select('*')
            ->selectRaw(
                "ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distancia_metros",
                [$longitud, $latitud]
            )
            ->whereRaw(
                "ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)",
                [$longitud, $latitud, $radioKm * 1000]
            )
            ->orderByRaw('distancia_metros ASC')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $puestos,
            'total' => $puestos->count(),
            'radio_km' => $radioKm,
        ], 200);
    }

    /**
     * Estadísticas del puesto
     */
    public function estadisticas(int $id): JsonResponse
    {
        $puesto = PuestoVotacion::find($id);

        if (!$puesto) {
            return response()->json([
                'success' => false,
                'message' => 'Puesto de votación no encontrado',
            ], 404);
        }

        $stats = [
            'puesto' => $puesto->nombre,
            'codigo' => $puesto->codigo,
            'direccion' => $puesto->direccion,
            'municipio' => $puesto->municipio->nombre,
            'numero_mesas' => $puesto->numero_mesas,
            'votantes_habilitados' => $puesto->votantes_habilitados,
            'tiene_coordenadas' => !is_null($puesto->latitud) && !is_null($puesto->longitud),
            'accesibilidad' => [
                'discapacitados' => $puesto->accesibilidad_discapacitados,
                'transporte_publico' => $puesto->transporte_publico,
                'parqueadero' => $puesto->parqueadero,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }
}
