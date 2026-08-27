<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: PrecountVote (Votos por Candidato en Acta)
 * 
 * @property int $id
 * @property int $precount_record_id
 * @property int $candidate_id
 * @property int $votos
 * @property \Carbon\Carbon $created_at
 * 
 * @property-read PrecountRecord $record
 * @property-read Candidato|null $candidate
 */
class PrecountVote extends Model
{
    use HasFactory;

    protected $table = 'precount_votes';
    
    protected $fillable = [
        'precount_record_id',
        'candidate_id',
        'votos'
    ];

    protected $casts = [
        'votos' => 'integer',
    ];

    // La migración crea created_at Y updated_at vía $table->timestamps()
    // (mismo patrón de bug ya corregido en PrecountValidation): con
    // $timestamps = false, PrecountController::storeActa()'s
    // PrecountVote::create() nunca rellenaba ninguna de las dos.

    /**
     * Relación: Acta padre
     */
    public function record(): BelongsTo
    {
        return $this->belongsTo(PrecountRecord::class, 'precount_record_id');
    }

    /**
     * Relación: Candidato
     */
    public function candidate(): BelongsTo
    {
        // Asumiendo que existe modelo Candidato
        return $this->belongsTo(Candidato::class, 'candidate_id');
    }

    /**
     * Scope: Por acta
     */
    public function scopeByRecord($query, int $recordId)
    {
        return $query->where('precount_record_id', $recordId);
    }

    /**
     * Scope: Por candidato
     */
    public function scopeByCandidate($query, int $candidateId)
    {
        return $query->where('candidate_id', $candidateId);
    }
}
