<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gasto extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campana_id',
        'categoria',
        'subcategoria',
        'descripcion',
        'monto',
        'moneda',
        'fecha_gasto',
        'fecha_registro',
        'proveedor',
        'nit_proveedor',
        'numero_factura',
        'metodo_pago',
        'cuenta_bancaria',
        'numero_comprobante',
        'responsable_id',
        'aprobado_por_id',
        'estado',
        'documentos_soporte',
        'notas',
        'reportado_cne',
        'fecha_reporte_cne',
        'numero_reporte_cne',
        'requiere_validacion',
        'observaciones_validacion',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'fecha_gasto' => 'date',
        'fecha_registro' => 'date',
        'documentos_soporte' => 'array',
        'reportado_cne' => 'boolean',
        'fecha_reporte_cne' => 'date',
        'requiere_validacion' => 'boolean',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function responsable(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    public function aprobadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprobado_por_id');
    }

    public function scopeAprobados($query)
    {
        return $query->where('estado', 'aprobado');
    }

    public function scopePendientesAprobacion($query)
    {
        return $query->where('estado', 'pendiente_aprobacion');
    }

    public function scopePorCategoria($query, string $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopePendientesReporte($query)
    {
        return $query->where('estado', 'aprobado')
            ->where('reportado_cne', false);
    }
}
