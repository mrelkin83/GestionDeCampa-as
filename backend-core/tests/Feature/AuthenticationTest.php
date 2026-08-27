<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear rol de prueba
        $role = Role::create([
            'name' => 'admin',
            'display_name' => 'Administrador',
            'description' => 'Rol de prueba',
        ]);

        // Crear usuario de prueba
        User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '1234567890',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'full_name', 'email'],
                    'token',
                    'ws_token',
                ],
            ]);

        $this->assertNotNull($response->json('data.token'));
        $this->assertNotNull($response->json('data.ws_token'));
    }

    /**
     * ws_token es lo que el frontend usa para autenticarse contra
     * backend-diad (REST/WebSocket de Día D vía JWT_SECRET compartido).
     * Antes de este cambio no existía ningún emisor real de JWT: solo se
     * podía llegar a este punto usando el token opaco de Sanctum, que los
     * guards de backend-diad rechazan siempre.
     */
    public function test_ws_token_es_un_jwt_valido_con_los_claims_esperados(): void
    {
        $user = User::where('email', 'test@example.com')->first();

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $wsToken = $response->json('data.ws_token');
        $this->assertNotNull($wsToken);

        $secret = config('services.jwt_ws.secret');
        $payload = JWT::decode($wsToken, new Key($secret, 'HS256'));

        $this->assertSame($user->id, $payload->sub);
        $this->assertSame($user->email, $payload->email);
        $this->assertSame('admin', $payload->role);
        $this->assertGreaterThan($payload->iat, $payload->exp);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    public function test_user_can_view_profile(): void
    {
        $user = User::where('email', 'test@example.com')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'full_name', 'email', 'role'],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'test@example.com',
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }
}
