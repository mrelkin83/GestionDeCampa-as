<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GastoControllerTest extends TestCase
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
            'email' => 'gasto-test@example.com',
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
            'nombre' => 'Campaña Gastos',
            'slug' => 'campana-gastos',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Prueba',
        ]);
    }

    public function test_store_ignora_campos_de_aprobacion_y_reporte_cne_enviados_por_el_cliente(): void
    {
        $token = $this->user->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/gastos', [
            'campana_id' => $this->campana->id,
            'categoria' => 'publicidad',
            'descripcion' => 'Vallas publicitarias',
            'monto' => 1000000,
            'moneda' => 'COP',
            'fecha_gasto' => now()->toDateString(),
            // Campos que NO deberían poder fijarse desde el cliente:
            'aprobado_por_id' => $this->user->id,
            'fecha_aprobacion' => now()->toDateString(),
            'reportado_cne' => true,
            'numero_reporte_cne' => 'FAKE-001',
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('gastos', [
            'descripcion' => 'Vallas publicitarias',
            'estado' => 'pendiente',
            'aprobado_por_id' => null,
            'fecha_aprobacion' => null,
            'reportado_cne' => false,
            'numero_reporte_cne' => null,
        ]);
    }
}
