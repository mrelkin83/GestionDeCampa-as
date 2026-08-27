<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TopeLegal extends Model
{
    use HasFactory;

    protected $table = 'topes_legales';

    protected $fillable = [
        'campana_id',
        'tipo_eleccion',
        'nivel',
        'ano_eleccion',
        'tope_gastos',
        'tope_donaciones_individuales',
        'limite_efectivo',
        'total_donaciones_actual',
        'total_gastos_actual',
        'porcentaje_tope_gastos',
        'porcentaje_tope_donaciones',
        'alerta_80_porciento',
        'alerta_90_porciento',
        'alerta_excedido',
        'ultima_actualizacion',
    ];

    protected $casts = [
        'tope_gastos' => 'decimal:2',
        'tope_donaciones_individuales' => 'decimal:2',
        'limite_efectivo' => 'decimal:2',
        'total_donaciones_actual' => 'decimal:2',
        'total_gastos_actual' => 'decimal:2',
        'porcentaje_tope_gastos' => 'decimal:2',
        'porcentaje_tope_donaciones' => 'decimal:2',
        'alerta_80_porciento' => 'boolean',
        'alerta_90_porciento' => 'boolean',
        'alerta_excedido' => 'boolean',
        'ultima_actualizacion' => 'datetime',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }
}
