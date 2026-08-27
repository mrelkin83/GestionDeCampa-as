<?php

namespace Database\Factories;

use App\Models\ElectionPosition;
use App\Models\Election;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ElectionPosition>
 */
class ElectionPositionFactory extends Factory
{
    protected $model = ElectionPosition::class;

    public function definition(): array
    {
        return [
            'election_id' => Election::factory(),
            'tipo' => $this->faker->randomElement(['alcaldia', 'concejo', 'gobernacion', 'asamblea']),
            'nombre' => $this->faker->sentence(2),
            'nivel' => $this->faker->randomElement(['municipal', 'departamental']),
        ];
    }
}
