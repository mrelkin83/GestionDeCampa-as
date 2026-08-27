<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'email',
        'password',
        'first_name',
        'last_name',
        'phone',
        'document_type',
        'document_number',
        'role_id',
        'avatar_url',
        'is_active',
        'email_verified_at',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    public function campanas(): BelongsToMany
    {
        return $this->belongsToMany(Campana::class, 'campana_user');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function hasPermission(string $permission): bool
    {
        if (!$this->role) {
            return false;
        }

        $permissions = $this->role->permissions ?? [];

        if (in_array('*', $permissions, true)) {
            return true;
        }

        foreach ($permissions as $granted) {
            if ($granted === $permission) {
                return true;
            }

            // Soporte de comodín "modulo.*": antes esto se guardaba en
            // roles.permissions (p. ej. admin_campana tiene 'donaciones.*')
            // pero hasPermission() solo comparaba igualdad exacta de string,
            // así que ningún permiso con comodín coincidía jamás.
            if (str_ends_with($granted, '.*') && str_starts_with($permission, substr($granted, 0, -1))) {
                return true;
            }
        }

        return false;
    }

    public function hasAccessToCampana(int $campanaId): bool
    {
        if ($this->role && $this->role->name === 'super_admin') {
            return true;
        }

        return $this->campanas()
            ->where('campanas.id', $campanaId)
            ->wherePivot('is_active', true)
            ->exists();
    }
}
