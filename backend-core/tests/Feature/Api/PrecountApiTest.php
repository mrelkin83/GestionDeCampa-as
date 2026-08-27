<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Role;
use App\Models\Election;
use App\Models\ElectionPosition;
use App\Models\Candidato;
use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\Mesa;
use App\Models\PuestoVotacion;
use App\Models\Municipio;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Feature Tests: PrecountController API Endpoints
 *
 * Reescrito contra el contrato real de routes/api.php y PrecountController
 * (el archivo original usaba modelos que no existen -App\Models\Candidate,
 * App\Models\Puesto-, rutas que no existen -/api/preconteo/actas- y columnas
 * que no existen -votantes, eleccion_id-; nunca se había ejecutado contra
 * una base de datos real).
 */
class PrecountApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected User $coordinador;
    protected Election $election;
    protected ElectionPosition $cargo;
    protected Candidato $candidate;
    protected Mesa $mesa;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        Queue::fake();

        $this->user = User::factory()->create();

        $coordinadorRole = Role::factory()->create(['name' => 'coordinador']);
        $this->coordinador = User::factory()->create(['role_id' => $coordinadorRole->id]);

        $this->election = Election::factory()->create([
            'activa' => true,
            'fecha' => now()->addDays(30),
        ]);

        $this->cargo = ElectionPosition::factory()->create([
            'election_id' => $this->election->id,
        ]);

        $this->candidate = Candidato::factory()->create([
            'election_position_id' => $this->cargo->id,
        ]);

        $municipio = Municipio::factory()->create();
        $puesto = PuestoVotacion::factory()->create([
            'municipio_id' => $municipio->id,
        ]);
        $this->mesa = Mesa::factory()->create([
            'puesto_votacion_id' => $puesto->id,
        ]);
    }

    // ==========================================
    // Tests: GET /api/preconteo/elecciones (público)
    // ==========================================

    /** @test */
    public function puede_obtener_lista_de_elecciones_activas()
    {
        Election::factory()->count(3)->create(['activa' => true]);
        Election::factory()->count(2)->create(['activa' => false]);

        $response = $this->getJson('/api/preconteo/elecciones');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'year', 'tipo', 'fecha', 'nombre'],
                ],
            ])
            ->assertJsonCount(4, 'data'); // 3 nuevas + 1 del setUp
    }

    /** @test */
    public function elecciones_es_publico_no_requiere_autenticacion()
    {
        // Estas rutas viven fuera del grupo auth:sanctum a propósito: son
        // datos de transparencia electoral en tiempo real (resultados,
        // progreso, catálogos) que pwa-testigos/app-movil-testigos consumen
        // sin token. Ver comentario en routes/api.php.
        $response = $this->getJson('/api/preconteo/elecciones');

        $response->assertStatus(200);
    }

    // ==========================================
    // Tests: GET /api/preconteo/elecciones/{id}/cargos (público)
    // ==========================================

    /** @test */
    public function puede_obtener_cargos_de_una_eleccion()
    {
        ElectionPosition::factory()->create([
            'election_id' => $this->election->id,
            'nombre' => 'Gobernador',
        ]);

        $response = $this->getJson("/api/preconteo/elecciones/{$this->election->id}/cargos");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'tipo', 'nombre', 'nivel'],
                ],
            ]);
    }

    /** @test */
    public function cargos_de_eleccion_inexistente_retorna_404()
    {
        $response = $this->getJson('/api/preconteo/elecciones/999999/cargos');

        $response->assertStatus(404);
    }

    // ==========================================
    // Tests: GET /api/preconteo/candidatos (público)
    // ==========================================

    /** @test */
    public function puede_obtener_candidatos_de_un_cargo()
    {
        Candidato::factory()->count(2)->create([
            'election_position_id' => $this->cargo->id,
        ]);

        $response = $this->getJson('/api/preconteo/candidatos?' . http_build_query([
            'election_position_id' => $this->cargo->id,
        ]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'nombre', 'partido_politico', 'numero_tarjeton', 'foto_url'],
                ],
            ])
            ->assertJsonCount(3, 'data'); // 1 del setUp + 2 nuevos
    }

    /** @test */
    public function candidatos_valida_election_position_id_requerido()
    {
        $response = $this->getJson('/api/preconteo/candidatos');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['election_position_id']);
    }

    // ==========================================
    // Tests: GET /api/preconteo/resultados (público)
    // ==========================================

    /** @test */
    public function puede_obtener_resultados_con_parametros_validos()
    {
        \App\Models\PrecountAggregate::factory()->create([
            'scope_type' => 'MESA',
            'scope_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'candidate_id' => $this->candidate->id,
            'votos' => 100,
            'porcentaje' => 50.0,
        ]);

        $response = $this->getJson('/api/preconteo/resultados?' . http_build_query([
            'scope_type' => 'MESA',
            'scope_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
        ]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scope',
                    'scope_id',
                    'election_position_id',
                    'total_votos',
                    'resultados',
                ],
            ]);
    }

    /** @test */
    public function resultados_valida_parametros_requeridos()
    {
        $response = $this->getJson('/api/preconteo/resultados');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scope_type', 'scope_id', 'election_position_id']);
    }

    /** @test */
    public function resultados_usa_cache_en_segunda_peticion()
    {
        $params = [
            'scope_type' => 'MESA',
            'scope_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
        ];

        $this->getJson('/api/preconteo/resultados?' . http_build_query($params))
            ->assertStatus(200);

        $cacheKey = "resultados:MESA:{$this->mesa->id}:{$this->cargo->id}";
        $this->assertTrue(Cache::has($cacheKey));

        $this->getJson('/api/preconteo/resultados?' . http_build_query($params))
            ->assertStatus(200);
    }

    // ==========================================
    // Tests: GET /api/preconteo/progreso (público)
    // ==========================================

    /** @test */
    public function puede_obtener_progreso_del_reporte()
    {
        \App\Models\MesaCargoStatus::factory()->create([
            'mesa_id' => $this->mesa->id,
            'cargo_id' => $this->cargo->id,
            'estado' => 'VALIDADA',
        ]);

        $response = $this->getJson('/api/preconteo/progreso?' . http_build_query([
            'election_position_id' => $this->cargo->id,
        ]));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'election_position_id',
                    'total_mesas',
                    'reportadas',
                    'observadas',
                    'validadas',
                    'pendientes',
                    'porcentaje_avance',
                ],
            ]);
    }

    // ==========================================
    // Tests: POST /api/internal/preconteo/acta (requiere auth)
    // ==========================================

    /** @test */
    public function requiere_autenticacion_para_registrar_acta()
    {
        $response = $this->postJson('/api/internal/preconteo/acta', []);

        $response->assertStatus(401);
    }

    /** @test */
    public function puede_registrar_nuevo_acta()
    {
        $data = [
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'total_sufragantes' => 105,
            'votos_nulos' => 3,
            'votos_no_marcados' => 2,
            'resultados' => [
                ['candidate_id' => $this->candidate->id, 'votos' => 100],
            ],
            'observaciones' => 'Sin novedades',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/internal/preconteo/acta', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['record_id', 'version', 'estado', 'alertas'],
            ]);

        // 100 (candidato) + 3 (nulos) + 2 (no marcados) = 105 = total_sufragantes:
        // sin alertas críticas, el acta queda REPORTADA (no CARGADA).
        $this->assertDatabaseHas('precount_records', [
            'election_position_id' => $this->cargo->id,
            'polling_table_id' => $this->mesa->id,
            'estado' => PrecountRecord::ESTADO_REPORTADA,
        ]);
    }

    /** @test */
    public function valida_datos_requeridos_al_crear_acta()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/internal/preconteo/acta', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'polling_table_id', 'election_position_id', 'total_sufragantes',
                'votos_nulos', 'votos_no_marcados', 'resultados',
            ]);
    }

    /** @test */
    public function reenviar_acta_para_la_misma_mesa_y_cargo_crea_nueva_version()
    {
        // storeActa() no rechaza un reenvío: crea la siguiente versión
        // (PrecountRecord::siguienteVersion). Es el mecanismo real de
        // corrección de actas, no un caso de error.
        $data = [
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'total_sufragantes' => 100,
            'votos_nulos' => 0,
            'votos_no_marcados' => 0,
            'resultados' => [['candidate_id' => $this->candidate->id, 'votos' => 100]],
        ];

        $this->actingAs($this->user)->postJson('/api/internal/preconteo/acta', $data)
            ->assertStatus(201)
            ->assertJsonPath('data.version', 1);

        $this->actingAs($this->user)->postJson('/api/internal/preconteo/acta', $data)
            ->assertStatus(201)
            ->assertJsonPath('data.version', 2);
    }

    /** @test */
    public function genera_alertas_al_crear_acta_con_anomalias()
    {
        $data = [
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'total_sufragantes' => 100,
            'votos_nulos' => 0,
            'votos_no_marcados' => 0,
            'resultados' => [
                ['candidate_id' => $this->candidate->id, 'votos' => 150], // más votos que sufragantes
            ],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/internal/preconteo/acta', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('precount_validations', [
            'tipo' => 'SUMA_INVALIDA',
        ]);

        // Con una alerta CRITICAL, el acta queda OBSERVADA, no REPORTADA.
        $this->assertDatabaseHas('precount_records', [
            'polling_table_id' => $this->mesa->id,
            'estado' => PrecountRecord::ESTADO_OBSERVADA,
        ]);
    }

    /** @test */
    public function encola_job_para_procesar_imagen_si_se_envia()
    {
        $imagenBase64 = 'data:image/jpeg;base64,' . base64_encode('fake-image-data');

        $data = [
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'total_sufragantes' => 100,
            'votos_nulos' => 0,
            'votos_no_marcados' => 0,
            'resultados' => [['candidate_id' => $this->candidate->id, 'votos' => 100]],
            'imagenes_acta' => [$imagenBase64],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/internal/preconteo/acta', $data);

        $response->assertStatus(201);

        Queue::assertPushed(\App\Jobs\ProcesarImagenActaJob::class);
    }

    /** @test */
    public function encola_un_job_por_cada_imagen_de_evidencia_enviada()
    {
        $imagen = fn () => 'data:image/jpeg;base64,' . base64_encode('fake-image-data');

        $data = [
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'total_sufragantes' => 100,
            'votos_nulos' => 0,
            'votos_no_marcados' => 0,
            'resultados' => [['candidate_id' => $this->candidate->id, 'votos' => 100]],
            'imagenes_acta' => [$imagen(), $imagen(), $imagen()],
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/internal/preconteo/acta', $data);

        $response->assertStatus(201);

        Queue::assertPushed(\App\Jobs\ProcesarImagenActaJob::class, 3);
        $this->assertDatabaseCount('precount_evidence', 3);
    }

    // ==========================================
    // Tests: POST /api/internal/preconteo/acta/{id}/validar
    // ==========================================

    /** @test */
    public function validar_acta_requiere_rol_coordinador_o_superior()
    {
        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => PrecountRecord::ESTADO_REPORTADA,
        ]);

        // $this->user tiene un rol genérico de RoleFactory, no 'coordinador'.
        $response = $this->actingAs($this->user)
            ->postJson("/api/internal/preconteo/acta/{$record->id}/validar", ['accion' => 'VALIDAR']);

        $response->assertStatus(403);
    }

    /** @test */
    public function coordinador_puede_validar_acta_reportada()
    {
        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => PrecountRecord::ESTADO_REPORTADA,
        ]);

        $response = $this->actingAs($this->coordinador)
            ->postJson("/api/internal/preconteo/acta/{$record->id}/validar", [
                'accion' => 'VALIDAR',
                'comentario' => 'Todo correcto',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('precount_records', [
            'id' => $record->id,
            'estado' => PrecountRecord::ESTADO_VALIDADA,
        ]);

        Queue::assertPushed(\App\Jobs\RecalcularAgregadosJob::class);
    }

    /** @test */
    public function coordinador_puede_observar_acta()
    {
        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => PrecountRecord::ESTADO_REPORTADA,
        ]);

        $response = $this->actingAs($this->coordinador)
            ->postJson("/api/internal/preconteo/acta/{$record->id}/validar", [
                'accion' => 'OBSERVAR',
                'comentario' => 'Datos incompletos',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('precount_records', [
            'id' => $record->id,
            'estado' => PrecountRecord::ESTADO_OBSERVADA,
        ]);
    }

    /** @test */
    public function valida_accion_requerida_al_validar()
    {
        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
            'estado' => PrecountRecord::ESTADO_CARGADA,
        ]);

        $response = $this->actingAs($this->coordinador)
            ->postJson("/api/internal/preconteo/acta/{$record->id}/validar", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['accion']);
    }

    // ==========================================
    // Tests: GET /api/internal/preconteo/actas (requiere auth)
    // ==========================================

    /** @test */
    public function puede_listar_actas_con_filtros()
    {
        PrecountRecord::factory()->count(5)->create([
            'estado' => PrecountRecord::ESTADO_CARGADA,
        ]);
        PrecountRecord::factory()->count(3)->create([
            'estado' => PrecountRecord::ESTADO_VALIDADA,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/internal/preconteo/actas?estado=CARGADA');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => ['id', 'estado', 'total_sufragantes'],
                    ],
                    'current_page',
                    'total',
                ],
            ])
            ->assertJsonCount(5, 'data.data');
    }

    /** @test */
    public function puede_paginar_lista_de_actas()
    {
        PrecountRecord::factory()->count(25)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/internal/preconteo/actas');

        $response->assertStatus(200)
            ->assertJsonPath('data.per_page', 50)
            ->assertJsonPath('data.total', 25);
    }

    /** @test */
    public function incluye_relaciones_en_lista_de_actas()
    {
        $record = PrecountRecord::factory()->create([
            'polling_table_id' => $this->mesa->id,
            'election_position_id' => $this->cargo->id,
        ]);

        PrecountVote::factory()->create([
            'precount_record_id' => $record->id,
            'candidate_id' => $this->candidate->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/internal/preconteo/actas');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => ['votes', 'metadata', 'validations'],
                    ],
                ],
            ]);
    }
}
