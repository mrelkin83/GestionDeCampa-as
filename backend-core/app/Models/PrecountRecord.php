<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: PrecountRecord (Acta de Preconteo)
 * 
 * Representa una versión de acta capturada para una mesa y cargo específico.
 * Soporta versionado: una mesa puede tener múltiples versiones del acta.
 * 
 * @property int $id
 * @property int $polling_table_id
 * @property int $election_position_id
 * @property int $version
 * @property int $total_sufragantes
 * @property int $votos_nulos
 * @property int $votos_no_marcados
 * @property string|null $observaciones
 * @property string $estado (CARGADA|OBSERVADA|VALIDADA)
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * 
 * @property-read \Illuminate\Database\Eloquent\Collection|PrecountVote[] $votes
 * @property-read \Illuminate\Database\Eloquent\Collection|PrecountEvidence[] $evidence
 * @property-read PrecountMetadata|null $metadata
 * @property-read \Illuminate\Database\Eloquent\Collection|PrecountValidation[] $validations
 * @property-read Mesa $pollingTable
 */
class PrecountRecord extends Model
{
    use HasFactory;

    protected $table = 'precount_records';
    
    protected $fillable = [
        'polling_table_id',
        'election_position_id',
        'version',
        'total_sufragantes',
        'votos_nulos',
        'votos_no_marcados',
        'observaciones',
        'estado'
    ];

    protected $casts = [
        'total_sufragantes' => 'integer',
        'votos_nulos' => 'integer',
        'votos_no_marcados' => 'integer',
        'version' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Estados posibles del acta
     */
    const ESTADO_CARGADA = 'CARGADA';
    const ESTADO_REPORTADA = 'REPORTADA';
    const ESTADO_OBSERVADA = 'OBSERVADA';
    const ESTADO_VALIDADA = 'VALIDADA';

    /**
     * Relación: Votos por candidato en esta acta
     */
    public function votes(): HasMany
    {
        return $this->hasMany(PrecountVote::class, 'precount_record_id');
    }

    /**
     * Relación: Evidencias fotográficas
     */
    public function evidence(): HasMany
    {
        return $this->hasMany(PrecountEvidence::class, 'precount_record_id');
    }

    /**
     * Relación: Metadata de captura (cadena de custodia)
     */
    public function metadata(): HasOne
    {
        return $this->hasOne(PrecountMetadata::class, 'precount_record_id');
    }

    /**
     * Relación: Validaciones automáticas
     */
    public function validations(): HasMany
    {
        return $this->hasMany(PrecountValidation::class, 'precount_record_id');
    }

    /**
     * Relación: Mesa de votación
     */
    public function pollingTable(): BelongsTo
    {
        return $this->belongsTo(Mesa::class, 'polling_table_id');
    }

    /**
     * Relación: Cargo electoral
     */
    public function electionPosition(): BelongsTo
    {
        return $this->belongsTo(CargoElectoral::class, 'election_position_id');
    }

    /**
     * Scope: Filtrar por estado
     */
    public function scopeByEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope: Filtrar por mesa
     */
    public function scopeByMesa($query, int $mesaId)
    {
        return $query->where('polling_table_id', $mesaId);
    }

    /**
     * Scope: Filtrar por cargo
     */
    public function scopeByCargo($query, int $cargoId)
    {
        return $query->where('election_position_id', $cargoId);
    }

    /**
     * Scope: Solo actas válidas (para cálculos)
     */
    public function scopeValidas($query)
    {
        return $query->where('estado', self::ESTADO_VALIDADA);
    }

    /**
     * Scope: Última versión de cada mesa+cargo
     */
    public function scopeUltimaVersion($query)
    {
        return $query->orderBy('version', 'desc');
    }

    /**
     * Accesor: Total de votos contados (candidatos + nulos + no marcados)
     */
    public function getTotalVotosAttribute(): int
    {
        $votosCandidatos = $this->votes->sum('votos');
        return $votosCandidatos + $this->votos_nulos + $this->votos_no_marcados;
    }

    /**
     * Accesor: Suma de votos por candidatos solamente
     */
    public function getVotosCandidatosAttribute(): int
    {
        return $this->votes->sum('votos');
    }

    /**
     * Accesor: Verifica si la suma es válida
     */
    public function getSumaValidaAttribute(): bool
    {
        return $this->total_votos === $this->total_sufragantes;
    }

    /**
     * Accesor: Tiene alertas críticas no resueltas
     */
    public function getTieneAlertasCriticasAttribute(): bool
    {
        return $this->validations()
            ->where('severidad', 'CRITICAL')
            ->where('resuelta', false)
            ->exists();
    }

    /**
     * Método: Determinar siguiente número de versión para una mesa+cargo
     */
    public static function siguienteVersion(int $mesaId, int $cargoId): int
    {
        $ultima = self::where('polling_table_id', $mesaId)
            ->where('election_position_id', $cargoId)
            ->max('version');
        
        return ($ultima ?? 0) + 1;
    }
}
