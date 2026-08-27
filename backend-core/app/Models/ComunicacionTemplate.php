<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComunicacionTemplate extends Model
{
    use HasFactory;

    protected $table = 'templates_comunicacion';

    protected $fillable = [
        'campana_id',
        'created_by_id',
        'nombre',
        'canal',
        'asunto',
        'contenido',
        'variables_disponibles',
        'activo',
        'veces_usado',
        'ultima_vez_usado',
    ];

    protected $casts = [
        'variables_disponibles' => 'array',
        'activo' => 'boolean',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function campanasComunicacion(): HasMany
    {
        return $this->hasMany(CampanaComunicacion::class, 'template_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorCanal($query, string $canal)
    {
        return $query->where('canal', $canal);
    }
}
