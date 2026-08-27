<?php

namespace Database\Factories;

use App\Models\Mesa;
use App\Models\PuestoVotacion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Mesa>
 */
class MesaFactory extends Factory
{
    protected $model = Mesa::class;

    public function definition(): array
    {
        return [
            'numero' => $this->faker->unique()->numberBetween(1, 500),
            'puesto_votacion_id' => PuestoVotacion::factory(),
            'genero' => $this->faker->randomElement(['M', 'F', 'X']),
            'votantes_habilitados' => $this->faker->numberBetween(100, 600),
            'numero_inicial' => $this->faker->numberBetween(1, 9999),
            'numero_final' => $this->faker->numberBetween(1, 9999),
            'es_especial' => false,
        ];
    }

    public function especial(): static
    {
        return $this->state(fn (array $attributes) => [
            'es_especial' => true,
            'tipo_especial' => $this->faker->randomElement(['CAR', 'FAC', 'PRI', 'JUN']),
        ]);
    }
}
