<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Candidato extends Model
{
    use HasFactory;

    protected $table = 'candidates';

    protected $fillable = [
        'election_position_id',
        'nombre',
        'partido_politico',
        'numero_tarjeton',
        'foto_url',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function electionPosition(): BelongsTo
    {
        return $this->belongsTo(ElectionPosition::class, 'election_position_id');
    }
}
