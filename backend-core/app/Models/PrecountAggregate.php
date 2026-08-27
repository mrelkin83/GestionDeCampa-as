<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: PrecountAggregate (Resultados Agregados)
 * 
 * Almacena resultados agregados por nivel territorial.
 * Similar a la Registraduría: resultados por mesa, puesto, municipio, departamento.
 * 
 * @property int $id
 * @property string $scope_type (MESA|PUESTO|MUNICIPIO|DEPARTAMENTO)
 * @property int $scope_id
 * @property int $election_position_id
 * @property int $candidate_id
 * @property int $votos
 * @property float $porcentaje
 * @property \Carbon\Carbon|null $updated_at
 * 
 * @property-read Candidato|null $candidate
 * @property-read CargoElectoral $electionPosition
 */
class PrecountAggregate extends Model
{
    use HasFactory;

    protected $table = 'precount_aggregates';
    
    protected $fillable = [
        'scope_type',
        'scope_id',
        'election_position_id',
        'candidate_id',
        'votos',
        'porcentaje',
        'updated_at',
    ];

    protected $casts = [
        'votos' => 'integer',
        'porcentaje' => 'decimal:2',
        'updated_at' => 'datetime',
    ];

    // Esta tabla solo tiene 'updated_at' (no 'created_at'), así que no se
    // puede activar $timestamps=true sin más (Eloquent intentaría escribir
    // también 'created_at'). AgregadosService::calcularAgregadoScope() ya
    // pasa 'updated_at' explícitamente en cada updateOrCreate(), pero al no
    // estar en $fillable, la asignación masiva lo descartaba en silencio:
    // 'última actualización' quedaba siempre NULL en cada resultado.
    public $timestamps = false;

    // Constantes de tipos de scope
    const SCOPE_MESA = 'MESA';
    const SCOPE_PUESTO = 'PUESTO';
    const SCOPE_MUNICIPIO = 'MUNICIPIO';
    const SCOPE_DEPARTAMENTO = 'DEPARTAMENTO';

    /**
     * Relación: Candidato
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidato::class, 'candidate_id');
    }

    /**
     * Relación: Cargo electoral
     */
    public function electionPosition(): BelongsTo
    {
        return $this->belongsTo(CargoElectoral::class, 'election_position_id');
    }

    /**
     * Scope: Por tipo de scope
     */
    public function scopeByScopeType($query, string $scopeType)
    {
        return $query->where('scope_type', $scopeType);
    }

    /**
     * Scope: Por scope específico
     */
    public function scopeByScope($query, string $scopeType, int $scopeId)
    {
        return $query->where('scope_type', $scopeType)
                     ->where('scope_id', $scopeId);
    }

    /**
     * Scope: Por cargo
     */
    public function scopeByCargo($query, int $cargoId)
    {
        return $query->where('election_position_id', $cargoId);
    }

    /**
     * Scope: Por candidato
     */
    public function scopeByCandidato($query, int $candidatoId)
    {
        return $query->where('candidate_id', $candidatoId);
    }

    /**
     * Scope: Ordenar por votos descendente
     */
    public function scopeOrderByVotosDesc($query)
    {
        return $query->orderBy('votos', 'desc');
    }

    /**
     * Método estático: Obtener resultados de un scope
     */
    public static function getResultados(string $scopeType, int $scopeId, int $cargoId)
    {
        return self::byScope($scopeType, $scopeId)
            ->byCargo($cargoId)
            ->with('candidate')
            ->orderByVotosDesc()
            ->get();
    }
}
