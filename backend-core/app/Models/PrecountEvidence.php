<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: PrecountEvidence (Evidencia Fotográfica del Acta)
 * 
 * @property int $id
 * @property int $precount_record_id
 * @property string $imagen_url
 * @property string $hash_imagen
 * @property string|null $ocr_text
 * @property bool $legible
 * @property \Carbon\Carbon $created_at
 * 
 * @property-read PrecountRecord $record
 */
class PrecountEvidence extends Model
{
    use HasFactory;

    protected $table = 'precount_evidence';
    
    protected $fillable = [
        'precount_record_id',
        'imagen_url',
        'thumbnail_url',
        'hash_imagen',
        'ocr_text',
        'legible',
        'tamanio_kb',
        'procesado',
        'procesado_at',
        'error_procesamiento'
    ];

    protected $casts = [
        'legible' => 'boolean',
        'tamanio_kb' => 'float',
        'procesado' => 'boolean',
        'procesado_at' => 'datetime',
    ];

    // La migración crea created_at Y updated_at vía $table->timestamps()
    // (mismo patrón de bug ya corregido en los demás modelos Precount*):
    // con $timestamps = false, created_at nunca se rellenaba.

    /**
     * Relación: Acta padre
     */
    public function record(): BelongsTo
    {
        return $this->belongsTo(PrecountRecord::class, 'precount_record_id');
    }

    /**
     * Accesor: Verificar integridad de la imagen
     */
    public function verificarIntegridad(string $contenidoArchivo): bool
    {
        $hashActual = hash('sha256', $contenidoArchivo);
        return hash_equals($this->hash_imagen, $hashActual);
    }

    /**
     * Scope: Evidencias legibles
     */
    public function scopeLegibles($query)
    {
        return $query->where('legible', true);
    }
}
