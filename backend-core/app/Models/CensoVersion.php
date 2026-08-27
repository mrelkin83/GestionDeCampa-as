<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CensoVersion extends Model
{
    protected $table = 'censo_versiones';

    protected $fillable = [
        'nombre',
        'codigo',
        'fecha_corte',
        'fecha_publicacion',
        'fuente',
        'total_registros',
        'estado',
        'descripcion',
        'metadata',
    ];

    protected $casts = [
        'fecha_corte' => 'date',
        'fecha_publicacion' => 'date',
        'metadata' => 'array',
    ];

    public function registros(): HasMany
    {
        return $this->hasMany(CensoElectoral::class, 'version_id');
    }

    public function importaciones(): HasMany
    {
        return $this->hasMany(CensoImportacion::class, 'version_id');
    }
}
