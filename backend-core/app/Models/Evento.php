<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Support\Postgis\PostgisTrait;
use Illuminate\Support\Str;

class Evento extends Model
{
    use HasFactory, SoftDeletes, PostgisTrait;

    protected $fillable = [
        'campana_id',
        'created_by_id',
        'nombre',
        'descripcion',
        'tipo',
        'fecha_inicio',
        'fecha_fin',
        'duracion_estimada',
        'ubicacion_nombre',
        'direccion',
        'municipio_id',
        'zona_electoral_id',
        'latitud',
        'longitud',
        'location',
        'capacidad_maxima',
        'meta_asistentes',
        'total_confirmados',
        'total_asistentes',
        'total_ausentes',
        'coordinador_id',
        'responsables_ids',
        'agenda',
        'materiales_necesarios',
        'estado',
        'presupuesto_estimado',
        'costo_real',
        'qr_code_url',
        'qr_code_token',
        'notas_finales',
        'calificacion',
        'fotos_urls',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'duracion_estimada' => 'integer',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'capacidad_maxima' => 'integer',
        'meta_asistentes' => 'integer',
        'total_confirmados' => 'integer',
        'total_asistentes' => 'integer',
        'total_ausentes' => 'integer',
        'responsables_ids' => 'array',
        'presupuesto_estimado' => 'decimal:2',
        'costo_real' => 'decimal:2',
        'calificacion' => 'decimal:1',
        'fotos_urls' => 'array',
    ];

    protected $postgisFields = [
        'location',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($evento) {
            if (!$evento->qr_code_token) {
                $evento->qr_code_token = Str::random(32);
            }
        });
    }

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function coordinador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinador_id');
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    public function zonaElectoral(): BelongsTo
    {
        return $this->belongsTo(ZonaElectoral::class);
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(EventoAsistencia::class);
    }

    public function scopeProximos($query)
    {
        return $query->where('fecha_inicio', '>', now())
            ->whereIn('estado', ['planificado', 'confirmado'])
            ->orderBy('fecha_inicio', 'asc');
    }

    public function scopeFinalizados($query)
    {
        return $query->where('estado', 'finalizado');
    }
}
