<?php

namespace Database\Factories;

use App\Models\PrecountVote;
use App\Models\PrecountRecord;
use App\Models\Candidato;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrecountVote>
 */
class PrecountVoteFactory extends Factory
{
    protected $model = PrecountVote::class;

    public function definition(): array
    {
        return [
            'precount_record_id' => PrecountRecord::factory(),
            'candidate_id' => Candidato::factory(),
            'votos' => $this->faker->numberBetween(0, 150),
        ];
    }

    /**
     * Para candidato específico
     */
    public function forCandidate(int $candidateId): static
    {
        return $this->state(fn (array $attributes) => [
            'candidate_id' => $candidateId,
        ]);
    }

    /**
     * Cantidad de votos específica
     */
    public function withVotes(int $votes): static
    {
        return $this->state(fn (array $attributes) => [
            'votos' => $votes,
        ]);
    }
}
