<?php

namespace Database\Factories;

use App\Models\PrecountValidation;
use App\Models\PrecountRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrecountValidation>
 */
class PrecountValidationFactory extends Factory
{
    protected $model = PrecountValidation::class;

    public function definition(): array
    {
        $tipos = ['SUMA_INVALIDA', 'VOTOS_SUPERAN_SUFRAGANTES', 'ACTA_ILEGIBLE', 'MESA_DUPLICADA', 'VERSION_DUPLICADA'];
        $severidades = ['INFO', 'WARNING', 'CRITICAL'];

        return [
            'precount_record_id' => PrecountRecord::factory(),
            'tipo' => $this->faker->randomElement($tipos),
            'severidad' => $this->faker->randomElement($severidades),
            'mensaje' => $this->faker->sentence(),
            'resuelta' => false,
        ];
    }

    public function critica(): static
    {
        return $this->state(fn (array $attributes) => [
            'severidad' => 'CRITICAL',
        ]);
    }

    public function resuelta(): static
    {
        return $this->state(fn (array $attributes) => [
            'resuelta' => true,
            'resuelta_at' => now(),
        ]);
    }
}
