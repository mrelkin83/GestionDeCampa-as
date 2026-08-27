<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo: MesaCargoStatus (Estado de Reporte por Mesa y Cargo)
 * 
 * Controla el estado del reporte para cada combinación mesa+cargo.
 * Una mesa puede tener múltiples cargos (Alcaldía, Concejo, etc.)
 * cada uno con su propio estado.
 * 
 * @property int $id
 * @property int $mesa_id
 * @property int $cargo_id
 * @property string $estado (PENDIENTE|REPORTADA|OBSERVADA|VALIDADA)
 * @property int|null $precount_record_id
 * @property \Carbon\Carbon|null $reportada_at
 * @property \Carbon\Carbon|null $validada_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * 
 * @property-read Mesa $mesa
 * @property-read CargoElectoral $cargo
 * @property-read PrecountRecord|null $record
 */
class MesaCargoStatus extends Model
{
    use HasFactory;

    protected $table = 'mesa_cargo_status';
    
    protected $fillable = [
        'mesa_id',
        'cargo_id',
        'estado',
        'precount_record_id',
        'reportada_at',
        'validada_at'
    ];

    protected $casts = [
        'reportada_at' => 'datetime',
        'validada_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Constantes de estados
    const ESTADO_PENDIENTE = 'PENDIENTE';
    const ESTADO_REPORTADA = 'REPORTADA';
    const ESTADO_OBSERVADA = 'OBSERVADA';
    const ESTADO_VALIDADA = 'VALIDADA';

    /**
     * Relación: Mesa
     */
    public function mesa(): BelongsTo
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }

    /**
     * Relación: Cargo electoral
     */
    public function cargo(): BelongsTo
    {
        return $this->belongsTo(CargoElectoral::class, 'cargo_id');
    }

    /**
     * Relación: Acta actual
     */
    public function record(): BelongsTo
    {
        return $this->belongsTo(PrecountRecord::class, 'precount_record_id');
    }

    /**
     * Scope: Por mesa
     */
    public function scopeByMesa($query, int $mesaId)
    {
        return $query->where('mesa_id', $mesaId);
    }

    /**
     * Scope: Por cargo
     */
    public function scopeByCargo($query, int $cargoId)
    {
        return $query->where('cargo_id', $cargoId);
    }

    /**
     * Scope: Por estado
     */
    public function scopeByEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Scope: Pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    /**
     * Scope: Reportadas (incluye observadas y validadas)
     */
    public function scopeReportadas($query)
    {
        return $query->whereIn('estado', [self::ESTADO_REPORTADA, self::ESTADO_OBSERVADA, self::ESTADO_VALIDADA]);
    }

    /**
     * Scope: Validadas
     */
    public function scopeValidadas($query)
    {
        return $query->where('estado', self::ESTADO_VALIDADA);
    }

    /**
     * Accesor: Tiempo desde que se reportó
     */
    public function getTiempoDesdeReporteAttribute(): ?string
    {
        return $this->reportada_at?->diffForHumans();
    }

    /**
     * Accesor: Color según estado (para UI)
     */
    public function getColorEstadoAttribute(): string
    {
        return match($this->estado) {
            self::ESTADO_PENDIENTE => 'gray',
            self::ESTADO_REPORTADA => 'blue',
            self::ESTADO_OBSERVADA => 'yellow',
            self::ESTADO_VALIDADA => 'green',
            default => 'gray'
        };
    }

    /**
     * Método: Marcar como reportada
     */
    public function marcarReportada(int $recordId): void
    {
        $this->update([
            'estado' => self::ESTADO_REPORTADA,
            'precount_record_id' => $recordId,
            'reportada_at' => now()
        ]);
    }

    /**
     * Método: Marcar como observada
     */
    public function marcarObservada(): void
    {
        $this->update([
            'estado' => self::ESTADO_OBSERVADA
        ]);
    }

    /**
     * Método: Marcar como validada
     */
    public function marcarValidada(): void
    {
        $this->update([
            'estado' => self::ESTADO_VALIDADA,
            'validada_at' => now()
        ]);
    }

    /**
     * Método estático: Obtener o crear estado
     */
    public static function obtenerOCrear(int $mesaId, int $cargoId): self
    {
        return self::firstOrCreate(
            [
                'mesa_id' => $mesaId,
                'cargo_id' => $cargoId
            ],
            [
                'estado' => self::ESTADO_PENDIENTE
            ]
        );
    }

    /**
     * Método estático: Estadísticas globales
     */
    public static function estadisticasGlobales(int $cargoId): array
    {
        $total = self::byCargo($cargoId)->count();
        $reportadas = self::byCargo($cargoId)->reportadas()->count();
        $validadas = self::byCargo($cargoId)->validadas()->count();
        $pendientes = $total - $reportadas;

        return [
            'total' => $total,
            'reportadas' => $reportadas,
            'validadas' => $validadas,
            'pendientes' => $pendientes,
            'porcentaje_avance' => $total > 0 ? round(($reportadas / $total) * 100, 2) : 0
        ];
    }
}
