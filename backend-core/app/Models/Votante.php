<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Votante extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campana_id',
        'censo_id',
        'documento',
        'tipo_documento',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'genero',
        'fecha_nacimiento',
        'edad',
        'celular',
        'telefono',
        'email',
        'direccion',
        'barrio',
        'departamento_id',
        'municipio_id',
        'zona_electoral_id',
        'puesto_votacion_id',
        'mesa_id',
        'intencion_voto',
        'probabilidad_voto',
        'scoring',
        'intereses',
        'observaciones',
        'es_lider',
        'tipo_lider',
        'alcance_estimado',
        'lider_asignado_id',
        'tags',
        'ocupacion',
        'nivel_educativo',
        'estrato_socioeconomico',
        'numero_contactos',
        'ultimo_contacto',
        'ultima_actualizacion_datos',
        'acepta_comunicaciones',
        'canales_preferidos',
        'estado',
        'es_verificado',
        'verificado_por_id',
        'fecha_verificacion',
        'datos_adicionales',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'edad' => 'integer',
        'probabilidad_voto' => 'integer',
        'scoring' => 'integer',
        'intereses' => 'array',
        'es_lider' => 'boolean',
        'alcance_estimado' => 'integer',
        'tags' => 'array',
        'estrato_socioeconomico' => 'decimal:1',
        'numero_contactos' => 'integer',
        'ultimo_contacto' => 'datetime',
        'ultima_actualizacion_datos' => 'datetime',
        'acepta_comunicaciones' => 'boolean',
        'canales_preferidos' => 'array',
        'es_verificado' => 'boolean',
        'fecha_verificacion' => 'datetime',
        'datos_adicionales' => 'array',
    ];

    protected $appends = [
        'nombre_completo',
    ];

    /**
     * Relación: Un votante pertenece a una campaña
     */
    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    /**
     * Relación: Un votante puede estar vinculado al censo
     */
    public function censo(): BelongsTo
    {
        return $this->belongsTo(CensoElectoral::class, 'censo_id');
    }

    /**
     * Relación: Ubicación
     */
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class);
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    public function zonaElectoral(): BelongsTo
    {
        return $this->belongsTo(ZonaElectoral::class);
    }

    public function puestoVotacion(): BelongsTo
    {
        return $this->belongsTo(PuestoVotacion::class);
    }

    public function mesa(): BelongsTo
    {
        return $this->belongsTo(Mesa::class);
    }

    /**
     * Relación: Liderazgo
     */
    public function liderAsignado(): BelongsTo
    {
        return $this->belongsTo(Votante::class, 'lider_asignado_id');
    }

    public function subordinados(): HasMany
    {
        return $this->hasMany(Votante::class, 'lider_asignado_id');
    }

    /**
     * Relación: Verificación
     */
    public function verificadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verificado_por_id');
    }

    /**
     * Relación: Contactos
     */
    public function contactos(): HasMany
    {
        return $this->hasMany(Contacto::class);
    }

    /**
     * Relación: Segmentos
     */
    public function segmentos(): BelongsToMany
    {
        return $this->belongsToMany(Segmento::class, 'segmento_votante')
            ->withTimestamps();
    }

    /**
     * Accessor: Nombre completo
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->primer_nombre,
            $this->segundo_nombre,
            $this->primer_apellido,
            $this->segundo_apellido,
        ])));
    }

    /**
     * Scope: Filtrar por campaña
     */
    public function scopeCampana($query, int $campanaId)
    {
        return $query->where('campana_id', $campanaId);
    }

    /**
     * Scope: Solo líderes
     */
    public function scopeLideres($query)
    {
        return $query->where('es_lider', true);
    }

    /**
     * Scope: Por intención de voto
     */
    public function scopeIntencionVoto($query, string $intencion)
    {
        return $query->where('intencion_voto', $intencion);
    }

    /**
     * Scope: Activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope: Alto scoring
     */
    public function scopeAltoScoring($query, int $minimo = 70)
    {
        return $query->where('scoring', '>=', $minimo);
    }
}
