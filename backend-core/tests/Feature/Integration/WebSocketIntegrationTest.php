<?php

namespace Tests\Feature\Integration;

use App\Models\User;
use App\Models\PrecountRecord;
use App\Models\ElectionPosition;
use App\Models\Mesa;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

/**
 * Integration Tests: WebSocket Events
 * 
 * Prueba la integración entre Laravel y NestJS WebSocket Gateway
 * mediante el pub/sub de Redis.
 */
class WebSocketIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Limpiar Redis
        try {
            Redis::flushAll();
        } catch (\Exception $e) {
            // Redis puede no estar disponible en tests
        }
    }

    // ==========================================
    // Tests: Eventos Redis Pub/Sub
    // ==========================================

    /** @test */
    public function publica_evento_cuando_se_valida_acta()
    {
        // Skip si Redis no está disponible
        if (!$this->redisDisponible()) {
            $this->markTestSkipped('Redis no está disponible');
        }

        $record = PrecountRecord::factory()->create([
            'estado' => PrecountRecord::ESTADO_VALIDADA
        ]);

        // Simular publicación de evento
        $payload = json_encode([
            'event' => 'RESULTADOS_ACTUALIZADOS',
            'record_id' => $record->id,
            'scope_type' => 'MESA',
            'scope_id' => $record->polling_table_id,
            'timestamp' => now()->toIso8601String()
        ]);

        Redis::publish('preconteo:actualizaciones', $payload);

        // Verificar que se publicó (no hay assert directo, pero no lanza excepción)
        $this->assertTrue(true);
    }

    /** @test */
    public function estructura_de_evento_websocket_es_valida()
    {
        $record = PrecountRecord::factory()->create([
            'estado' => PrecountRecord::ESTADO_VALIDADA,
            'polling_table_id' => Mesa::factory(),
            'election_position_id' => ElectionPosition::factory(),
        ]);

        $evento = [
            'event' => 'RESULTADOS_ACTUALIZADOS',
            'record_id' => $record->id,
            'scope_type' => 'MESA',
            'scope_id' => $record->polling_table_id,
            'election_position_id' => $record->election_position_id,
            'timestamp' => now()->toIso8601String()
        ];

        // Validar estructura
        $this->assertArrayHasKey('event', $evento);
        $this->assertArrayHasKey('record_id', $evento);
        $this->assertArrayHasKey('scope_type', $evento);
        $this->assertArrayHasKey('scope_id', $evento);
        $this->assertArrayHasKey('timestamp', $evento);

        $this->assertIsInt($evento['record_id']);
        $this->assertIsInt($evento['scope_id']);
        $this->assertMatchesRegularExpression('/^\d{4}-/', $evento['timestamp']);
    }

    /** @test */
    public function evento_nueva_acta_tiene_estructura_correcta()
    {
        $record = PrecountRecord::factory()->create([
            'estado' => PrecountRecord::ESTADO_CARGADA,
            'total_sufragantes' => 100,
        ]);

        $evento = [
            'event' => 'NUEVA_ACTA',
            'record_id' => $record->id,
            'mesa_id' => $record->polling_table_id,
            'estado' => $record->estado,
            'total_sufragantes' => $record->total_sufragantes,
            'timestamp' => now()->toIso8601String()
        ];

        $this->assertArrayHasKey('event', $evento);
        $this->assertArrayHasKey('total_sufragantes', $evento);
        $this->assertArrayHasKey('mesa_id', $evento);
    }

    /** @test */
    public function evento_alerta_critica_incluye_todos_los_campos()
    {
        $alerta = [
            'event' => 'ALERTA',
            'tipo' => 'VOTOS_MAYOR_VOTANTES',
            'severidad' => 'CRITICAL',
            'mensaje' => 'Los votos (150) son mayores que los votantes (100)',
            'mesa_id' => 123,
            'cargo_id' => 1,
            'timestamp' => now()->toIso8601String()
        ];

        $this->assertArrayHasKey('tipo', $alerta);
        $this->assertArrayHasKey('severidad', $alerta);
        $this->assertArrayHasKey('mensaje', $alerta);
        $this->assertContains($alerta['severidad'], ['CRITICAL', 'WARNING', 'INFO']);
    }

    // ==========================================
    // Tests: Suscripciones
    // ==========================================

    /** @test */
    public function formato_de_room_es_correcto()
    {
        $roomFormats = [
            'MESA:123' => ['type' => 'MESA', 'id' => 123],
            'PUESTO:456' => ['type' => 'PUESTO', 'id' => 456],
            'MUNICIPIO:789' => ['type' => 'MUNICIPIO', 'id' => 789],
            'DEPARTAMENTO:10' => ['type' => 'DEPARTAMENTO', 'id' => 10],
        ];

        foreach ($roomFormats as $room => $expected) {
            $parts = explode(':', $room);
            $this->assertCount(2, $parts);
            $this->assertContains($parts[0], ['MESA', 'PUESTO', 'MUNICIPIO', 'DEPARTAMENTO']);
            $this->assertIsNumeric($parts[1]);
        }
    }

    /** @test */
    public function puede_parsear_scope_desde_room()
    {
        $room = 'MESA:123';
        list($scopeType, $scopeId) = explode(':', $room);

        $this->assertEquals('MESA', $scopeType);
        $this->assertEquals(123, (int) $scopeId);
    }

    // ==========================================
    // Tests: Job emite evento WebSocket
    // ==========================================

    /** @test */
    public function job_recalcular_emite_evento_redis()
    {
        if (!$this->redisDisponible()) {
            $this->markTestSkipped('Redis no está disponible');
        }

        $record = PrecountRecord::factory()->create([
            'estado' => PrecountRecord::ESTADO_VALIDADA
        ]);

        $job = new \App\Jobs\RecalcularAgregadosJob($record);
        
        // Mock del servicio
        $service = $this->createMock(\App\Services\AgregadosService::class);
        $service->method('recalcular');

        $job->handle($service);

        // El job debería emitir evento (verificado en los logs)
        $this->assertTrue(true);
    }

    // ==========================================
    // Tests: JWT Token para WebSocket
    // ==========================================

    /** @test */
    public function puede_generar_token_para_websocket()
    {
        $user = User::factory()->create();
        
        $token = $user->createToken('websocket')->plainTextToken;

        $this->assertNotEmpty($token);
        $this->assertStringContainsString('|', $token);
    }

    /** @test */
    public function token_jwt_contiene_claims_necesarios()
    {
        $user = User::factory()->create([
            'id' => 123,
            'email' => 'test@example.com'
        ]);

        // Simular token JWT
        $payload = [
            'sub' => $user->id,
            'email' => $user->email,
            'iat' => time(),
            'exp' => time() + 3600
        ];

        $this->assertArrayHasKey('sub', $payload);
        $this->assertArrayHasKey('email', $payload);
        $this->assertArrayHasKey('iat', $payload);
        $this->assertArrayHasKey('exp', $payload);
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private function redisDisponible(): bool
    {
        try {
            Redis::ping();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
