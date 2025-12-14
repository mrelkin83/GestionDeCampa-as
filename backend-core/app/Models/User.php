<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'campaign_id',
        'telefono',
        'documento_identidad',
        'departamento_id',
        'municipio_id',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->nombre === $roleName;
    }

    public function hasPermission(string $permission): bool
    {
        if (!$this->role) {
            return false;
        }

        $permissions = $this->role->permisos ?? [];
        return in_array($permission, $permissions);
    }
}
