<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reporte extends Model
{
    use HasFactory;

    protected $fillable = [
        'campana_id',
        'generado_por_id',
        'nombre',
        'descripcion',
        'tipo',
        'formato',
        'filtros',
        'incluir_graficos',
        'incluir_tablas_detalle',
        'incluir_comparativas',
        'estado',
        'archivo_path',
        'mensaje_error',
        'fecha_generacion',
    ];

    protected $casts = [
        'filtros' => 'array',
        'incluir_graficos' => 'boolean',
        'incluir_tablas_detalle' => 'boolean',
        'incluir_comparativas' => 'boolean',
        'fecha_generacion' => 'datetime',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function generadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generado_por_id');
    }
}
