<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CargoElectoral extends Model
{
    use HasFactory;

    protected $table = 'cargos_electorales';

    protected $fillable = [
        'nombre',
        'tipo_eleccion',
        'nivel',
        'descripcion',
        'periodo_anos',
        'permite_reeleccion',
        'requisitos',
    ];

    protected $casts = [
        'periodo_anos' => 'integer',
        'permite_reeleccion' => 'boolean',
        'requisitos' => 'array',
    ];

    /**
     * Relación: Un cargo tiene muchas campañas
     */
    public function campanas(): HasMany
    {
        return $this->hasMany(Campana::class);
    }
}
