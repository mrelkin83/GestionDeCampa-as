<?php

namespace Database\Factories;

use App\Models\PuestoVotacion;
use App\Models\Municipio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PuestoVotacion>
 */
class PuestoVotacionFactory extends Factory
{
    protected $model = PuestoVotacion::class;

    public function definition(): array
    {
        return [
            'codigo' => $this->faker->unique()->numerify('PV-#####'),
            'municipio_id' => Municipio::factory(),
            'nombre' => $this->faker->company() . ' - Sede ' . $this->faker->buildingNumber(),
            'direccion' => $this->faker->address(),
            'barrio' => $this->faker->optional()->streetName(),
            'tipo_ubicacion' => $this->faker->randomElement(['ESCUELA', 'COLEGIO', 'UNIVERSIDAD', 'CENTRO_COMUNAL', 'IGLESIA', 'OTRO']),
            'numero_mesas' => $this->faker->numberBetween(1, 20),
            'votantes_habilitados' => $this->faker->numberBetween(100, 5000),
            'zona' => $this->faker->randomElement(['URBANA', 'RURAL']),
            'latitud' => $this->faker->latitude(),
            'longitud' => $this->faker->longitude(),
            'accesibilidad_discapacitados' => $this->faker->boolean(60),
            'transporte_publico' => $this->faker->boolean(80),
            'parqueadero' => $this->faker->boolean(40),
        ];
    }
}
