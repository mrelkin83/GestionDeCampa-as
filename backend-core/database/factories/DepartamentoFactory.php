<?php

namespace Database\Factories;

use App\Models\Departamento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Departamento>
 */
class DepartamentoFactory extends Factory
{
    protected $model = Departamento::class;

    public function definition(): array
    {
        $departamentos = [
            ['codigo' => '05', 'nombre' => 'Antioquia', 'capital' => 'Medellin'],
            ['codigo' => '08', 'nombre' => 'Atlantico', 'capital' => 'Barranquilla'],
            ['codigo' => '11', 'nombre' => 'Bogota D.C.', 'capital' => 'Bogota'],
            ['codigo' => '13', 'nombre' => 'Bolivar', 'capital' => 'Cartagena'],
            ['codigo' => '15', 'nombre' => 'Boyaca', 'capital' => 'Tunja'],
            ['codigo' => '17', 'nombre' => 'Caldas', 'capital' => 'Manizales'],
            ['codigo' => '19', 'nombre' => 'Cauca', 'capital' => 'Popayan'],
            ['codigo' => '23', 'nombre' => 'Cordoba', 'capital' => 'Monteria'],
            ['codigo' => '25', 'nombre' => 'Cundinamarca', 'capital' => 'Bogota'],
            ['codigo' => '27', 'nombre' => 'Choco', 'capital' => 'Quibdo'],
            ['codigo' => '52', 'nombre' => 'Narino', 'capital' => 'Pasto'],
            ['codigo' => '68', 'nombre' => 'Santander', 'capital' => 'Bucaramanga'],
        ];

        $depto = $this->faker->randomElement($departamentos);

        return [
            // codigo tiene constraint unique: no reusar el código fijo del
            // pool (con solo 12 valores, cualquier test que cree más de un
            // par de departamentos -directa o transitivamente vía Municipio/
            // PuestoVotacion/Mesa- colisiona con "duplicate key" casi
            // garantizado). unique() hace que Faker lance si se agotan los
            // valores en vez de repetir uno silenciosamente.
            'codigo' => $this->faker->unique()->numerify('##'),
            'nombre' => $depto['nombre'],
            'nombre_oficial' => $depto['nombre'],
            'capital' => $depto['capital'],
            'poblacion' => $this->faker->numberBetween(100000, 8000000),
            'area_km2' => $this->faker->randomFloat(2, 1000, 100000),
            'region' => $this->faker->randomElement(['Andina', 'Caribe', 'Pacifica', 'Orinoquia', 'Amazonia', 'Insular']),
        ];
    }
}
