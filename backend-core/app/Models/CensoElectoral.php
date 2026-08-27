<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CensoElectoral extends Model
{
    protected $table = 'censo_electoral';

    protected $fillable = [
        'version_id',
        'documento',
        'tipo_documento',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'genero',
        'fecha_nacimiento',
        'edad',
        'departamento_id',
        'municipio_id',
        'puesto_votacion_id',
        'mesa_id',
        'numero_mesa',
        'departamento_residencia_id',
        'municipio_residencia_id',
        'direccion_residencia',
        'barrio_residencia',
        'telefono',
        'celular',
        'email',
        'estado_activo',
        'estado_registro',
        'hash_registro',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'estado_activo' => 'boolean',
    ];

    public function version(): BelongsTo
    {
        return $this->belongsTo(CensoVersion::class, 'version_id');
    }

    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamento::class, 'departamento_id');
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    public function puestoVotacion(): BelongsTo
    {
        return $this->belongsTo(PuestoVotacion::class, 'puesto_votacion_id');
    }

    public function mesa(): BelongsTo
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }
}
