<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\Votante;
use App\Models\Donante;
use App\Models\Donacion;
use App\Models\Gasto;
use App\Models\Evento;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Campana $campana;
    private Municipio $municipio;

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
            'email' => 'analytics-test@example.com',
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
            'nombre' => 'Campaña Analytics',
            'slug' => 'campana-analytics',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Prueba',
        ]);

        $departamento = Departamento::create(['codigo' => '05', 'nombre' => 'Antioquia']);
        $this->municipio = Municipio::create([
            'codigo' => '05001',
            'codigo_departamento' => '05',
            'codigo_municipio' => '001',
            'nombre' => 'Medellín',
            'departamento_id' => $departamento->id,
            'tipo' => 'municipio',
        ]);
    }

    public function test_general_rechaza_a_usuario_sin_acceso_a_la_campana(): void
    {
        $roleOperador = Role::create([
            'name' => 'operador',
            'display_name' => 'Operador',
            'description' => 'Rol de prueba sin acceso especial',
        ]);
        $userSinAcceso = User::create([
            'first_name' => 'Sin',
            'last_name' => 'Acceso',
            'email' => 'sin-acceso-analytics@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567897',
        ]);
        $token = $userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->getJson('/api/analytics/general?campana_id=' . $this->campana->id, [
            'Authorization' => "Bearer $token",
        ]);

        $response->assertStatus(403);
    }

    public function test_general_exige_campana_id(): void
    {
        $response = $this->getJson('/api/analytics/general', $this->authHeader());
        $response->assertStatus(422);
    }

    public function test_votantes_calcula_totales_y_distribuciones_reales(): void
    {
        Votante::create([
            'campana_id' => $this->campana->id,
            'documento' => '1000000001',
            'tipo_documento' => 'CC',
            'primer_nombre' => 'Ana',
            'primer_apellido' => 'Gómez',
            'genero' => 'F',
            'edad' => 30,
            'municipio_id' => $this->municipio->id,
            'intencion_voto' => 'a_favor',
        ]);
        Votante::create([
            'campana_id' => $this->campana->id,
            'documento' => '1000000002',
            'tipo_documento' => 'CC',
            'primer_nombre' => 'Juan',
            'primer_apellido' => 'Pérez',
            'genero' => 'M',
            'edad' => 45,
            'municipio_id' => $this->municipio->id,
            'intencion_voto' => 'en_contra',
        ]);

        $response = $this->getJson('/api/analytics/votantes?campana_id=' . $this->campana->id, $this->authHeader());

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertEquals(2, $data['total_votantes']);
        $this->assertCount(1, $data['distribucion_por_departamento']);
        $this->assertEquals('Antioquia', $data['distribucion_por_departamento'][0]['nombre']);
        $this->assertEquals(2, $data['distribucion_por_departamento'][0]['valor']);

        $porGenero = collect($data['distribucion_por_genero'])->keyBy('nombre');
        $this->assertEquals(1, $porGenero['Femenino']['valor']);
        $this->assertEquals(1, $porGenero['Masculino']['valor']);

        $rango3045 = collect($data['distribucion_por_rango_edad'])->firstWhere('nombre', '26-35');
        $this->assertEquals(1, $rango3045['valor']);
    }

    public function test_financiero_calcula_totales_reales_y_no_incluye_gastos_pendientes(): void
    {
        $donante = Donante::create([
            'campana_id' => $this->campana->id,
            'tipo' => 'persona_natural',
            'documento' => '9999999999',
            'nombres' => 'Donante',
            'apellidos' => 'Uno',
            'total_donado' => 500000,
            'numero_donaciones' => 1,
        ]);
        Donacion::create([
            'campana_id' => $this->campana->id,
            'donante_id' => $donante->id,
            'registrado_por_id' => $this->user->id,
            'monto' => 500000,
            'moneda' => 'COP',
            'tipo' => 'transferencia',
            'fecha_donacion' => now(),
            'fecha_registro' => now(),
            'estado' => 'confirmada',
        ]);
        Gasto::create([
            'campana_id' => $this->campana->id,
            'categoria' => 'publicidad',
            'descripcion' => 'Vallas aprobadas',
            'monto' => 100000,
            'moneda' => 'COP',
            'fecha_gasto' => now(),
            'fecha_registro' => now(),
            'responsable_id' => $this->user->id,
            'estado' => 'aprobado',
        ]);
        // Gasto todavía pendiente de aprobación: no debe contarse en total_egresos.
        Gasto::create([
            'campana_id' => $this->campana->id,
            'categoria' => 'logistica',
            'descripcion' => 'Aún sin aprobar',
            'monto' => 999999,
            'moneda' => 'COP',
            'fecha_gasto' => now(),
            'fecha_registro' => now(),
            'responsable_id' => $this->user->id,
            'estado' => 'pendiente',
        ]);

        $response = $this->getJson('/api/analytics/financiero?campana_id=' . $this->campana->id, $this->authHeader());

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertEquals(500000, $data['total_ingresos']);
        $this->assertEquals(100000, $data['total_egresos']);
        $this->assertEquals(400000, $data['balance_actual']);
        $this->assertCount(1, $data['top_donantes']);
        $this->assertEquals('Donante Uno', $data['top_donantes'][0]['nombre']);
        // gastos_pendientes_pago cuenta estado='aprobado' (aprobado, esperando pago):
        // el gasto de 100000 cuenta; el de 999999 sigue en 'pendiente' (ni
        // siquiera aprobado) y no debe contarse en ningún lado.
        $this->assertEquals(1, $data['gastos_pendientes_pago']);
    }

    public function test_general_combina_los_cuatro_modulos_y_el_resumen_ejecutivo(): void
    {
        Votante::create([
            'campana_id' => $this->campana->id,
            'documento' => '1000000003',
            'tipo_documento' => 'CC',
            'primer_nombre' => 'Carlos',
            'primer_apellido' => 'Ruiz',
            'genero' => 'M',
            'municipio_id' => $this->municipio->id,
        ]);
        Evento::create([
            'campana_id' => $this->campana->id,
            'created_by_id' => $this->user->id,
            'nombre' => 'Mitin',
            'tipo' => 'mitin',
            'fecha_inicio' => now(),
            'estado' => 'finalizado',
        ]);

        $response = $this->getJson('/api/analytics/general?campana_id=' . $this->campana->id, $this->authHeader());

        $response->assertStatus(200);
        $data = $response->json('data');

        $this->assertArrayHasKey('votantes', $data);
        $this->assertArrayHasKey('financiero', $data);
        $this->assertArrayHasKey('comunicacion', $data);
        $this->assertArrayHasKey('eventos', $data);
        $this->assertArrayHasKey('resumen_ejecutivo', $data);
        $this->assertEquals(1, $data['votantes']['total_votantes']);
        $this->assertEquals(1, $data['eventos']['total_eventos']);
        $this->assertContains($data['resumen_ejecutivo']['base_votantes']['tendencia'], ['subiendo', 'bajando', 'estable']);
    }

    private function authHeader(): array
    {
        $token = $this->user->createToken('test-token')->plainTextToken;
        return ['Authorization' => "Bearer $token"];
    }
}
