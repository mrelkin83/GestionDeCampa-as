<?php

namespace Tests\Unit\Models;

use App\Models\MesaCargoStatus;
use App\Models\Mesa;
use App\Models\CargoElectoral;
use App\Models\PrecountRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MesaCargoStatusTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_status_con_factory()
    {
        $status = MesaCargoStatus::factory()->create();

        $this->assertDatabaseHas('mesa_cargo_status', [
            'id' => $status->id,
            'estado' => $status->estado
        ]);
    }

    /** @test */
    public function no_puede_haber_duplicados_de_mesa_y_cargo()
    {
        $this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);

        $mesa = Mesa::factory()->create();
        $cargo = CargoElectoral::factory()->create();

        MesaCargoStatus::factory()->create([
            'mesa_id' => $mesa->id,
            'cargo_id' => $cargo->id
        ]);

        // Intentar crear duplicado
        MesaCargoStatus::factory()->create([
            'mesa_id' => $mesa->id,
            'cargo_id' => $cargo->id
        ]);
    }

    /** @test */
    public function scope_pendientes_retorna_solo_pendientes()
    {
        MesaCargoStatus::factory()->count(3)->create(['estado' => 'PENDIENTE']);
        MesaCargoStatus::factory()->count(2)->create(['estado' => 'REPORTADA']);

        $this->assertEquals(3, MesaCargoStatus::pendientes()->count());
    }

    /** @test */
    public function scope_reportadas_retorna_reportadas_observadas_y_validadas()
    {
        MesaCargoStatus::factory()->count(2)->create(['estado' => 'REPORTADA']);
        MesaCargoStatus::factory()->count(2)->create(['estado' => 'OBSERVADA']);
        MesaCargoStatus::factory()->count(2)->create(['estado' => 'VALIDADA']);
        MesaCargoStatus::factory()->count(3)->create(['estado' => 'PENDIENTE']);

        $this->assertEquals(6, MesaCargoStatus::reportadas()->count());
    }

    /** @test */
    public function scope_validadas_retorna_solo_validadas()
    {
        MesaCargoStatus::factory()->count(3)->create(['estado' => 'VALIDADA']);
        MesaCargoStatus::factory()->count(2)->create(['estado' => 'OBSERVADA']);

        $this->assertEquals(3, MesaCargoStatus::validadas()->count());
    }

    /** @test */
    public function metodo_marcar_reportada_actualiza_estado()
    {
        $status = MesaCargoStatus::factory()->create([
            'estado' => 'PENDIENTE',
            'precount_record_id' => null,
            'reportada_at' => null
        ]);

        $record = PrecountRecord::factory()->create();

        $status->marcarReportada($record->id);
        $status->refresh();

        $this->assertEquals('REPORTADA', $status->estado);
        $this->assertEquals($record->id, $status->precount_record_id);
        $this->assertNotNull($status->reportada_at);
    }

    /** @test */
    public function metodo_marcar_observada_actualiza_estado()
    {
        $status = MesaCargoStatus::factory()->create(['estado' => 'REPORTADA']);

        $status->marcarObservada();
        $status->refresh();

        $this->assertEquals('OBSERVADA', $status->estado);
    }

    /** @test */
    public function metodo_marcar_validada_actualiza_estado()
    {
        $status = MesaCargoStatus::factory()->create([
            'estado' => 'OBSERVADA',
            'validada_at' => null
        ]);

        $status->marcarValidada();
        $status->refresh();

        $this->assertEquals('VALIDADA', $status->estado);
        $this->assertNotNull($status->validada_at);
    }

    /** @test */
    public function metodo_obtener_o_crear_crea_nuevo_si_no_existe()
    {
        $mesa = Mesa::factory()->create();
        $cargo = CargoElectoral::factory()->create();

        $this->assertEquals(0, MesaCargoStatus::count());

        $status = MesaCargoStatus::obtenerOCrear($mesa->id, $cargo->id);

        $this->assertEquals(1, MesaCargoStatus::count());
        $this->assertEquals('PENDIENTE', $status->estado);
    }

    /** @test */
    public function metodo_obtener_o_crear_retorna_existente_si_ya_hay()
    {
        $mesa = Mesa::factory()->create();
        $cargo = CargoElectoral::factory()->create();

        $existente = MesaCargoStatus::factory()->create([
            'mesa_id' => $mesa->id,
            'cargo_id' => $cargo->id,
            'estado' => 'VALIDADA'
        ]);

        $status = MesaCargoStatus::obtenerOCrear($mesa->id, $cargo->id);

        $this->assertEquals(1, MesaCargoStatus::count());
        $this->assertEquals($existente->id, $status->id);
        $this->assertEquals('VALIDADA', $status->estado);
    }

    /** @test */
    public function metodo_estadisticas_globales_retorna_correctamente()
    {
        $cargo = CargoElectoral::factory()->create();

        MesaCargoStatus::factory()->count(10)->create([
            'cargo_id' => $cargo->id,
            'estado' => 'VALIDADA'
        ]);
        MesaCargoStatus::factory()->count(5)->create([
            'cargo_id' => $cargo->id,
            'estado' => 'REPORTADA'
        ]);
        MesaCargoStatus::factory()->count(5)->create([
            'cargo_id' => $cargo->id,
            'estado' => 'PENDIENTE'
        ]);

        $stats = MesaCargoStatus::estadisticasGlobales($cargo->id);

        $this->assertEquals(20, $stats['total']);
        $this->assertEquals(15, $stats['reportadas']); // VALIDADA + REPORTADA
        $this->assertEquals(10, $stats['validadas']);
        $this->assertEquals(5, $stats['pendientes']);
        $this->assertEquals(75.0, $stats['porcentaje_avance']); // 15/20 * 100
    }

    /** @test */
    public function accesor_color_estado_retorna_valores_correctos()
    {
        $this->assertEquals('gray', 
            MesaCargoStatus::factory()->create(['estado' => 'PENDIENTE'])->color_estado);
        
        $this->assertEquals('blue', 
            MesaCargoStatus::factory()->create(['estado' => 'REPORTADA'])->color_estado);
        
        $this->assertEquals('yellow', 
            MesaCargoStatus::factory()->create(['estado' => 'OBSERVADA'])->color_estado);
        
        $this->assertEquals('green', 
            MesaCargoStatus::factory()->create(['estado' => 'VALIDADA'])->color_estado);
    }

    /** @test */
    public function constantes_estados_estan_definidas()
    {
        $this->assertEquals('PENDIENTE', MesaCargoStatus::ESTADO_PENDIENTE);
        $this->assertEquals('REPORTADA', MesaCargoStatus::ESTADO_REPORTADA);
        $this->assertEquals('OBSERVADA', MesaCargoStatus::ESTADO_OBSERVADA);
        $this->assertEquals('VALIDADA', MesaCargoStatus::ESTADO_VALIDADA);
    }
}
