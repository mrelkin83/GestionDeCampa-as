<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: PrecountValidation (Validaciones Automáticas del Acta)
 * 
 * Almacena alertas generadas automáticamente al validar un acta.
 * 
 * @property int $id
 * @property int $precount_record_id
 * @property string $tipo
 * @property string $severidad
 * @property string $mensaje
 * @property bool $resuelta
 * @property \Carbon\Carbon|null $resuelta_at
 * @property int|null $resuelta_por
 * @property \Carbon\Carbon $created_at
 * 
 * @property-read PrecountRecord $record
 * @property-read User|null $resueltaPorUsuario
 */
class PrecountValidation extends Model
{
    use HasFactory;

    protected $table = 'precount_validations';
    
    protected $fillable = [
        'precount_record_id',
        'tipo',
        'severidad',
        'mensaje',
        'resuelta',
        'resuelta_at',
        'resuelta_por'
    ];

    protected $casts = [
        'resuelta' => 'boolean',
        'resuelta_at' => 'datetime',
    ];

    // La migración real crea created_at Y updated_at vía $table->timestamps()
    // (no solo created_at, pese a lo que decía este comentario). Con
    // $timestamps = false, Eloquent nunca los rellenaba: cada alerta creada
    // en el sistema (las 3 generadas en PrecountController::ejecutarValidaciones)
    // quedaba con created_at NULL para siempre.

    // Constantes de tipos de validación
    const TIPO_SUMA_INVALIDA = 'SUMA_INVALIDA';
    const TIPO_VOTOS_SUPERAN_SUFRAGANTES = 'VOTOS_SUPERAN_SUFRAGANTES';
    const TIPO_ACTA_ILEGIBLE = 'ACTA_ILEGIBLE';
    const TIPO_MESA_DUPLICADA = 'MESA_DUPLICADA';
    const TIPO_VERSION_DUPLICADA = 'VERSION_DUPLICADA';

    // Constantes de severidad
    const SEVERIDAD_INFO = 'INFO';
    const SEVERIDAD_WARNING = 'WARNING';
    const SEVERIDAD_CRITICAL = 'CRITICAL';

    /**
     * Relación: Acta padre
     */
    public function record(): BelongsTo
    {
        return $this->belongsTo(PrecountRecord::class, 'precount_record_id');
    }

    /**
     * Relación: Usuario que resolvió
     */
    public function resueltaPorUsuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resuelta_por');
    }

    /**
     * Scope: Validaciones pendientes (no resueltas)
     */
    public function scopePendientes($query)
    {
        return $query->where('resuelta', false);
    }

    /**
     * Scope: Por severidad
     */
    public function scopeBySeveridad($query, string $severidad)
    {
        return $query->where('severidad', $severidad);
    }

    /**
     * Scope: Críticas no resueltas
     */
    public function scopeCriticasPendientes($query)
    {
        return $query->where('severidad', self::SEVERIDAD_CRITICAL)
                     ->where('resuelta', false);
    }

    /**
     * Scope: Por tipo
     */
    public function scopeByTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Método: Marcar como resuelta
     */
    public function resolver(int $usuarioId): void
    {
        $this->update([
            'resuelta' => true,
            'resuelta_at' => now(),
            'resuelta_por' => $usuarioId
        ]);
    }

    /**
     * Accesor: Es crítica
     */
    public function getEsCriticaAttribute(): bool
    {
        return $this->severidad === self::SEVERIDAD_CRITICAL;
    }

    /**
     * Accesor: Icono según tipo
     */
    public function getIconoAttribute(): string
    {
        return match($this->tipo) {
            self::TIPO_SUMA_INVALIDA => 'calculator',
            self::TIPO_VOTOS_SUPERAN_SUFRAGANTES => 'warning',
            self::TIPO_ACTA_ILEGIBLE => 'eye-off',
            self::TIPO_MESA_DUPLICADA => 'copy',
            self::TIPO_VERSION_DUPLICADA => 'git-commit',
            default => 'alert-circle'
        };
    }
}
