<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Donante extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'campana_id',
        'tipo',
        'documento',
        'tipo_documento',
        'nombres',
        'apellidos',
        'razon_social',
        'nit',
        'representante_legal',
        'email',
        'telefono',
        'direccion',
        'municipio_id',
        'total_donado',
        'numero_donaciones',
        'fecha_primera_donacion',
        'fecha_ultima_donacion',
        'categoria',
        'notas',
        'acepta_publicacion',
        'es_valido',
        'razon_invalido',
    ];

    protected $casts = [
        'total_donado' => 'decimal:2',
        'numero_donaciones' => 'integer',
        'fecha_primera_donacion' => 'date',
        'fecha_ultima_donacion' => 'date',
        'acepta_publicacion' => 'boolean',
        'es_valido' => 'boolean',
    ];

    protected $appends = [
        'nombre_completo',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    public function donaciones(): HasMany
    {
        return $this->hasMany(Donacion::class);
    }

    public function getNombreCompletoAttribute(): string
    {
        if ($this->tipo === 'persona_juridica') {
            return $this->razon_social ?? 'Sin nombre';
        }
        return trim("{$this->nombres} {$this->apellidos}");
    }

    public function scopeGrandes($query, $minimo = 10000000)
    {
        return $query->where('total_donado', '>=', $minimo);
    }
}
