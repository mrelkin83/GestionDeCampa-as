<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'donaciones';

    protected $fillable = [
        'campana_id',
        'donante_id',
        'registrado_por_id',
        'monto',
        'moneda',
        'tipo',
        'fecha_donacion',
        'fecha_registro',
        'concepto',
        'numero_comprobante',
        'numero_cuenta_destino',
        'descripcion_especie',
        'valor_estimado_especie',
        'documentos_soporte',
        'recibo_url',
        'estado',
        'notas',
        'reportada_cne',
        'fecha_reporte_cne',
        'numero_reporte_cne',
        'excede_tope_individual',
        'requiere_validacion',
        'observaciones_validacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_donacion' => 'date',
        'fecha_registro' => 'date',
        'valor_estimado_especie' => 'decimal:2',
        'documentos_soporte' => 'array',
        'reportada_cne' => 'boolean',
        'fecha_reporte_cne' => 'date',
        'excede_tope_individual' => 'boolean',
        'requiere_validacion' => 'boolean',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function donante(): BelongsTo
    {
        return $this->belongsTo(Donante::class);
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_id');
    }

    public function scopeConfirmadas($query)
    {
        return $query->where('estado', 'confirmada');
    }

    public function scopePendientesReporte($query)
    {
        return $query->where('estado', 'confirmada')
            ->where('reportada_cne', false);
    }
}
