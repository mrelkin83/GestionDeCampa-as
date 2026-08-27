<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SegmentoControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Campana $campana;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Admin',
            'description' => 'Rol de prueba',
        ]);

        $this->user = User::create([
            'first_name' => 'Test',
            'last_name' => 'Admin',
            'email' => 'segmento-test@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '1234567890',
        ]);

        $cargo = CargoElectoral::create([
            'nombre' => 'Alcaldía',
            'tipo_eleccion' => 'territorial',
            'nivel' => 'municipal',
        ]);

        $this->campana = Campana::create([
            'nombre' => 'Campaña Segmentos',
            'slug' => 'campana-segmentos',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Prueba',
        ]);
    }

    public function test_store_rechaza_a_usuario_sin_acceso_a_la_campana(): void
    {
        $roleOperador = Role::create([
            'name' => 'operador',
            'display_name' => 'Operador',
            'description' => 'Rol de prueba sin acceso especial',
        ]);
        $userSinAcceso = User::create([
            'first_name' => 'Sin',
            'last_name' => 'Acceso',
            'email' => 'sin-acceso-segmento@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567895',
        ]);
        $token = $userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/crm/segmentos', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Segmento no autorizado',
            'tipo' => 'estatico',
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('segmentos', ['nombre' => 'Segmento no autorizado']);
    }

    public function test_store_crea_segmento_estatico_correctamente(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/crm/segmentos', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Líderes barrio X',
            'tipo' => 'estatico',
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('segmentos', [
            'nombre' => 'Líderes barrio X',
            'campana_id' => $this->campana->id,
            'es_dinamico' => false,
        ]);
    }
}
