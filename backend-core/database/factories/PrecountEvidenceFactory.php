<?php

namespace Database\Factories;

use App\Models\PrecountEvidence;
use App\Models\PrecountRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrecountEvidence>
 */
class PrecountEvidenceFactory extends Factory
{
    protected $model = PrecountEvidence::class;

    public function definition(): array
    {
        return [
            'precount_record_id' => PrecountRecord::factory(),
            'imagen_url' => $this->faker->imageUrl(),
            'hash_imagen' => hash('sha256', $this->faker->sha256()),
            'ocr_text' => $this->faker->optional(0.5)->paragraph(),
            'legible' => $this->faker->boolean(80),
            'procesado' => $this->faker->boolean(70),
        ];
    }

    public function procesado(): static
    {
        return $this->state(fn (array $attributes) => [
            'procesado' => true,
            'procesado_at' => now(),
        ]);
    }

    public function ilegible(): static
    {
        return $this->state(fn (array $attributes) => [
            'legible' => false,
        ]);
    }
}
