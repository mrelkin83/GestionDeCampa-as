<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'tipo_eleccion',
        'ano_eleccion',
        'fecha_eleccion',
        'candidato_principal',
        'partido_politico',
        'circunscripcion_id',
        'activa',
        'configuracion',
        'metadata',
    ];

    protected $casts = [
        'fecha_eleccion' => 'date',
        'activa' => 'boolean',
        'configuracion' => 'array',
        'metadata' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function circunscripcion()
    {
        return $this->belongsTo(Circunscripcion::class, 'circunscripcion_id', 'id', 'electoral');
    }
}
