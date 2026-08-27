<?php

namespace Tests\Unit\Services;

use App\Services\AgregadosService;
use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\PrecountAggregate;
use App\Models\Mesa;
use App\Models\PuestoVotacion;
use App\Models\Municipio;
use App\Models\Departamento;
use App\Models\ElectionPosition;
use App\Models\Candidato;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Reescrito: usaba Mesa::factory(['puesto_id' => ...]) -el campo real es
 * puesto_votacion_id-, CargoElectoral::factory() para election_position_id
 * -tabla equivocada, no tiene relación con precount_records- y candidate_id
 * hardcodeado (1, 2, 99) que no correspondía a ninguna fila real de
 * candidates -desde que esa tabla existe con FK, esos valores violan la
 * constraint-.
 */
class AgregadosServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AgregadosService $service;
    protected Mesa $mesa;
    protected ElectionPosition $cargo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AgregadosService();

        $departamento = Departamento::factory()->create();
        $municipio = Municipio::factory()->create(['departamento_id' => $departamento->id]);
        $puesto = PuestoVotacion::factory()->create(['municipio_id' => $municipio->id]);
        $this->mesa = Mesa::factory()->create(['puesto_votacion_id' => $puesto->id]);
        $this->cargo = ElectionPosition::factory()->create();
    }

    /** @test */
    public function puede_recalcular_agregados_para_un_acta_validada()
    {
        $candidato = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato->id,
            'votos' => 100,
        ]);

        $this->service->recalcular($record);

        $this->assertEquals(1, PrecountAggregate::where('scope_type', 'MESA')->count());
        $this->assertEquals(1, PrecountAggregate::where('scope_type', 'PUESTO')->count());
        $this->assertEquals(1, PrecountAggregate::where('scope_type', 'MUNICIPIO')->count());
        $this->assertEquals(1, PrecountAggregate::where('scope_type', 'DEPARTAMENTO')->count());
    }

    /** @test */
    public function calcula_porcentajes_correctamente()
    {
        $candidato1 = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);
        $candidato2 = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato1->id,
            'votos' => 60,
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato2->id,
            'votos' => 40,
        ]);

        $this->service->recalcular($record);

        $aggregate1 = PrecountAggregate::where('candidate_id', $candidato1->id)->first();
        $aggregate2 = PrecountAggregate::where('candidate_id', $candidato2->id)->first();

        $this->assertEquals(60.0, $aggregate1->porcentaje);
        $this->assertEquals(40.0, $aggregate2->porcentaje);
    }

    /** @test */
    public function no_calcula_agregados_para_actas_no_validadas()
    {
        $candidato = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'CARGADA', // No validada
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato->id,
            'votos' => 100,
        ]);

        $this->service->recalcular($record);

        // recalcular() solo suma precount_records.estado = VALIDADA
        // (AgregadosService::calcularAgregadoScope): un acta CARGADA no
        // debe generar agregados.
        $this->assertEquals(0, PrecountAggregate::count());
    }

    /** @test */
    public function puede_obtener_resultados_para_un_scope()
    {
        $candidato = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato->id,
            'votos' => 150,
        ]);

        $this->service->recalcular($record);

        $resultados = $this->service->obtenerResultados('MESA', $this->mesa->id, $this->cargo->id);

        $this->assertEquals('MESA', $resultados['scope_type']);
        $this->assertEquals($this->mesa->id, $resultados['scope_id']);
        $this->assertEquals(150, $resultados['total_votos']);
        $this->assertCount(1, $resultados['resultados']);
    }

    /** @test */
    public function marca_es_ganador_en_el_candidato_con_mas_votos()
    {
        $candidato1 = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);
        $candidato2 = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato1->id,
            'votos' => 60,
        ]);
        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato2->id,
            'votos' => 40,
        ]);

        $this->service->recalcular($record);

        // es_ganador quedaba hardcodeado en false para todos siempre
        // ("se calcula después", pero nunca se calculaba) -el frontend usa
        // este campo para resaltar al ganador en el gráfico en vivo.
        $resultados = $this->service->obtenerResultados('MESA', $this->mesa->id, $this->cargo->id);

        $porCandidato = collect($resultados['resultados'])->keyBy('candidate_id');

        $this->assertTrue($porCandidato[$candidato1->id]['es_ganador']);
        $this->assertFalse($porCandidato[$candidato2->id]['es_ganador']);
        $this->assertEquals($candidato1->id, $resultados['ganador']['candidate_id']);
    }

    /** @test */
    public function actualiza_agregados_existentes_en_lugar_de_crear_duplicados()
    {
        $candidato = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        PrecountAggregate::create([
            'scope_type' => 'MESA',
            'scope_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'candidate_id' => $candidato->id,
            'votos' => 50,
            'porcentaje' => 50.0,
        ]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidato->id,
            'votos' => 100, // Diferente valor
        ]);

        $this->service->recalcular($record);

        // recalcular() crea/actualiza un agregado por nivel territorial
        // (MESA, PUESTO, MUNICIPIO, DEPARTAMENTO); lo que no debe duplicarse
        // es la fila para este candidato en el scope MESA ya existente.
        $this->assertEquals(1, PrecountAggregate::where('scope_type', 'MESA')
            ->where('candidate_id', $candidato->id)
            ->count());

        $aggregate = PrecountAggregate::where('scope_type', 'MESA')
            ->where('candidate_id', $candidato->id)
            ->first();
        $this->assertEquals(100, $aggregate->votos);
    }

    /** @test */
    public function elimina_agregados_de_candidatos_sin_votos()
    {
        $candidatoSinVotos = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);
        $candidatoConVotos = Candidato::factory()->create(['election_position_id' => $this->cargo->id]);

        // Agregado previo de un candidato que en esta versión del acta ya no tiene votos
        PrecountAggregate::create([
            'scope_type' => 'MESA',
            'scope_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'candidate_id' => $candidatoSinVotos->id,
            'votos' => 0,
            'porcentaje' => 0,
        ]);

        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidatoConVotos->id,
            'votos' => 100,
        ]);

        $this->service->recalcular($record);

        $this->assertEquals(0, PrecountAggregate::where('candidate_id', $candidatoSinVotos->id)->count());
    }
}
