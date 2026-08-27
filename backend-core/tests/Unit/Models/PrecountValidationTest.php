<?php

namespace Tests\Unit\Models;

use App\Models\PrecountValidation;
use App\Models\PrecountRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrecountValidationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_validacion_con_factory()
    {
        $validation = PrecountValidation::factory()->create();

        $this->assertDatabaseHas('precount_validations', [
            'id' => $validation->id,
            'tipo' => $validation->tipo
        ]);
    }

    /** @test */
    public function scope_pendientes_retorna_solo_no_resueltas()
    {
        PrecountValidation::factory()->count(3)->create(['resuelta' => false]);
        PrecountValidation::factory()->count(2)->create(['resuelta' => true]);

        $this->assertEquals(3, PrecountValidation::pendientes()->count());
    }

    /** @test */
    public function scope_by_severidad_filtra_correctamente()
    {
        PrecountValidation::factory()->count(2)->create(['severidad' => 'CRITICAL']);
        PrecountValidation::factory()->count(3)->create(['severidad' => 'WARNING']);
        PrecountValidation::factory()->count(1)->create(['severidad' => 'INFO']);

        $this->assertEquals(2, PrecountValidation::bySeveridad('CRITICAL')->count());
        $this->assertEquals(3, PrecountValidation::bySeveridad('WARNING')->count());
        $this->assertEquals(1, PrecountValidation::bySeveridad('INFO')->count());
    }

    /** @test */
    public function scope_criticas_pendientes_retorna_solo_criticas_no_resueltas()
    {
        // Críticas no resueltas (debe retornar)
        PrecountValidation::factory()->count(2)->create([
            'severidad' => 'CRITICAL',
            'resuelta' => false
        ]);

        // Críticas resueltas (no debe retornar)
        PrecountValidation::factory()->count(1)->create([
            'severidad' => 'CRITICAL',
            'resuelta' => true
        ]);

        // Warning no resueltas (no debe retornar)
        PrecountValidation::factory()->count(3)->create([
            'severidad' => 'WARNING',
            'resuelta' => false
        ]);

        $criticasPendientes = PrecountValidation::criticasPendientes()->get();

        $this->assertEquals(2, $criticasPendientes->count());
        $criticasPendientes->each(function ($validation) {
            $this->assertEquals('CRITICAL', $validation->severidad);
            $this->assertFalse($validation->resuelta);
        });
    }

    /** @test */
    public function metodo_resolver_marca_como_resuelta()
    {
        $validation = PrecountValidation::factory()->create([
            'resuelta' => false,
            'resuelta_at' => null,
            'resuelta_por' => null
        ]);

        $user = User::factory()->create();

        $validation->resolver($user->id);

        $validation->refresh();

        $this->assertTrue($validation->resuelta);
        $this->assertNotNull($validation->resuelta_at);
        $this->assertEquals($user->id, $validation->resuelta_por);
    }

    /** @test */
    public function accesor_es_critica_retorna_true_para_critical()
    {
        $validation = PrecountValidation::factory()->create(['severidad' => 'CRITICAL']);
        $this->assertTrue($validation->es_critica);
    }

    /** @test */
    public function accesor_es_critica_retorna_false_para_warning()
    {
        $validation = PrecountValidation::factory()->create(['severidad' => 'WARNING']);
        $this->assertFalse($validation->es_critica);
    }

    /** @test */
    public function accesor_es_critica_retorna_false_para_info()
    {
        $validation = PrecountValidation::factory()->create(['severidad' => 'INFO']);
        $this->assertFalse($validation->es_critica);
    }

    /** @test */
    public function accesor_icono_retorna_valor_correcto_por_tipo()
    {
        $this->assertEquals('calculator', 
            PrecountValidation::factory()->create(['tipo' => 'SUMA_INVALIDA'])->icono);
        
        $this->assertEquals('warning', 
            PrecountValidation::factory()->create(['tipo' => 'VOTOS_SUPERAN_SUFRAGANTES'])->icono);
        
        $this->assertEquals('eye-off', 
            PrecountValidation::factory()->create(['tipo' => 'ACTA_ILEGIBLE'])->icono);
        
        $this->assertEquals('copy', 
            PrecountValidation::factory()->create(['tipo' => 'MESA_DUPLICADA'])->icono);
        
        $this->assertEquals('git-commit', 
            PrecountValidation::factory()->create(['tipo' => 'VERSION_DUPLICADA'])->icono);
        
        // 'tipo' tiene un CHECK constraint en BD con los 5 valores válidos
        // de arriba: no se puede persistir un tipo desconocido. El fallback
        // del accesor sigue siendo real código (defensivo) y se puede
        // probar sin persistir, con make() en vez de create().
        $this->assertEquals('alert-circle',
            PrecountValidation::factory()->make(['tipo' => 'OTRO_TIPO'])->icono);
    }

    /** @test */
    public function constantes_tipos_estan_definidas()
    {
        $this->assertEquals('SUMA_INVALIDA', PrecountValidation::TIPO_SUMA_INVALIDA);
        $this->assertEquals('VOTOS_SUPERAN_SUFRAGANTES', PrecountValidation::TIPO_VOTOS_SUPERAN_SUFRAGANTES);
        $this->assertEquals('ACTA_ILEGIBLE', PrecountValidation::TIPO_ACTA_ILEGIBLE);
        $this->assertEquals('MESA_DUPLICADA', PrecountValidation::TIPO_MESA_DUPLICADA);
        $this->assertEquals('VERSION_DUPLICADA', PrecountValidation::TIPO_VERSION_DUPLICADA);
    }

    /** @test */
    public function constantes_severidad_estan_definidas()
    {
        $this->assertEquals('INFO', PrecountValidation::SEVERIDAD_INFO);
        $this->assertEquals('WARNING', PrecountValidation::SEVERIDAD_WARNING);
        $this->assertEquals('CRITICAL', PrecountValidation::SEVERIDAD_CRITICAL);
    }
}
