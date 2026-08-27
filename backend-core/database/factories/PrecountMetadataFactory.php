<?php

namespace Database\Factories;

use App\Models\PrecountMetadata;
use App\Models\PrecountRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrecountMetadata>
 */
class PrecountMetadataFactory extends Factory
{
    protected $model = PrecountMetadata::class;

    public function definition(): array
    {
        return [
            'precount_record_id' => PrecountRecord::factory(),
            'reportado_por_usuario_id' => User::factory(),
            'rol' => $this->faker->randomElement(['testigo', 'coordinador', 'admin']),
            'gps_lat' => $this->faker->latitude(4.5, 4.8),
            'gps_lng' => $this->faker->longitude(-74.2, -74.0),
            'dispositivo' => $this->faker->userAgent(),
            'offline' => $this->faker->boolean(30),
            'sincronizado_at' => fn (array $attributes) => $attributes['offline'] ? now() : null,
        ];
    }

    /**
     * Captura offline
     */
    public function offline(): static
    {
        return $this->state(fn (array $attributes) => [
            'offline' => true,
            'sincronizado_at' => now(),
        ]);
    }

    /**
     * Captura online (tiempo real)
     */
    public function online(): static
    {
        return $this->state(fn (array $attributes) => [
            'offline' => false,
            'sincronizado_at' => null,
        ]);
    }

    /**
     * Sin GPS
     */
    public function sinGps(): static
    {
        return $this->state(fn (array $attributes) => [
            'gps_lat' => null,
            'gps_lng' => null,
        ]);
    }
}
