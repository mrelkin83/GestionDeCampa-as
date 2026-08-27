<?php

namespace Database\Factories;

use App\Models\PrecountRecord;
use App\Models\Mesa;
use App\Models\ElectionPosition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrecountRecord>
 */
class PrecountRecordFactory extends Factory
{
    protected $model = PrecountRecord::class;

    public function definition(): array
    {
        $sufragantes = $this->faker->numberBetween(150, 400);
        $nulos = $this->faker->numberBetween(0, 5);
        $blancos = $this->faker->numberBetween(0, 10);

        return [
            'polling_table_id' => Mesa::factory(),
            'election_position_id' => ElectionPosition::factory(),
            'version' => 1,
            'total_sufragantes' => $sufragantes,
            'votos_nulos' => $nulos,
            'votos_no_marcados' => $blancos,
            'observaciones' => $this->faker->optional(0.3)->sentence(),
            'estado' => $this->faker->randomElement([
                PrecountRecord::ESTADO_CARGADA,
                PrecountRecord::ESTADO_OBSERVADA,
                PrecountRecord::ESTADO_VALIDADA
            ]),
        ];
    }

    /**
     * Estado: Cargada
     */
    public function cargada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => PrecountRecord::ESTADO_CARGADA,
        ]);
    }

    /**
     * Estado: Observada
     */
    public function observada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => PrecountRecord::ESTADO_OBSERVADA,
        ]);
    }

    /**
     * Estado: Validada
     */
    public function validada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => PrecountRecord::ESTADO_VALIDADA,
        ]);
    }

    /**
     * Con versión específica
     */
    public function version(int $version): static
    {
        return $this->state(fn (array $attributes) => [
            'version' => $version,
        ]);
    }

    /**
     * Con suma válida (votos coinciden con sufragantes)
     */
    public function sumaValida(): static
    {
        return $this->state(function (array $attributes) {
            $sufragantes = $attributes['total_sufragantes'];
            $nulos = $attributes['votos_nulos'];
            $blancos = $attributes['votos_no_marcados'];

            return [
                'votos_nulos' => $nulos,
                'votos_no_marcados' => $blancos,
            ];
        });
    }

    /**
     * Con suma inválida (para testing de validaciones)
     */
    public function sumaInvalida(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'total_sufragantes' => 200,
                'votos_nulos' => 2,
                'votos_no_marcados' => 3,
            ];
        });
    }
}
