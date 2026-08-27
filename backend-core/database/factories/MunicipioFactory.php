<?php

namespace Database\Factories;

use App\Models\Municipio;
use App\Models\Departamento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Municipio>
 */
class MunicipioFactory extends Factory
{
    protected $model = Municipio::class;

    public function definition(): array
    {
        return [
            'codigo' => $this->faker->unique()->numerify('#####'),
            'codigo_departamento' => $this->faker->numerify('##'),
            'codigo_municipio' => $this->faker->unique()->numerify('###'),
            'nombre' => $this->faker->city(),
            'nombre_oficial' => $this->faker->city(),
            'departamento_id' => Departamento::factory(),
            'tipo' => $this->faker->randomElement(['municipio', 'distrito', 'capital']),
            'poblacion' => $this->faker->numberBetween(5000, 2000000),
            'area_km2' => $this->faker->randomFloat(2, 50, 5000),
            'altitud' => $this->faker->numberBetween(0, 3500),
        ];
    }
}
