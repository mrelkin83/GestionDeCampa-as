<?php

namespace Database\Factories;

use App\Models\MesaCargoStatus;
use App\Models\Mesa;
use App\Models\ElectionPosition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MesaCargoStatus>
 */
class MesaCargoStatusFactory extends Factory
{
    protected $model = MesaCargoStatus::class;

    public function definition(): array
    {
        return [
            'mesa_id' => Mesa::factory(),
            'cargo_id' => ElectionPosition::factory(),
            'estado' => $this->faker->randomElement(['PENDIENTE', 'REPORTADA', 'OBSERVADA', 'VALIDADA']),
        ];
    }

    public function pendiente(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'PENDIENTE',
        ]);
    }

    public function reportada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'REPORTADA',
            'reportada_at' => now(),
        ]);
    }

    public function validada(): static
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'VALIDADA',
            'reportada_at' => now()->subDay(),
            'validada_at' => now(),
        ]);
    }
}
