<?php

namespace Database\Factories;

use App\Models\PrecountAggregate;
use App\Models\ElectionPosition;
use App\Models\Candidato;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrecountAggregate>
 */
class PrecountAggregateFactory extends Factory
{
    protected $model = PrecountAggregate::class;

    public function definition(): array
    {
        return [
            'scope_type' => $this->faker->randomElement(['MESA', 'PUESTO', 'MUNICIPIO', 'DEPARTAMENTO']),
            'scope_id' => $this->faker->numberBetween(1, 1000),
            'election_position_id' => ElectionPosition::factory(),
            'candidate_id' => Candidato::factory(),
            'votos' => $this->faker->numberBetween(0, 500),
            'porcentaje' => $this->faker->randomFloat(2, 0, 100),
        ];
    }
}
