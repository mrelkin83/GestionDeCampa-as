<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contacto extends Model
{
    use HasFactory;

    protected $fillable = [
        'campana_id',
        'votante_id',
        'user_id',
        'tipo',
        'resultado',
        'notas',
        'datos_adicionales',
        'intencion_voto_antes',
        'intencion_voto_despues',
        'cambio_datos_contacto',
        'requiere_seguimiento',
        'fecha_seguimiento',
        'asignado_a_id',
    ];

    protected $casts = [
        'datos_adicionales' => 'array',
        'cambio_datos_contacto' => 'boolean',
        'requiere_seguimiento' => 'boolean',
        'fecha_seguimiento' => 'date',
    ];

    /**
     * Relación: Un contacto pertenece a una campaña
     */
    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    /**
     * Relación: Un contacto es con un votante
     */
    public function votante(): BelongsTo
    {
        return $this->belongsTo(Votante::class);
    }

    /**
     * Relación: Un contacto es realizado por un usuario
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación: Asignado a
     */
    public function asignadoA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_a_id');
    }

    /**
     * Scope: Por tipo
     */
    public function scopeTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope: Requieren seguimiento
     */
    public function scopeRequierenSeguimiento($query)
    {
        return $query->where('requiere_seguimiento', true);
    }
}
