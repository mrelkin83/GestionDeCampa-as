<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VotanteControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $userSinAcceso;
    private Campana $campanaAjena;

    protected function setUp(): void
    {
        parent::setUp();

        $roleOperador = Role::create([
            'name' => 'operador',
            'display_name' => 'Operador',
            'description' => 'Rol de prueba sin acceso especial',
        ]);

        $this->userSinAcceso = User::create([
            'first_name' => 'Sin',
            'last_name' => 'Acceso',
            'email' => 'sin-acceso@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567890',
        ]);

        $cargo = CargoElectoral::create([
            'nombre' => 'Alcaldía',
            'tipo_eleccion' => 'territorial',
            'nivel' => 'municipal',
        ]);

        $this->campanaAjena = Campana::create([
            'nombre' => 'Campaña Ajena',
            'slug' => 'campana-ajena-votantes',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Ajeno',
        ]);
        // Nota: $this->userSinAcceso NO se asigna a $this->campanaAjena
        // -es justamente el punto del test: no tiene acceso a ella.
    }

    public function test_estadisticas_rechaza_a_usuario_sin_acceso_a_la_campana(): void
    {
        $token = $this->userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->getJson(
            '/api/crm/votantes/estadisticas?campana_id=' . $this->campanaAjena->id,
            ['Authorization' => "Bearer $token"],
        );

        $response->assertStatus(403);
    }

    public function test_store_ignora_scoring_y_es_lider_enviados_por_el_cliente(): void
    {
        $adminRole = Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Admin',
            'description' => 'Rol de prueba',
        ]);
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'Test',
            'email' => 'admin-votante-test@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $adminRole->id,
            'document_type' => 'CC',
            'document_number' => '9999999999',
        ]);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/crm/votantes', [
            'campana_id' => $this->campanaAjena->id,
            'documento' => '5555555555',
            'tipo_documento' => 'CC',
            'primer_nombre' => 'Juan',
            'primer_apellido' => 'Pérez',
            // Campos que NO deberían poder fijarse desde el cliente:
            'scoring' => 100,
            'es_lider' => true,
            'lider_asignado_id' => 999,
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('votantes', [
            'documento' => '5555555555',
            'scoring' => 50, // default de la migración, no el 100 enviado por el cliente
            'es_lider' => false,
            'lider_asignado_id' => null,
        ]);
    }
}
