<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Postgis\PostgisTrait;

class PuestoVotacion extends Model
{
    use HasFactory, PostgisTrait;

    protected $table = 'puestos_votacion';

    protected $fillable = [
        'codigo',
        'municipio_id',
        'zona_electoral_id',
        'nombre',
        'direccion',
        'barrio',
        'tipo_ubicacion',
        'numero_mesas',
        'votantes_habilitados',
        'zona',
        'latitud',
        'longitud',
        'location',
        'accesibilidad_discapacitados',
        'transporte_publico',
        'parqueadero',
        'observaciones',
        'metadata',
    ];

    protected $casts = [
        'numero_mesas' => 'integer',
        'votantes_habilitados' => 'integer',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'accesibilidad_discapacitados' => 'boolean',
        'transporte_publico' => 'boolean',
        'parqueadero' => 'boolean',
        'metadata' => 'array',
    ];

    protected $postgisFields = [
        'location',
    ];

    protected static function booted(): void
    {
        // cercanos() filtra por whereNotNull('location') y hace ST_DWithin
        // sobre esa columna PostGIS -pero nada la derivaba nunca de
        // latitud/longitud, los campos que sí se usan al crear/editar un
        // puesto normalmente (API, seeders, importación). Sin esto, todo
        // puesto con coordenadas válidas quedaba invisible para la búsqueda
        // de "puestos cercanos" salvo que alguien fijara 'location' a mano
        // con un WKT.
        static::saving(function (self $puesto) {
            if ($puesto->isDirty(['latitud', 'longitud']) && $puesto->latitud !== null && $puesto->longitud !== null) {
                $puesto->location = "POINT({$puesto->longitud} {$puesto->latitud})";
            }
        });
    }

    /**
     * Relación: Un puesto pertenece a un municipio
     */
    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    /**
     * Relación: Un puesto puede pertenecer a una zona electoral
     */
    public function zonaElectoral(): BelongsTo
    {
        return $this->belongsTo(ZonaElectoral::class);
    }

    /**
     * Relación: Un puesto tiene muchas mesas
     */
    public function mesas(): HasMany
    {
        return $this->hasMany(Mesa::class);
    }
}
