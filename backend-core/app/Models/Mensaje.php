<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensaje extends Model
{
    use HasFactory;

    protected $table = 'mensajes';

    protected $fillable = [
        'campana_comunicacion_id',
        'votante_id',
        'canal',
        'destinatario',
        'asunto',
        'contenido',
        'estado',
        'fecha_envio',
        'fecha_entrega',
        'fecha_apertura',
        'fecha_click',
        'proveedor',
        'mensaje_id_externo',
        'error_mensaje',
        'metadata_proveedor',
    ];

    protected $casts = [
        'fecha_envio' => 'datetime',
        'fecha_entrega' => 'datetime',
        'fecha_apertura' => 'datetime',
        'fecha_click' => 'datetime',
        'metadata_proveedor' => 'array',
    ];

    public function campanaComunicacion(): BelongsTo
    {
        return $this->belongsTo(CampanaComunicacion::class);
    }

    public function votante(): BelongsTo
    {
        return $this->belongsTo(Votante::class);
    }

    public function scopeEnviados($query)
    {
        return $query->where('estado', 'enviado');
    }

    public function scopeEntregados($query)
    {
        return $query->where('estado', 'entregado');
    }

    public function scopeFallidos($query)
    {
        return $query->where('estado', 'fallido');
    }

    public function scopePorCanal($query, string $canal)
    {
        return $query->where('canal', $canal);
    }
}
