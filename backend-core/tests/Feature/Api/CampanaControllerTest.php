<?php

namespace Tests\Feature\Api;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use App\Models\CargoElectoral;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CampanaControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // store() depende de que exista el rol "admin_campana" (lo asigna
        // al creador de la campaña); se corre el seeder real en vez de crear
        // un rol suelto, para que el test refleje lo que realmente hay en
        // producción tras `migrate --seed`.
        $this->seed(RolesAndPermissionsSeeder::class);

        $role = Role::where('name', 'super_admin')->first();
        $this->user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'campana-test@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '1234567890',
        ]);
    }

    public function test_crear_campana_asigna_al_creador_como_admin_campana(): void
    {
        $cargo = CargoElectoral::create([
            'nombre' => 'Alcaldía',
            'tipo_eleccion' => 'territorial',
            'nivel' => 'municipal',
        ]);

        $response = $this->postJson('/api/campanas', [
            'nombre' => 'Campaña Integración',
            'cargo_electoral_id' => $cargo->id,
            'fecha_eleccion' => now()->addMonths(3)->toDateString(),
            'tipo_eleccion' => 'primera_vuelta',
            'candidato_nombre' => 'Candidato X',
        ], $this->authHeader());

        $response->assertStatus(201);

        $campanaId = $response->json('data.id');
        $this->assertNotNull($campanaId);

        $this->assertDatabaseHas('campana_user', [
            'campana_id' => $campanaId,
            'user_id' => $this->user->id,
            'is_active' => true,
        ]);
    }

    private function authHeader(): array
    {
        $token = $this->user->createToken('test-token')->plainTextToken;
        return ['Authorization' => "Bearer $token"];
    }
}
