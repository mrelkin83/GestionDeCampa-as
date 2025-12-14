<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'permisos',
        'nivel',
        'activo',
    ];

    protected $casts = [
        'permisos' => 'array',
        'activo' => 'boolean',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
