<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampanaComunicacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'campanas_comunicacion';

    protected $fillable = [
        'campana_id',
        'template_id',
        'segmento_id',
        'created_by_id',
        'nombre',
        'descripcion',
        'canal',
        'canales',
        'asunto',
        'contenido',
        'audiencia_tipo',
        'votantes_ids',
        'total_destinatarios',
        'estado',
        'fecha_programada',
        'fecha_inicio_envio',
        'fecha_fin_envio',
        'total_enviados',
        'total_entregados',
        'total_fallidos',
        'total_abiertos',
        'total_clicks',
        'tasa_entrega',
        'tasa_apertura',
        'costo_estimado',
        'costo_real',
        'configuracion',
        'notas',
    ];

    protected $casts = [
        'canales' => 'array',
        'votantes_ids' => 'array',
        'total_destinatarios' => 'integer',
        'fecha_programada' => 'datetime',
        'fecha_inicio_envio' => 'datetime',
        'fecha_fin_envio' => 'datetime',
        'total_enviados' => 'integer',
        'total_entregados' => 'integer',
        'total_fallidos' => 'integer',
        'total_abiertos' => 'integer',
        'total_clicks' => 'integer',
        'tasa_entrega' => 'decimal:2',
        'tasa_apertura' => 'decimal:2',
        'costo_estimado' => 'decimal:2',
        'costo_real' => 'decimal:2',
        'configuracion' => 'array',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ComunicacionTemplate::class, 'template_id');
    }

    public function scopeProgramadas($query)
    {
        return $query->where('estado', 'programada');
    }

    public function scopeEnviadas($query)
    {
        return $query->where('estado', 'enviada');
    }

    public function scopePorCanal($query, string $canal)
    {
        return $query->where('canal', $canal);
    }

    public function segmento(): BelongsTo
    {
        return $this->belongsTo(Segmento::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function mensajes(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'campana_comunicacion_id');
    }
}
