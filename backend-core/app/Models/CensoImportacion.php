<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CensoImportacion extends Model
{
    protected $table = 'censo_importaciones';

    protected $fillable = [
        'version_id',
        'user_id',
        'archivo_original',
        'archivo_s3_key',
        'total_filas',
        'filas_exitosas',
        'filas_errores',
        'filas_duplicadas',
        'estado',
        'progreso_porcentaje',
        'mensaje_error',
        'errores_detalle',
        'estadisticas',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'errores_detalle' => 'array',
        'estadisticas' => 'array',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(CensoVersion::class, 'version_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
