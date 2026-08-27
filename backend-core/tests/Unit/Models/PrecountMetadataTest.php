<?php

namespace Tests\Unit\Models;

use App\Models\PrecountMetadata;
use App\Models\PrecountRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrecountMetadataTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_metadata_con_factory()
    {
        $metadata = PrecountMetadata::factory()->create();

        $this->assertDatabaseHas('precount_metadata', [
            'id' => $metadata->id,
            'rol' => $metadata->rol
        ]);
    }

    /** @test */
    public function accesor_gps_retorna_array_con_coordenadas()
    {
        $metadata = PrecountMetadata::factory()->create([
            'gps_lat' => 4.60971,
            'gps_lng' => -74.08175
        ]);

        $gps = $metadata->gps;

        $this->assertIsArray($gps);
        $this->assertEquals(4.60971, $gps['lat']);
        $this->assertEquals(-74.08175, $gps['lng']);
    }

    /** @test */
    public function accesor_gps_retorna_null_si_no_hay_coordenadas()
    {
        $metadata = PrecountMetadata::factory()->create([
            'gps_lat' => null,
            'gps_lng' => null
        ]);

        $this->assertNull($metadata->gps);
    }

    /** @test */
    public function scope_offline_filtra_correctamente()
    {
        PrecountMetadata::factory()->count(3)->create(['offline' => true]);
        PrecountMetadata::factory()->count(2)->create(['offline' => false]);

        $this->assertEquals(3, PrecountMetadata::offline()->count());
    }

    /** @test */
    public function scope_by_usuario_filtra_correctamente()
    {
        $usuario1 = User::factory()->create();
        $usuario2 = User::factory()->create();

        PrecountMetadata::factory()->count(3)->create([
            'reportado_por_usuario_id' => $usuario1->id
        ]);
        PrecountMetadata::factory()->count(2)->create([
            'reportado_por_usuario_id' => $usuario2->id
        ]);

        $this->assertEquals(3, PrecountMetadata::byUsuario($usuario1->id)->count());
        $this->assertEquals(2, PrecountMetadata::byUsuario($usuario2->id)->count());
    }

    /** @test */
    public function metodo_marcar_sincronizado_actualiza_fecha()
    {
        $metadata = PrecountMetadata::factory()->create([
            'offline' => true,
            'sincronizado_at' => null
        ]);

        $metadata->marcarSincronizado();
        $metadata->refresh();

        $this->assertNotNull($metadata->sincronizado_at);
    }

    /** @test */
    public function tiene_relacion_con_record()
    {
        $record = PrecountRecord::factory()->create();
        $metadata = PrecountMetadata::factory()->create([
            'precount_record_id' => $record->id
        ]);

        $this->assertInstanceOf(PrecountRecord::class, $metadata->record);
        $this->assertEquals($record->id, $metadata->record->id);
    }

    /** @test */
    public function tiene_relacion_con_usuario()
    {
        $user = User::factory()->create();
        $metadata = PrecountMetadata::factory()->create([
            'reportado_por_usuario_id' => $user->id
        ]);

        $this->assertInstanceOf(User::class, $metadata->usuario);
        $this->assertEquals($user->id, $metadata->usuario->id);
    }
}
