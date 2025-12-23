<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Segmento extends Model
{
    use HasFactory;

    protected $fillable = [
        'campana_id',
        'created_by_id',
        'nombre',
        'descripcion',
        'criterios',
        'total_votantes',
        'es_dinamico',
        'ultima_actualizacion',
    ];

    protected $casts = [
        'criterios' => 'array',
        'total_votantes' => 'integer',
        'es_dinamico' => 'boolean',
        'ultima_actualizacion' => 'datetime',
    ];

    /**
     * Relación: Un segmento pertenece a una campaña
     */
    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    /**
     * Relación: Creado por
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    /**
     * Relación: Votantes del segmento
     */
    public function votantes(): BelongsToMany
    {
        return $this->belongsToMany(Votante::class, 'segmento_votante')
            ->withTimestamps();
    }

    /**
     * Scope: Dinámicos
     */
    public function scopeDinamicos($query)
    {
        return $query->where('es_dinamico', true);
    }

    /**
     * Scope: Estáticos
     */
    public function scopeEstaticos($query)
    {
        return $query->where('es_dinamico', false);
    }
}
