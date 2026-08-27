<?php

namespace Database\Factories;

use App\Models\CargoElectoral;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CargoElectoral>
 */
class CargoElectoralFactory extends Factory
{
    protected $model = CargoElectoral::class;

    public function definition(): array
    {
        $cargos = [
            'Presidente' => ['tipo' => 'NACIONAL', 'nivel' => 'NACIONAL'],
            'Vicepresidente' => ['tipo' => 'NACIONAL', 'nivel' => 'NACIONAL'],
            'Senador' => ['tipo' => 'NACIONAL', 'nivel' => 'NACIONAL'],
            'Representante a la Camara' => ['tipo' => 'NACIONAL', 'nivel' => 'DEPARTAMENTAL'],
            'Gobernador' => ['tipo' => 'TERRITORIAL', 'nivel' => 'DEPARTAMENTAL'],
            'Alcalde' => ['tipo' => 'TERRITORIAL', 'nivel' => 'MUNICIPAL'],
            'Diputado' => ['tipo' => 'TERRITORIAL', 'nivel' => 'DEPARTAMENTAL'],
            'Concejal' => ['tipo' => 'TERRITORIAL', 'nivel' => 'MUNICIPAL'],
        ];

        $nombre = $this->faker->randomElement(array_keys($cargos));
        $info = $cargos[$nombre];

        return [
            'nombre' => $nombre,
            'tipo_eleccion' => $info['tipo'],
            'nivel' => $info['nivel'],
            'descripcion' => $this->faker->sentence(),
            'periodo_anos' => 4,
            'permite_reeleccion' => $this->faker->boolean(30),
        ];
    }
}
