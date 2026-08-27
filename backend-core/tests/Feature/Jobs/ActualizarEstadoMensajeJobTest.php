<?php

namespace Tests\Feature\Jobs;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\Campana;
use App\Models\CargoElectoral;
use App\Models\Votante;
use App\Models\CampanaComunicacion;
use App\Models\Mensaje;
use App\Jobs\ActualizarEstadoMensajeJob;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * actualizarEstadisticasCampana() usaba comillas dobles ("enviado") en SQL
 * crudo -son identificadores en PostgreSQL, no literales de cadena- así que
 * SIEMPRE lanzaba "column \"enviado\" does not exist" y el job fallaba
 * entero (con reintentos) cada vez que un mensaje de una campaña de
 * comunicación cambiaba de estado. Además, el merge de metadata escribía en
 * 'metadata' en vez de la columna real 'metadata_proveedor', perdiendo esos
 * datos en silencio.
 */
class ActualizarEstadoMensajeJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_actualiza_estado_y_estadisticas_sin_error_de_sql(): void
    {
        $role = Role::create([
            'name' => 'super_admin',
            'display_name' => 'Super Admin',
            'description' => 'Rol de prueba',
        ]);
        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'mensaje-job-test@example.com',
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

        $campana = Campana::create([
            'nombre' => 'Campaña Mensajes',
            'slug' => 'campana-mensajes-job',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato Prueba',
        ]);

        $votante = Votante::create([
            'campana_id' => $campana->id,
            'documento' => '999888777',
            'primer_nombre' => 'Ana',
            'primer_apellido' => 'Gómez',
        ]);

        $campanaComunicacion = CampanaComunicacion::create([
            'campana_id' => $campana->id,
            'created_by_id' => $user->id,
            'nombre' => 'Campaña SMS de prueba',
            'canal' => 'sms',
        ]);

        $mensaje = Mensaje::create([
            'campana_comunicacion_id' => $campanaComunicacion->id,
            'votante_id' => $votante->id,
            'canal' => 'sms',
            'destinatario' => '3001234567',
            'contenido' => 'Mensaje de prueba',
            'estado' => 'enviado',
            'proveedor' => 'twilio',
            'mensaje_id_externo' => 'SM123',
        ]);

        // No debe lanzar ninguna excepción SQL.
        (new ActualizarEstadoMensajeJob($mensaje->id, 'entregado', [
            'twilio_status' => 'delivered',
            'price' => '-0.0075',
        ]))->handle();

        $mensaje->refresh();
        $this->assertEquals('entregado', $mensaje->estado);
        $this->assertNotNull($mensaje->fecha_entrega);
        $this->assertEquals('delivered', $mensaje->metadata_proveedor['twilio_status'] ?? null);

        $campanaComunicacion->refresh();
        $this->assertEquals(1, $campanaComunicacion->total_enviados);
        $this->assertEquals(1, $campanaComunicacion->total_entregados);
        $this->assertEquals(100.0, (float) $campanaComunicacion->tasa_entrega);
    }
}
