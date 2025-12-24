<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventoAsistencia extends Model
{
    use HasFactory;

    protected $table = 'eventos_asistencia';

    protected $fillable = [
        'evento_id',
        'votante_id',
        'confirmado',
        'fecha_confirmacion',
        'medio_confirmacion',
        'asistio',
        'fecha_checkin',
        'metodo_checkin',
        'registrado_por_id',
        'checkin_latitud',
        'checkin_longitud',
        'notas',
        'trajo_acompanantes',
        'numero_acompanantes',
    ];

    protected $casts = [
        'confirmado' => 'boolean',
        'fecha_confirmacion' => 'datetime',
        'asistio' => 'boolean',
        'fecha_checkin' => 'datetime',
        'checkin_latitud' => 'decimal:7',
        'checkin_longitud' => 'decimal:7',
        'trajo_acompanantes' => 'boolean',
        'numero_acompanantes' => 'integer',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Evento::class);
    }

    public function votante(): BelongsTo
    {
        return $this->belongsTo(Votante::class);
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_id');
    }
}
