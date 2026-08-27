<?php

namespace Database\Factories;

use App\Models\Candidato;
use App\Models\ElectionPosition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Candidato>
 */
class CandidatoFactory extends Factory
{
    protected $model = Candidato::class;

    public function definition(): array
    {
        return [
            'election_position_id' => ElectionPosition::factory(),
            'nombre' => $this->faker->name(),
            'partido_politico' => $this->faker->company(),
            'numero_tarjeton' => (string) $this->faker->numberBetween(1, 99),
            'activo' => true,
        ];
    }
}
