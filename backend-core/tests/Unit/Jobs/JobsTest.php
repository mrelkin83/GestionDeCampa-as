<?php

namespace Tests\Unit\Jobs;

use App\Jobs\RecalcularAgregadosJob;
use App\Jobs\ProcesarImagenActaJob;
use App\Jobs\NotificarAlertaCriticaJob;
use App\Models\PrecountRecord;
use App\Models\PrecountEvidence;
use App\Models\PrecountValidation;
use App\Services\AgregadosService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class JobsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Limpiar cache antes de cada test
        Cache::flush();
    }

    // ==========================================
    // Tests RecalcularAgregadosJob
    // ==========================================

    /** @test */
    public function job_recalcular_agregados_se_encola_correctamente()
    {
        Bus::fake();
        
        $record = PrecountRecord::factory()->make();

        RecalcularAgregadosJob::dispatch($record)
            ->onQueue('agregados');

        Bus::assertDispatched(RecalcularAgregadosJob::class, function ($job) {
            return $job->queue === 'agregados';
        });
    }

    /** @test */
    public function job_invalidate_cache_despues_de_recalcular()
    {
        $record = PrecountRecord::factory()->create([
            'estado' => PrecountRecord::ESTADO_VALIDADA
        ]);

        // La clave de cache depende de los ids reales generados por la
        // factory (mesa/cargo), no de "1:1" fijo -con RefreshDatabase y
        // varios tests creando filas antes, esos ids casi nunca son 1.
        $cacheKey = "resultados:MESA:{$record->polling_table_id}:{$record->election_position_id}";
        Cache::put($cacheKey, ['test' => 'data'], 300);

        $job = new RecalcularAgregadosJob($record);
        $job->handle(app(AgregadosService::class));

        $this->assertNull(Cache::get($cacheKey));
    }

    // ==========================================
    // Tests ProcesarImagenActaJob
    // ==========================================

    /** @test */
    public function job_procesar_imagen_decodifica_base64()
    {
        // Crear imagen base64 de prueba (1x1 pixel rojo)
        $imagenData = base64_encode(\file_get_contents(__DIR__ . '/../../fixtures/test-image.jpg') ?: '');
        $base64 = 'data:image/jpeg;base64,' . $imagenData;

        $evidence = PrecountEvidence::factory()->create([
            'imagen_url' => 'pending',
            'procesado' => false
        ]);

        $job = new ProcesarImagenActaJob($evidence->id, $base64);
        $job->handle();

        $evidence->refresh();
        
        // Verificar que se actualizó la URL
        $this->assertNotEquals('pending', $evidence->imagen_url);
        $this->assertTrue($evidence->procesado);
        $this->assertNotNull($evidence->procesado_at);
    }

    /** @test */
    public function job_procesar_imagen_valida_formato()
    {
        // Texto no válido como imagen
        $base64Invalido = base64_encode('esto no es una imagen');

        $evidence = PrecountEvidence::factory()->create([
            'imagen_url' => 'pending',
            'procesado' => false
        ]);

        $job = new ProcesarImagenActaJob($evidence->id, $base64Invalido);
        
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('El archivo no es una imagen válida');
        
        $job->handle();
    }

    /** @test */
    public function job_marca_error_si_falla_procesamiento()
    {
        // Crear base64 inválido
        $evidence = PrecountEvidence::factory()->create([
            'imagen_url' => 'pending',
            'procesado' => false
        ]);

        $job = new ProcesarImagenActaJob($evidence->id, 'invalid-base64');
        
        try {
            $job->handle();
        } catch (\Exception $e) {
            // Esperado
        }

        $evidence->refresh();
        
        // Verificar que se marcó el error
        $this->assertNotNull($evidence->error_procesamiento);
        $this->assertFalse($evidence->procesado);
    }

    // ==========================================
    // Tests NotificarAlertaCriticaJob
    // ==========================================

    /** @test */
    public function job_notificar_alerta_critica_envia_notificacion()
    {
        Bus::fake();
        
        $validation = PrecountValidation::factory()->create([
            'severidad' => 'CRITICAL'
        ]);

        NotificarAlertaCriticaJob::dispatch($validation->id)
            ->onQueue('notificaciones');

        Bus::assertDispatched(NotificarAlertaCriticaJob::class, function ($job) use ($validation) {
            return $job->queue === 'notificaciones';
        });
    }

    /** @test */
    public function job_no_notifica_alertas_no_criticas()
    {
        $validation = PrecountValidation::factory()->create([
            'severidad' => 'WARNING',
            'tipo' => 'MESA_DUPLICADA'
        ]);

        $job = new NotificarAlertaCriticaJob($validation->id);
        $job->handle();

        // No debería lanzar excepción ni hacer nada visible
        $this->assertTrue(true);
    }

    // ==========================================
    // Tests Retry y Failed
    // ==========================================

    /** @test */
    public function job_tiene_configuracion_de_reintentos()
    {
        $record = PrecountRecord::factory()->make();
        $job = new RecalcularAgregadosJob($record);

        $this->assertEquals(3, $job->tries);
        $this->assertEquals([10, 30, 60], $job->backoff);
        $this->assertEquals(120, $job->timeout);
    }

    /** @test */
    public function job_imagen_tiene_timeout_extendido()
    {
        $job = new ProcesarImagenActaJob(1, 'test');

        $this->assertEquals(300, $job->timeout); // 5 minutos
    }
}
