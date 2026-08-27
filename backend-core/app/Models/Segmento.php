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

    protected $appends = ['tipo'];

    /**
     * Accesor de compatibilidad: el frontend y la API trabajan con
     * tipo=dinamico|estatico (así se expuso siempre el contrato), pero la
     * tabla solo tiene la columna booleana es_dinamico.
     */
    public function getTipoAttribute(): string
    {
        return $this->es_dinamico ? 'dinamico' : 'estatico';
    }

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
        // segmento_votante no tiene created_at/updated_at (solo un único
        // 'agregado_en' con default a nivel de BD) -withTimestamps() asumía
        // el par estándar y rompía cualquier sync()/attach()/eager-load.
        return $this->belongsToMany(Votante::class, 'segmento_votante')
            ->withPivot('agregado_en');
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
