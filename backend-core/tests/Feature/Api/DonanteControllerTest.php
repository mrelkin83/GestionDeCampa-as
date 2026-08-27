<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DonanteControllerTest extends TestCase
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
            'email' => 'donante-test@example.com',
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
            'nombre' => 'Campaña Donantes',
            'slug' => 'campana-donantes',
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
            'email' => 'sin-acceso-donante@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567891',
        ]);
        $token = $userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/donantes', [
            'campana_id' => $this->campana->id,
            'tipo' => 'persona_natural',
            'documento' => '444555666',
            'tipo_documento' => 'CC',
            'nombres' => 'Ana',
            'apellidos' => 'Gómez',
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('donantes', ['documento' => '444555666']);
    }

    public function test_store_ignora_total_donado_y_numero_donaciones_enviados_por_el_cliente(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/donantes', [
            'campana_id' => $this->campana->id,
            'tipo' => 'persona_natural',
            'documento' => '111222333',
            'tipo_documento' => 'CC',
            'nombres' => 'Juan',
            'apellidos' => 'Pérez',
            // Campos que NO deberían poder fijarse desde el cliente:
            'total_donado' => 999999999,
            'numero_donaciones' => 500,
            'razon_invalido' => 'inyectado por el cliente',
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('donantes', [
            'documento' => '111222333',
            'total_donado' => 0,
            'numero_donaciones' => 0,
            'razon_invalido' => null,
        ]);
    }
}
