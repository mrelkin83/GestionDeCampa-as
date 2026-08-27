<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Postgis\PostgisTrait;

class Municipio extends Model
{
    use HasFactory, PostgisTrait;

    protected $table = 'municipios';

    protected $fillable = [
        'codigo',
        'codigo_departamento',
        'codigo_municipio',
        'nombre',
        'nombre_oficial',
        'departamento_id',
        'tipo',
        'poblacion',
        'area_km2',
        'altitud',
        'geom',
        'metadata',
    ];

    protected $casts = [
        'poblacion' => 'integer',
        'area_km2' => 'decimal:2',
        'altitud' => 'integer',
        'metadata' => 'array',
    ];

    protected $postgisFields = [
        'geom',
    ];

    /**
     * Relación: Un municipio pertenece a un departamento
     */
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class);
    }

    /**
     * Relación: Un municipio tiene muchas zonas electorales
     */
    public function zonasElectorales(): HasMany
    {
        return $this->hasMany(ZonaElectoral::class);
    }

    /**
     * Relación: Un municipio tiene muchos puestos de votación
     */
    public function puestosVotacion(): HasMany
    {
        return $this->hasMany(PuestoVotacion::class);
    }

    /**
     * Relación: Un municipio puede tener muchas campañas
     */
    public function campanas(): HasMany
    {
        return $this->hasMany(Campana::class);
    }

    /**
     * Scope: Filtrar por departamento
     */
    public function scopeDepartamento($query, int $departamentoId)
    {
        return $query->where('departamento_id', $departamentoId);
    }

    /**
     * Scope: Solo capitales
     */
    public function scopeCapitales($query)
    {
        return $query->whereIn('tipo', ['distrito', 'capital']);
    }
}
