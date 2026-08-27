<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear rol de prueba
        Role::create([
            'name' => 'test_role',
            'display_name' => 'Test Role',
            'description' => 'Rol de prueba',
        ]);
    }

    public function test_user_has_role_relationship(): void
    {
        $role = Role::where('name', 'test_role')->first();

        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '1234567890',
        ]);

        $this->assertNotNull($user->role);
        $this->assertEquals('test_role', $user->role->name);
    }

    public function test_user_password_is_hashed(): void
    {
        $role = Role::first();

        $user = User::create([
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test2@example.com',
            'password' => bcrypt('plain-password'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '1234567891',
        ]);

        $this->assertNotEquals('plain-password', $user->password);
        $this->assertTrue(password_verify('plain-password', $user->password));
    }

    public function test_user_email_is_unique(): void
    {
        $role = Role::first();

        User::create([
            'first_name' => 'User',
            'last_name' => 'One',
            'email' => 'unique@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '1111111111',
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        User::create([
            'first_name' => 'User',
            'last_name' => 'Two',
            'email' => 'unique@example.com',  // Duplicate email
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '2222222222',
        ]);
    }

    public function test_has_permission_matches_wildcard_module_permission(): void
    {
        // hasPermission() comparaba con === exacto: un rol con
        // 'donaciones.*' (como admin_campana en el seeder real) nunca
        // coincidía con un permiso concreto como 'donaciones.confirmar'.
        $role = Role::create([
            'name' => 'admin_campana_test',
            'display_name' => 'Admin Campaña Test',
            'permissions' => ['donaciones.*', 'crm.view'],
        ]);

        $user = User::create([
            'first_name' => 'Admin',
            'last_name' => 'Campana',
            'email' => 'admin-campana@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '3333333333',
        ]);

        $this->assertTrue($user->hasPermission('donaciones.confirmar'));
        $this->assertTrue($user->hasPermission('donaciones.rechazar'));
        $this->assertTrue($user->hasPermission('crm.view'));
        $this->assertFalse($user->hasPermission('gastos.aprobar'));
    }

    public function test_has_permission_super_wildcard_matches_everything(): void
    {
        $role = Role::create([
            'name' => 'super_test',
            'display_name' => 'Super Test',
            'permissions' => ['*'],
        ]);

        $user = User::create([
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'super-admin-test@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'document_type' => 'CC',
            'document_number' => '4444444444',
        ]);

        $this->assertTrue($user->hasPermission('cualquier.cosa'));
    }
}
