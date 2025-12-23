<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplateComunicacion extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'templates_comunicacion';

    protected $fillable = [
        'campana_id',
        'created_by_id',
        'nombre',
        'tipo',
        'asunto',
        'contenido',
        'variables_disponibles',
        'es_activo',
        'veces_usado',
        'ultima_vez_usado',
    ];

    protected $casts = [
        'variables_disponibles' => 'array',
        'es_activo' => 'boolean',
        'veces_usado' => 'integer',
        'ultima_vez_usado' => 'datetime',
    ];

    public function campana(): BelongsTo
    {
        return $this->belongsTo(Campana::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function campanasComunicacion(): HasMany
    {
        return $this->hasMany(CampanaComunicacion::class, 'template_id');
    }

    /**
     * Procesar template con variables
     */
    public function procesar(array $variables): string
    {
        $contenido = $this->contenido;
        foreach ($variables as $key => $value) {
            $contenido = str_replace('{' . $key . '}', $value, $contenido);
        }
        return $contenido;
    }
}
