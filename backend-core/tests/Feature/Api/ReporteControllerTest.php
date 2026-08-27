<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use App\Models\Donante;
use App\Models\Donacion;
use App\Models\Gasto;
use App\Models\Evento;
use App\Models\Reporte;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

class ReporteControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Campana $campana;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');

        $role = Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Admin',
            'description' => 'Rol de prueba',
        ]);

        $this->user = User::create([
            'first_name' => 'Test',
            'last_name' => 'Admin',
            'email' => 'reporte-test@example.com',
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
            'nombre' => 'Campaña Reportes',
            'slug' => 'campana-reportes',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Prueba',
        ]);
    }

    public function test_generar_rechaza_a_usuario_sin_acceso_a_la_campana(): void
    {
        $roleOperador = Role::create([
            'name' => 'operador',
            'display_name' => 'Operador',
            'description' => 'Rol de prueba sin acceso especial',
        ]);
        $userSinAcceso = User::create([
            'first_name' => 'Sin',
            'last_name' => 'Acceso',
            'email' => 'sin-acceso-reporte@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $roleOperador->id,
            'document_type' => 'CC',
            'document_number' => '1234567896',
        ]);
        $token = $userSinAcceso->createToken('test-token')->plainTextToken;

        $response = $this->postJson('/api/reportes/generar', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Reporte no autorizado',
            'tipo' => 'general',
            'formato' => 'csv',
        ], ['Authorization' => "Bearer $token"]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('reportes', ['nombre' => 'Reporte no autorizado']);
    }

    public function test_genera_reporte_de_eventos_en_csv_con_datos_reales(): void
    {
        Evento::create([
            'campana_id' => $this->campana->id,
            'created_by_id' => $this->user->id,
            'nombre' => 'Mitin central',
            'tipo' => 'mitin',
            'fecha_inicio' => now(),
            'estado' => 'finalizado',
            'total_asistentes' => 250,
        ]);

        $response = $this->postJson('/api/reportes/generar', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Reporte de eventos',
            'tipo' => 'eventos',
            'formato' => 'csv',
        ], $this->authHeader());

        $response->assertStatus(201);
        $reporte = Reporte::first();
        $this->assertEquals('completado', $reporte->estado);
        $this->assertNotNull($reporte->archivo_path);
        Storage::disk('local')->assertExists($reporte->archivo_path);

        $contenido = Storage::disk('local')->get($reporte->archivo_path);
        $this->assertStringContainsString('Total de eventos', $contenido);
        $this->assertStringContainsString('mitin', $contenido);
    }

    public function test_genera_reporte_financiero_en_pdf_con_donaciones_y_gastos_reales(): void
    {
        $donante = Donante::create([
            'campana_id' => $this->campana->id,
            'tipo' => 'persona_natural',
            'documento' => '9999999999',
            'nombres' => 'Donante',
            'apellidos' => 'Prueba',
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
            'descripcion' => 'Vallas',
            'monto' => 200000,
            'moneda' => 'COP',
            'fecha_gasto' => now(),
            'fecha_registro' => now(),
            'responsable_id' => $this->user->id,
            'estado' => 'aprobado',
        ]);

        $response = $this->postJson('/api/reportes/generar', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Reporte financiero',
            'tipo' => 'financiero',
            'formato' => 'pdf',
        ], $this->authHeader());

        $response->assertStatus(201);
        $reporte = Reporte::first();
        $this->assertEquals('completado', $reporte->estado);
        Storage::disk('local')->assertExists($reporte->archivo_path);

        // PDF válido: dompdf siempre produce un archivo que arranca con el header %PDF-
        $contenido = Storage::disk('local')->get($reporte->archivo_path);
        $this->assertStringStartsWith('%PDF-', $contenido);
    }

    public function test_genera_reporte_general_en_excel(): void
    {
        $response = $this->postJson('/api/reportes/generar', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Reporte general',
            'tipo' => 'general',
            'formato' => 'excel',
        ], $this->authHeader());

        $response->assertStatus(201);
        $reporte = Reporte::first();
        $this->assertEquals('completado', $reporte->estado);
        Storage::disk('local')->assertExists($reporte->archivo_path);
        $this->assertStringEndsWith('.xlsx', $reporte->archivo_path);
    }

    public function test_descargar_reporte_no_completado_retorna_409(): void
    {
        $reporte = Reporte::create([
            'campana_id' => $this->campana->id,
            'generado_por_id' => $this->user->id,
            'nombre' => 'En proceso',
            'tipo' => 'general',
            'formato' => 'pdf',
            'estado' => 'generando',
        ]);

        $response = $this->getJson("/api/reportes/{$reporte->id}/descargar", $this->authHeader());

        $response->assertStatus(409);
    }

    public function test_descargar_reporte_completado_retorna_el_archivo(): void
    {
        $this->postJson('/api/reportes/generar', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Reporte descargable',
            'tipo' => 'eventos',
            'formato' => 'csv',
        ], $this->authHeader());

        $reporte = Reporte::first();

        $response = $this->get("/api/reportes/{$reporte->id}/descargar", $this->authHeader());

        $response->assertStatus(200);
    }

    public function test_eliminar_reporte_borra_registro_y_archivo(): void
    {
        $this->postJson('/api/reportes/generar', [
            'campana_id' => $this->campana->id,
            'nombre' => 'Reporte a borrar',
            'tipo' => 'eventos',
            'formato' => 'csv',
        ], $this->authHeader());

        $reporte = Reporte::first();
        $path = $reporte->archivo_path;

        $response = $this->deleteJson("/api/reportes/{$reporte->id}", [], $this->authHeader());

        $response->assertStatus(200);
        $this->assertDatabaseMissing('reportes', ['id' => $reporte->id]);
        Storage::disk('local')->assertMissing($path);
    }

    public function test_index_filtra_por_campana_y_exige_campana_id(): void
    {
        $response = $this->getJson('/api/reportes', $this->authHeader());
        $response->assertStatus(400);

        $response = $this->getJson('/api/reportes?campana_id=' . $this->campana->id, $this->authHeader());
        $response->assertStatus(200);
        $response->assertJson(['success' => true, 'data' => []]);
    }

    private function authHeader(): array
    {
        $token = $this->user->createToken('test-token')->plainTextToken;
        return ['Authorization' => "Bearer $token"];
    }
}
