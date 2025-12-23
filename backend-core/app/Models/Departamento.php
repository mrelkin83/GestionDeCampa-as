<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Phaza\LaravelPostgis\Eloquent\PostgisTrait;

class Departamento extends Model
{
    use HasFactory, PostgisTrait;

    protected $table = 'departamentos';

    protected $fillable = [
        'codigo',
        'nombre',
        'nombre_oficial',
        'capital',
        'poblacion',
        'area_km2',
        'region',
        'geom',
        'metadata',
    ];

    protected $casts = [
        'poblacion' => 'integer',
        'area_km2' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected $postgisFields = [
        'geom',
    ];

    /**
     * Relación: Un departamento tiene muchos municipios
     */
    public function municipios(): HasMany
    {
        return $this->hasMany(Municipio::class);
    }

    /**
     * Relación: Un departamento puede tener muchas campañas
     */
    public function campanas(): HasMany
    {
        return $this->hasMany(Campana::class);
    }

    /**
     * Scope: Filtrar por región
     */
    public function scopeRegion($query, string $region)
    {
        return $query->where('region', $region);
    }

    /**
     * Scope: Ordenar por población descendente
     */
    public function scopeByPoblacion($query)
    {
        return $query->orderBy('poblacion', 'desc');
    }
}
