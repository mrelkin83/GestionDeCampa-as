<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mesa extends Model
{
    use HasFactory;

    protected $table = 'mesas';

    protected $fillable = [
        'numero',
        'puesto_votacion_id',
        'genero',
        'votantes_habilitados',
        'numero_inicial',
        'numero_final',
        'es_especial',
        'tipo_especial',
        'metadata',
    ];

    protected $casts = [
        'votantes_habilitados' => 'integer',
        'numero_inicial' => 'integer',
        'numero_final' => 'integer',
        'es_especial' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Relación: Una mesa pertenece a un puesto de votación
     */
    public function puestoVotacion(): BelongsTo
    {
        return $this->belongsTo(PuestoVotacion::class);
    }

    /**
     * Scope: Filtrar por género
     */
    public function scopeGenero($query, string $genero)
    {
        return $query->where('genero', $genero);
    }

    /**
     * Scope: Solo mesas especiales
     */
    public function scopeEspeciales($query)
    {
        return $query->where('es_especial', true);
    }
}
