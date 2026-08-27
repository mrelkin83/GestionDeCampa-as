<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EventoControllerTest extends TestCase
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
            'email' => 'evento-test@example.com',
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
            'nombre' => 'Campaña Eventos',
            'slug' => 'campana-eventos',
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
            'email' => 'sin-acceso-evento@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567894',
        ]);
        $token = $userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/eventos', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Mitin no autorizado',
            'tipo' => 'mitin',
            'fecha_inicio' => now()->addDays(5)->toDateTimeString(),
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('eventos', ['nombre' => 'Mitin no autorizado']);
    }

    public function test_store_ignora_totales_y_estado_enviados_por_el_cliente(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/eventos', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Mitin central',
            'tipo' => 'mitin',
            'fecha_inicio' => now()->addDays(5)->toDateTimeString(),
            // Campos que NO deberían poder fijarse desde el cliente:
            'total_confirmados' => 5000,
            'total_asistentes' => 5000,
            'estado' => 'finalizado',
            'coordinador_id' => 999,
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('eventos', [
            'nombre' => 'Mitin central',
            'estado' => 'planificado',
            'total_confirmados' => 0,
            'total_asistentes' => 0,
            'coordinador_id' => null,
        ]);
    }
}
