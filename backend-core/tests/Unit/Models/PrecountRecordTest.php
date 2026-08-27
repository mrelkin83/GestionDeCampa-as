<?php

namespace Tests\Unit\Models;

use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\PrecountEvidence;
use App\Models\PrecountMetadata;
use App\Models\PrecountValidation;
use App\Models\Mesa;
use App\Models\ElectionPosition;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrecountRecordTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_un_record_con_factory()
    {
        $record = PrecountRecord::factory()->create();

        $this->assertDatabaseHas('precount_records', [
            'id' => $record->id,
            'estado' => $record->estado
        ]);
    }

    /** @test */
    public function una_mesa_puede_tener_multiples_versiones_de_acta()
    {
        $mesa = Mesa::factory()->create();
        $cargo = ElectionPosition::factory()->create();

        // Versión 1
        $record1 = PrecountRecord::factory()->create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargo->id,
            'version' => 1,
            'estado' => 'VALIDADA'
        ]);

        // Versión 2 (corrección)
        $record2 = PrecountRecord::factory()->create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargo->id,
            'version' => 2,
            'estado' => 'VALIDADA'
        ]);

        $this->assertEquals(2, PrecountRecord::where('polling_table_id', $mesa->id)
            ->where('election_position_id', $cargo->id)
            ->count());
    }

    /** @test */
    public function no_puede_haber_version_duplicada_para_misma_mesa_y_cargo()
    {
        $this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);

        $mesa = Mesa::factory()->create();
        $cargo = ElectionPosition::factory()->create();

        PrecountRecord::factory()->create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargo->id,
            'version' => 1
        ]);

        // Intentar crear versión duplicada
        PrecountRecord::factory()->create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargo->id,
            'version' => 1
        ]);
    }

    /** @test */
    public function puede_calcular_total_votos_correctamente()
    {
        $record = PrecountRecord::factory()->create([
            'total_sufragantes' => 200,
            'votos_nulos' => 3,
            'votos_no_marcados' => 5
        ]);

        // Crear votos por candidatos
        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 100
        ]);
        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 92
        ]);

        // 100 + 92 + 3 + 5 = 200
        $this->assertEquals(200, $record->total_votos);
    }

    /** @test */
    public function puede_calcular_votos_solo_candidatos()
    {
        $record = PrecountRecord::factory()->create([
            'total_sufragantes' => 200,
            'votos_nulos' => 3,
            'votos_no_marcados' => 5
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 100
        ]);
        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 92
        ]);

        // 100 + 92 = 192 (sin nulos ni blancos)
        $this->assertEquals(192, $record->votos_candidatos);
    }

    /** @test */
    public function detecta_suma_valida_correctamente()
    {
        $record = PrecountRecord::factory()->create([
            'total_sufragantes' => 200,
            'votos_nulos' => 3,
            'votos_no_marcados' => 5
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 100
        ]);
        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 92
        ]);

        // 100 + 92 + 3 + 5 = 200 ✓
        $this->assertTrue($record->suma_valida);
    }

    /** @test */
    public function detecta_suma_invalida_correctamente()
    {
        $record = PrecountRecord::factory()->create([
            'total_sufragantes' => 200,
            'votos_nulos' => 3,
            'votos_no_marcados' => 5
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 100
        ]);
        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'votos' => 50 // Debería ser 92
        ]);

        // 100 + 50 + 3 + 5 = 158 ≠ 200 ✗
        $this->assertFalse($record->suma_valida);
    }

    /** @test */
    public function scope_by_estado_filtra_correctamente()
    {
        PrecountRecord::factory()->count(3)->create(['estado' => 'VALIDADA']);
        PrecountRecord::factory()->count(2)->create(['estado' => 'OBSERVADA']);
        PrecountRecord::factory()->count(1)->create(['estado' => 'CARGADA']);

        $this->assertEquals(3, PrecountRecord::byEstado('VALIDADA')->count());
        $this->assertEquals(2, PrecountRecord::byEstado('OBSERVADA')->count());
        $this->assertEquals(1, PrecountRecord::byEstado('CARGADA')->count());
    }

    /** @test */
    public function scope_by_mesa_filtra_correctamente()
    {
        $mesa1 = Mesa::factory()->create();
        $mesa2 = Mesa::factory()->create();

        PrecountRecord::factory()->count(3)->create(['polling_table_id' => $mesa1->id]);
        PrecountRecord::factory()->count(2)->create(['polling_table_id' => $mesa2->id]);

        $this->assertEquals(3, PrecountRecord::byMesa($mesa1->id)->count());
        $this->assertEquals(2, PrecountRecord::byMesa($mesa2->id)->count());
    }

    /** @test */
    public function scope_validas_retorna_solo_validadas()
    {
        PrecountRecord::factory()->count(3)->create(['estado' => 'VALIDADA']);
        PrecountRecord::factory()->count(2)->create(['estado' => 'OBSERVADA']);
        PrecountRecord::factory()->count(1)->create(['estado' => 'CARGADA']);

        $validas = PrecountRecord::validas()->get();

        $this->assertEquals(3, $validas->count());
        $validas->each(function ($record) {
            $this->assertEquals('VALIDADA', $record->estado);
        });
    }

    /** @test */
    public function metodo_siguiente_version_calcula_correctamente()
    {
        $mesa = Mesa::factory()->create();
        $cargo = ElectionPosition::factory()->create();

        // Sin versiones previas
        $this->assertEquals(1, PrecountRecord::siguienteVersion($mesa->id, $cargo->id));

        // Crear versión 1
        PrecountRecord::factory()->create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargo->id,
            'version' => 1
        ]);

        $this->assertEquals(2, PrecountRecord::siguienteVersion($mesa->id, $cargo->id));

        // Crear versión 2
        PrecountRecord::factory()->create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargo->id,
            'version' => 2
        ]);

        $this->assertEquals(3, PrecountRecord::siguienteVersion($mesa->id, $cargo->id));
    }

    /** @test */
    public function tiene_relaciones_con_votos()
    {
        $record = PrecountRecord::factory()->create();
        
        PrecountVote::factory()->count(3)->create([
            'precount_record_id' => $record->id
        ]);

        $this->assertEquals(3, $record->votes()->count());
    }

    /** @test */
    public function tiene_relaciones_con_evidencias()
    {
        $record = PrecountRecord::factory()->create();
        
        PrecountEvidence::factory()->count(2)->create([
            'precount_record_id' => $record->id
        ]);

        $this->assertEquals(2, $record->evidence()->count());
    }

    /** @test */
    public function tiene_relaciones_con_metadata()
    {
        $record = PrecountRecord::factory()->create();
        
        PrecountMetadata::factory()->create([
            'precount_record_id' => $record->id
        ]);

        $this->assertInstanceOf(PrecountMetadata::class, $record->metadata);
    }

    /** @test */
    public function tiene_relaciones_con_validaciones()
    {
        $record = PrecountRecord::factory()->create();
        
        PrecountValidation::factory()->count(2)->create([
            'precount_record_id' => $record->id
        ]);

        $this->assertEquals(2, $record->validations()->count());
    }

    /** @test */
    public function detecta_alertas_criticas_pendientes()
    {
        $record = PrecountRecord::factory()->create();

        // Crear validación crítica no resuelta
        PrecountValidation::factory()->create([
            'precount_record_id' => $record->id,
            'severidad' => 'CRITICAL',
            'resuelta' => false
        ]);

        $this->assertTrue($record->tiene_alertas_criticas);
    }

    /** @test */
    public function no_detecta_alertas_criticas_si_estan_resueltas()
    {
        $record = PrecountRecord::factory()->create();

        // Crear validación crítica resuelta
        PrecountValidation::factory()->create([
            'precount_record_id' => $record->id,
            'severidad' => 'CRITICAL',
            'resuelta' => true
        ]);

        $this->assertFalse($record->tiene_alertas_criticas);
    }

    /** @test */
    public function no_detecta_alertas_criticas_si_son_warning()
    {
        $record = PrecountRecord::factory()->create();

        // Crear validación warning (no crítica)
        PrecountValidation::factory()->create([
            'precount_record_id' => $record->id,
            'severidad' => 'WARNING',
            'resuelta' => false
        ]);

        $this->assertFalse($record->tiene_alertas_criticas);
    }
}
