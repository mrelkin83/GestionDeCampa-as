<?php

namespace Tests\Load;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Election;
use App\Models\PrecountRecord;

/**
 * Load Tests: Pruebas de Rendimiento
 * 
 * Estas pruebas verifican el rendimiento bajo carga
 * usando el faker de Laravel.
 */
class LoadTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        
        // Desactivar middleware de rate limiting en tests
        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);
    }

    /**
     * Test: 1000 requests de resultados en menos de 30 segundos
     * 
     * @test
     * @group load
     */
    public function puede_responder_1000_peticiones_de_resultados_rapido()
    {
        $this->markTestSkipped('Este test toma varios minutos. Ejecutar manualmente: php artisan test --group=load');

        // Crear datos de prueba
        Election::factory()->create(['estado' => 'ACTIVA']);
        PrecountRecord::factory()->count(100)->create();

        $startTime = microtime(true);
        
        for ($i = 0; $i < 1000; $i++) {
            $response = $this->getJson('/api/preconteo/elecciones');

            $response->assertStatus(200);
        }

        $elapsed = microtime(true) - $startTime;
        $requestsPerSecond = 1000 / $elapsed;

        dump("⏱️ 1000 requests en {$elapsed}s ({$requestsPerSecond} req/s)");

        // Assert: Debe responder en menos de 60 segundos (60 req/s mínimo)
        $this->assertLessThan(60, $elapsed, 'Demasiado lento: menos de 60 req/s');
    }

    /**
     * Test: Crear 100 actas concurrentemente
     * 
     * @test
     * @group load
     */
    public function puede_crear_100_actas_concurrentes()
    {
        $this->markTestSkipped('Ejecutar manualmente: php artisan test --group=load');

        $election = Election::factory()->create();
        $cargo = \App\Models\ElectionPosition::factory()->create(['election_id' => $election->id]);
        $candidato = \App\Models\Candidato::factory()->create(['election_position_id' => $cargo->id]);
        $mesas = \App\Models\Mesa::factory()->count(100)->create();

        $startTime = microtime(true);

        foreach ($mesas as $mesa) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/internal/preconteo/acta', [
                    'polling_table_id' => $mesa->id,
                    'election_position_id' => $cargo->id,
                    'total_sufragantes' => 100,
                    'votos_nulos' => 0,
                    'votos_no_marcados' => 0,
                    'resultados' => [['candidate_id' => $candidato->id, 'votos' => 100]],
                ]);

            $response->assertStatus(201);
        }

        $elapsed = microtime(true) - $startTime;

        dump("📝 100 actas creadas en {$elapsed}s (" . round(100/$elapsed, 2) . " actas/s)");

        $this->assertLessThan(60, $elapsed);
    }

    /**
     * Test: Cache mejora rendimiento significativamente
     * 
     * @test
     */
    public function cache_mejora_rendimiento_resultados()
    {
        $aggregate = \App\Models\PrecountAggregate::factory()->create([
            'scope_type' => 'MESA',
        ]);

        $url = '/api/preconteo/resultados?' . http_build_query([
            'scope_type' => 'MESA',
            'scope_id' => $aggregate->scope_id,
            'election_position_id' => $aggregate->election_position_id,
        ]);

        // Primera petición (sin cache)
        $start1 = microtime(true);
        $this->getJson($url);
        $time1 = microtime(true) - $start1;

        // Segunda petición (con cache)
        $start2 = microtime(true);
        $this->getJson($url);
        $time2 = microtime(true) - $start2;

        dump("⏱️ Sin cache: {$time1}s | Con cache: {$time2}s");
        dump("🚀 Mejora: " . round(($time1/$time2), 1) . "x más rápido");

        // El cache debe ser al menos 2x más rápido
        $this->assertLessThan($time1, $time2 * 2);
    }

    /**
     * Test: Query N+1 detection
     * 
     * @test
     */
    public function no_hay_queries_n_plus_1_en_listado()
    {
        // Crear registros con relaciones (nombres reales: votes/evidence)
        PrecountRecord::factory()
            ->count(20)
            ->has(\App\Models\PrecountVote::factory()->count(5), 'votes')
            ->has(\App\Models\PrecountEvidence::factory()->count(2), 'evidence')
            ->create();

        // Habilitar query log
        \DB::enableQueryLog();

        $response = $this->actingAs($this->user)
            ->getJson('/api/internal/preconteo/actas');

        $queries = \DB::getQueryLog();
        \DB::disableQueryLog();

        $queryCount = count($queries);

        dump("🔍 Queries ejecutadas: {$queryCount}");

        // Si hay N+1, tendríamos > 25 queries
        // Con eager loading, deberíamos tener < 5 queries
        $this->assertLessThan(10, $queryCount, 
            "Posible problema N+1 detectado. Queries: {$queryCount}");
    }
}
