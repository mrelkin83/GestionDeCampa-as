<?php

namespace Database\Factories;

use App\Models\Election;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Election>
 */
class ElectionFactory extends Factory
{
    protected $model = Election::class;

    public function definition(): array
    {
        return [
            'year' => $this->faker->numberBetween(2023, 2027),
            'tipo' => $this->faker->randomElement(['territorial', 'legislativa', 'presidencial']),
            'fecha' => $this->faker->date(),
            'nombre' => $this->faker->sentence(3),
            'activa' => true,
        ];
    }
}
