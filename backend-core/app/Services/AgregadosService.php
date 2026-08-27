<?php

namespace App\Services;

use App\Models\PrecountRecord;
use App\Models\PrecountAggregate;
use App\Models\PrecountVote;
use App\Models\Mesa;
use App\Models\MesaCargoStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Cache;

/**
 * Servicio: AgregadosService
 * 
 * Calcula y mantiene los resultados agregados por territorio.
 * Soporta niveles jerárquicos: MESA → PUESTO → MUNICIPIO → DEPARTAMENTO.
 * 
 * CACHÉ: Los resultados se cachean en Redis por 5 minutos para optimizar
 * consultas frecuentes. El cache se invalida automáticamente cuando
 * se valida un nuevo acta.
 */
class AgregadosService
{
    /**
     * Tipos de scope territorial
     */
    const SCOPES = [
        'MESA' => 'mesa',
        'PUESTO' => 'puesto',
        'MUNICIPIO' => 'municipio', 
        'DEPARTAMENTO' => 'departamento'
    ];

    /**
     * Recalcular agregados para un acta específica
     * 
     * Se ejecuta cuando un acta es validada
     */
    public function recalcular(PrecountRecord $record): void
    {
        try {
            DB::beginTransaction();

            // Obtener jerarquía territorial completa
            $jerarquia = $this->obtenerJerarquia($record->polling_table_id);
            
            if (!$jerarquia) {
                Log::error('No se pudo obtener jerarquía territorial', [
                    'mesa_id' => $record->polling_table_id
                ]);
                return;
            }

            // Calcular agregados para cada nivel
            foreach (self::SCOPES as $scopeType => $scopeName) {
                $scopeId = $jerarquia[$scopeName . '_id'] ?? null;
                
                if ($scopeId) {
                    $this->calcularAgregadoScope(
                        $scopeType,
                        $scopeId,
                        $record->election_position_id
                    );
                }
            }

            DB::commit();
            
            Log::info('Agregados recalculados exitosamente', [
                'record_id' => $record->id,
                'mesa_id' => $record->polling_table_id,
                'cargo_id' => $record->election_position_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error recalculando agregados', [
                'record_id' => $record->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Calcular agregado para un scope específico
     */
    private function calcularAgregadoScope(
        string $scopeType, 
        int $scopeId, 
        int $cargoId
    ): void {
        // Obtener IDs de mesas incluidas en este scope
        $mesaIds = $this->obtenerMesasPorScope($scopeType, $scopeId);

        if (empty($mesaIds)) {
            return;
        }

        // Calcular totales por candidato
        $totales = PrecountVote::join('precount_records', 'precount_votes.precount_record_id', '=', 'precount_records.id')
            ->where('precount_records.estado', PrecountRecord::ESTADO_VALIDADA)
            ->where('precount_records.election_position_id', $cargoId)
            ->whereIn('precount_records.polling_table_id', $mesaIds)
            ->select(
                'precount_votes.candidate_id',
                DB::raw('SUM(precount_votes.votos) as total_votos')
            )
            ->groupBy('precount_votes.candidate_id')
            ->get();

        $totalVotosScope = $totales->sum('total_votos');

        // Actualizar o crear agregados
        foreach ($totales as $total) {
            $porcentaje = $totalVotosScope > 0 
                ? round(($total->total_votos / $totalVotosScope) * 100, 2) 
                : 0;

            PrecountAggregate::updateOrCreate(
                [
                    'scope_type' => $scopeType,
                    'scope_id' => $scopeId,
                    'election_position_id' => $cargoId,
                    'candidate_id' => $total->candidate_id
                ],
                [
                    'votos' => $total->total_votos,
                    'porcentaje' => $porcentaje,
                    'updated_at' => now()
                ]
            );
        }

        // Limpiar agregados de candidatos que ya no tienen votos
        $candidatosConVotos = $totales->pluck('candidate_id')->toArray();
        
        PrecountAggregate::where('scope_type', $scopeType)
            ->where('scope_id', $scopeId)
            ->where('election_position_id', $cargoId)
            ->whereNotIn('candidate_id', $candidatosConVotos)
            ->delete();
    }

    /**
     * Obtener jerarquía territorial de una mesa
     */
    private function obtenerJerarquia(int $mesaId): ?array
    {
        $mesa = Mesa::with(['puestoVotacion.municipio'])->find($mesaId);

        if (!$mesa || !$mesa->puestoVotacion || !$mesa->puestoVotacion->municipio) {
            return null;
        }

        return [
            'mesa_id' => $mesa->id,
            'puesto_id' => $mesa->puesto_votacion_id,
            'municipio_id' => $mesa->puestoVotacion->municipio_id,
            'departamento_id' => $mesa->puestoVotacion->municipio->departamento_id
        ];
    }

    /**
     * Obtener IDs de mesas según el scope
     */
    private function obtenerMesasPorScope(string $scopeType, int $scopeId): array
    {
        switch ($scopeType) {
            case 'MESA':
                return [$scopeId];

            case 'PUESTO':
                return Mesa::where('puesto_votacion_id', $scopeId)
                    ->pluck('id')
                    ->toArray();

            case 'MUNICIPIO':
                return Mesa::whereHas('puestoVotacion', function($q) use ($scopeId) {
                        $q->where('municipio_id', $scopeId);
                    })
                    ->pluck('id')
                    ->toArray();

            case 'DEPARTAMENTO':
                return Mesa::whereHas('puestoVotacion.municipio', function($q) use ($scopeId) {
                        $q->where('departamento_id', $scopeId);
                    })
                    ->pluck('id')
                    ->toArray();

            default:
                return [];
        }
    }

    /**
     * Obtener resultados agregados para mostrar en dashboard
     * CON CACHE: Los resultados se cachean por 5 minutos
     */
    public function obtenerResultados(
        string $scopeType,
        int $scopeId,
        int $cargoId,
        ?string $orderBy = 'votos',
        string $orderDirection = 'desc'
    ): array {
        $cacheKey = "resultados:{$scopeType}:{$scopeId}:{$cargoId}";
        
        // Intentar obtener del cache
        $cached = Cache::get($cacheKey);
        if ($cached) {
            Log::debug("📦 Cache HIT: {$cacheKey}");
            return $cached;
        }

        $query = PrecountAggregate::where('scope_type', $scopeType)
            ->where('scope_id', $scopeId)
            ->where('election_position_id', $cargoId)
            ->with('candidate');

        // Ordenar
        if ($orderBy === 'votos') {
            $query->orderBy('votos', $orderDirection);
        } elseif ($orderBy === 'porcentaje') {
            $query->orderBy('porcentaje', $orderDirection);
        }

        $resultados = $query->get();

        $totalVotos = $resultados->sum('votos');

        $data = [
            'scope_type' => $scopeType,
            'scope_id' => $scopeId,
            'cargo_id' => $cargoId,
            'total_votos' => $totalVotos,
            'resultados' => $resultados->map(function ($item) use ($totalVotos) {
                return [
                    'candidate_id' => $item->candidate_id,
                    'candidate_nombre' => $item->candidate?->nombre ?? 'Candidato ' . $item->candidate_id,
                    'votos' => $item->votos,
                    'porcentaje' => $item->porcentaje,
                    'es_ganador' => false // Se calcula después
                ];
            }),
            'ganador' => $resultados->first() // El primero es el ganador (ordenado por votos)
        ];

        // Guardar en cache por 5 minutos
        Cache::put($cacheKey, $data, now()->addMinutes(5));
        Log::debug("💾 Cache MISS - Guardado: {$cacheKey}");

        return $data;
    }

    /**
     * Invalidar cache para un territorio específico
     */
    public function invalidarCache(int $scopeId, string $scopeType, int $cargoId): void
    {
        $cacheKey = "resultados:{$scopeType}:{$scopeId}:{$cargoId}";
        Cache::forget($cacheKey);
        
        Log::debug("🗑️  Cache invalidado: {$cacheKey}");
    }

    /**
     * Invalidar cache completa de un territorio y sus jerarquías
     */
    public function invalidarCacheJerarquico(array $jerarquia, int $cargoId): void
    {
        $scopes = [
            ['type' => 'MESA', 'id' => $jerarquia['mesa_id'] ?? null],
            ['type' => 'PUESTO', 'id' => $jerarquia['puesto_id'] ?? null],
            ['type' => 'MUNICIPIO', 'id' => $jerarquia['municipio_id'] ?? null],
            ['type' => 'DEPARTAMENTO', 'id' => $jerarquia['departamento_id'] ?? null],
        ];

        foreach ($scopes as $scope) {
            if ($scope['id']) {
                $this->invalidarCache($scope['id'], $scope['type'], $cargoId);
            }
        }
    }

    /**
     * Comparar resultados entre dos scopes (ej: municipio vs nacional)
     */
    public function compararScopes(
        string $scopeType1,
        int $scopeId1,
        string $scopeType2,
        int $scopeId2,
        int $cargoId
    ): array {
        $resultados1 = $this->obtenerResultados($scopeType1, $scopeId1, $cargoId);
        $resultados2 = $this->obtenerResultados($scopeType2, $scopeId2, $cargoId);

        return [
            'scope_1' => $resultados1,
            'scope_2' => $resultados2,
            'diferencias' => $this->calcularDiferencias(
                $resultados1['resultados'],
                $resultados2['resultados']
            )
        ];
    }

    /**
     * Calcular diferencias entre dos conjuntos de resultados
     */
    private function calcularDiferencias($resultados1, $resultados2): array
    {
        $diffs = [];
        
        // Indexar por candidate_id
        $map1 = collect($resultados1)->keyBy('candidate_id');
        $map2 = collect($resultados2)->keyBy('candidate_id');
        
        $allCandidates = $map1->keys()->merge($map2->keys())->unique();
        
        foreach ($allCandidates as $candidateId) {
            $r1 = $map1->get($candidateId);
            $r2 = $map2->get($candidateId);
            
            $votos1 = $r1['votos'] ?? 0;
            $votos2 = $r2['votos'] ?? 0;
            
            if ($votos1 !== $votos2) {
                $diffs[] = [
                    'candidate_id' => $candidateId,
                    'votos_scope_1' => $votos1,
                    'votos_scope_2' => $votos2,
                    'diferencia' => $votos2 - $votos1
                ];
            }
        }
        
        return $diffs;
    }

    /**
     * Generar snapshot histórico de resultados
     */
    public function generarSnapshot(int $cargoId, string $scopeType, int $scopeId): void
    {
        $resultados = $this->obtenerResultados($scopeType, $scopeId, $cargoId);
        $totalMesas = $this->contarMesasPorScope($scopeType, $scopeId);
        $mesasReportadas = $this->contarMesasReportadas($scopeType, $scopeId, $cargoId);

        DB::table('preconteo_snapshots')->insert([
            'election_position_id' => $cargoId,
            'scope_type' => $scopeType,
            'scope_id' => $scopeId,
            'resultados' => json_encode($resultados['resultados']),
            'total_mesas' => $totalMesas,
            'mesas_reportadas' => $mesasReportadas,
            'porcentaje_avance' => $totalMesas > 0 ? round(($mesasReportadas / $totalMesas) * 100, 2) : 0,
            'snapshot_at' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Contar mesas totales por scope
     */
    private function contarMesasPorScope(string $scopeType, int $scopeId): int
    {
        switch ($scopeType) {
            case 'MESA':
                return 1;
            case 'PUESTO':
                return Mesa::where('puesto_votacion_id', $scopeId)->count();
            case 'MUNICIPIO':
                return Mesa::whereHas('puestoVotacion', fn($q) => $q->where('municipio_id', $scopeId))->count();
            case 'DEPARTAMENTO':
                return Mesa::whereHas('puestoVotacion.municipio', fn($q) => $q->where('departamento_id', $scopeId))->count();
            default:
                return 0;
        }
    }

    /**
     * Contar mesas reportadas por scope
     */
    private function contarMesasReportadas(string $scopeType, int $scopeId, int $cargoId): int
    {
        $mesaIds = $this->obtenerMesasPorScope($scopeType, $scopeId);
        
        if (empty($mesaIds)) {
            return 0;
        }

        return \App\Models\MesaCargoStatus::where('cargo_id', $cargoId)
            ->whereIn('mesa_id', $mesaIds)
            ->whereIn('estado', ['REPORTADA', 'OBSERVADA', 'VALIDADA'])
            ->count();
    }
}
