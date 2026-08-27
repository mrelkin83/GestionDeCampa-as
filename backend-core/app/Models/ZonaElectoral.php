<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Postgis\PostgisTrait;

class ZonaElectoral extends Model
{
    use HasFactory, PostgisTrait;

    protected $table = 'zonas_electorales';

    protected $fillable = [
        'codigo',
        'municipio_id',
        'tipo',
        'nombre',
        'numero',
        'poblacion',
        'geom',
        'metadata',
    ];

    protected $casts = [
        'numero' => 'integer',
        'poblacion' => 'integer',
        'metadata' => 'array',
    ];

    protected $postgisFields = [
        'geom',
    ];

    /**
     * Relación: Una zona pertenece a un municipio
     */
    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    /**
     * Relación: Una zona tiene muchos puestos de votación
     */
    public function puestosVotacion(): HasMany
    {
        return $this->hasMany(PuestoVotacion::class);
    }
}
