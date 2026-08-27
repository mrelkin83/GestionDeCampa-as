<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: PrecountMetadata (Cadena de Custodia)
 * 
 * Registra quién, cuándo, desde dónde y cómo se capturó el acta.
 * Esencial para auditoría y trazabilidad legal.
 * 
 * @property int $id
 * @property int $precount_record_id
 * @property int $reportado_por_usuario_id
 * @property string $rol
 * @property float|null $gps_lat
 * @property float|null $gps_lng
 * @property string|null $dispositivo
 * @property bool $offline
 * @property \Carbon\Carbon|null $sincronizado_at
 * @property \Carbon\Carbon $created_at
 * 
 * @property-read PrecountRecord $record
 * @property-read User $usuario
 */
class PrecountMetadata extends Model
{
    use HasFactory;

    protected $table = 'precount_metadata';
    
    protected $fillable = [
        'precount_record_id',
        'reportado_por_usuario_id',
        'rol',
        'gps_lat',
        'gps_lng',
        'dispositivo',
        'offline',
        'sincronizado_at'
    ];

    protected $casts = [
        'gps_lat' => 'decimal:8',
        'gps_lng' => 'decimal:8',
        'offline' => 'boolean',
        'sincronizado_at' => 'datetime',
    ];

    // La migración crea created_at Y updated_at vía $table->timestamps()
    // (mismo patrón de bug ya corregido en PrecountValidation/PrecountVote):
    // con $timestamps = false, created_at nunca se rellenaba -rompiendo la
    // cadena de custodia legal que este modelo dice registrar, y haciendo
    // que getTiempoSincronizacionAttribute() llamara a diffForHumans() en
    // null en cuanto offline=true y sincronizado_at tuvieran valor.

    /**
     * Relación: Acta padre
     */
    public function record(): BelongsTo
    {
        return $this->belongsTo(PrecountRecord::class, 'precount_record_id');
    }

    /**
     * Relación: Usuario reportante
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reportado_por_usuario_id');
    }

    /**
     * Accesor: Coordenadas GPS como array
     */
    public function getGpsAttribute(): ?array
    {
        if ($this->gps_lat && $this->gps_lng) {
            return [
                'lat' => $this->gps_lat,
                'lng' => $this->gps_lng
            ];
        }
        return null;
    }

    /**
     * Accesor: Tiempo de sincronización (si fue offline)
     */
    public function getTiempoSincronizacionAttribute(): ?string
    {
        if ($this->offline && $this->sincronizado_at) {
            return $this->created_at->diffForHumans($this->sincronizado_at);
        }
        return null;
    }

    /**
     * Scope: Capturas offline
     */
    public function scopeOffline($query)
    {
        return $query->where('offline', true);
    }

    /**
     * Scope: Por usuario
     */
    public function scopeByUsuario($query, int $usuarioId)
    {
        return $query->where('reportado_por_usuario_id', $usuarioId);
    }

    /**
     * Método: Marcar como sincronizado
     */
    public function marcarSincronizado(): void
    {
        $this->update(['sincronizado_at' => now()]);
    }
}
