<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Campana extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'campanas';

    protected $fillable = [
        'nombre',
        'slug',
        'cargo_electoral_id',
        'fecha_eleccion',
        'tipo_eleccion',
        'departamento_id',
        'municipio_id',
        'candidato_nombre',
        'candidato_documento',
        'partido_politico',
        'coalicion',
        'slogan',
        'logo_url',
        'colores_campana',
        'tope_gastos',
        'tope_donaciones_individuales',
        'total_donaciones',
        'total_gastos',
        'estado',
        'fecha_inicio',
        'fecha_fin',
        'votos_obtenidos',
        'porcentaje_votos',
        'resultado_ganador',
        'configuracion',
        'metadata',
    ];

    protected $casts = [
        'fecha_eleccion' => 'date',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'tope_gastos' => 'decimal:2',
        'tope_donaciones_individuales' => 'decimal:2',
        'total_donaciones' => 'decimal:2',
        'total_gastos' => 'decimal:2',
        'votos_obtenidos' => 'integer',
        'porcentaje_votos' => 'decimal:2',
        'resultado_ganador' => 'boolean',
        'colores_campana' => 'array',
        'configuracion' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Relación: Una campaña pertenece a un cargo electoral
     */
    public function cargoElectoral(): BelongsTo
    {
        return $this->belongsTo(CargoElectoral::class);
    }

    /**
     * Relación: Una campaña puede pertenecer a un departamento
     */
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class);
    }

    /**
     * Relación: Una campaña puede pertenecer a un municipio
     */
    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    /**
     * Relación: Una campaña tiene muchos usuarios (multi-tenant)
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'campana_user')
            ->withPivot('role_id', 'departamento_id', 'municipio_id', 'zona_electoral_id', 'is_active', 'fecha_asignacion')
            ->withTimestamps();
    }

    /**
     * Scope: Campañas activas
     */
    public function scopeActivas($query)
    {
        return $query->where('estado', 'activa');
    }

    /**
     * Scope: Por departamento
     */
    public function scopeDepartamento($query, int $departamentoId)
    {
        return $query->where('departamento_id', $departamentoId);
    }
}
