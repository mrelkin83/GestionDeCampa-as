<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use App\Models\Donante;
use App\Models\TopeLegal;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * confirmar() no recalculaba el total/porcentaje de topes legales -solo
 * store() lo hacía, pero en ese momento la donación sigue 'pendiente' y
 * Donacion::confirmadas() no la cuenta, así que era un recálculo sin
 * efecto real. El total solo debe reflejar donaciones CONFIRMADAS.
 */
class DonacionTopeLegalTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Campana $campana;
    private Donante $donante;
    private TopeLegal $topeLegal;

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
            'email' => 'admin-test@example.com',
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
            'nombre' => 'Campaña de Prueba',
            'slug' => 'campana-de-prueba',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Prueba',
        ]);

        $this->donante = Donante::create([
            'campana_id' => $this->campana->id,
            'tipo' => 'persona_natural',
            'documento' => '9999999999',
            'nombres' => 'Donante',
            'apellidos' => 'Prueba',
        ]);

        $this->topeLegal = TopeLegal::create([
            'campana_id' => $this->campana->id,
            'tipo_eleccion' => 'alcaldia',
            'nivel' => 'municipal',
            'ano_eleccion' => now()->year,
            'tope_gastos' => 100000000,
            'tope_donaciones_individuales' => 1000000,
        ]);
    }

    public function test_confirmar_donacion_actualiza_el_total_de_topes_legales(): void
    {
        $donacion = $this->postJson('/api/donaciones', [
            'campana_id' => $this->campana->id,
            'donante_id' => $this->donante->id,
            'monto' => 500000,
            'moneda' => 'COP',
            'tipo' => 'transferencia',
            'fecha_donacion' => now()->toDateString(),
        ], $this->authHeader())->json('data');

        // Justo tras registrarse (pendiente), el total confirmado no cambia.
        $this->assertEquals(0, $this->topeLegal->fresh()->total_donaciones_actual);

        $this->postJson("/api/donaciones/{$donacion['id']}/confirmar", [
            'numero_comprobante' => 'COMP-001',
        ], $this->authHeader())->assertStatus(200);

        $fresh = $this->topeLegal->fresh();
        $this->assertEquals(500000, $fresh->total_donaciones_actual);
        $this->assertEquals(50.0, $fresh->porcentaje_tope_donaciones);
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
            'email' => 'sin-acceso-donacion@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567893',
        ]);
        $token = $userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/donaciones', [
            'campana_id' => $this->campana->id,
            'donante_id' => $this->donante->id,
            'monto' => 100000,
            'moneda' => 'COP',
            'tipo' => 'transferencia',
            'fecha_donacion' => now()->toDateString(),
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(403);
    }

    public function test_store_rechaza_donante_de_otra_campana(): void
    {
        $otraCampana = Campana::create([
            'nombre' => 'Otra Campaña',
            'slug' => 'otra-campana-donaciones',
            'cargo_electoral_id' => $this->campana->cargo_electoral_id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Otro Candidato',
        ]);
        $donanteAjeno = Donante::create([
            'campana_id' => $otraCampana->id,
            'tipo' => 'persona_natural',
            'documento' => '8888888888',
            'nombres' => 'Donante',
            'apellidos' => 'Ajeno',
        ]);

        $response = $this->postJson('/api/donaciones', [
            'campana_id' => $this->campana->id,
            'donante_id' => $donanteAjeno->id,
            'monto' => 100000,
            'moneda' => 'COP',
            'tipo' => 'transferencia',
            'fecha_donacion' => now()->toDateString(),
        ], $this->authHeader());

        $response->assertStatus(422);
        $this->assertDatabaseMissing('donaciones', ['donante_id' => $donanteAjeno->id]);
    }

    public function test_store_ignora_campos_de_reporte_cne_enviados_por_el_cliente(): void
    {
        $response = $this->postJson('/api/donaciones', [
            'campana_id' => $this->campana->id,
            'donante_id' => $this->donante->id,
            'monto' => 100000,
            'moneda' => 'COP',
            'tipo' => 'transferencia',
            'fecha_donacion' => now()->toDateString(),
            // Campos que NO deberían poder fijarse desde el cliente:
            'reportada_cne' => true,
            'numero_reporte_cne' => 'FAKE-001',
        ], $this->authHeader());

        $response->assertStatus(201);

        $this->assertDatabaseHas('donaciones', [
            'monto' => 100000,
            'estado' => 'pendiente',
            'reportada_cne' => false,
            'numero_reporte_cne' => null,
        ]);
    }

    private function authHeader(): array
    {
        $token = $this->user->createToken('test-token')->plainTextToken;
        return ['Authorization' => "Bearer $token"];
    }
}
