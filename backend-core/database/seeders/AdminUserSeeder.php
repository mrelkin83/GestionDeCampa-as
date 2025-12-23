<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Obtener rol super_admin
        $superAdminRole = Role::where('name', 'super_admin')->first();

        if (!$superAdminRole) {
            $this->command->error('❌ Rol super_admin no encontrado. Ejecute RolesAndPermissionsSeeder primero.');
            return;
        }

        // Verificar si ya existe un usuario admin
        $existingAdmin = User::where('email', 'admin@plataforma.com')->first();

        if ($existingAdmin) {
            $this->command->warn('⚠️  Usuario administrador ya existe: admin@plataforma.com');
            return;
        }

        // Crear usuario super admin
        $admin = User::create([
            'email' => 'admin@plataforma.com',
            'password' => Hash::make('Admin2024!'), // Cambiar en producción
            'first_name' => 'Super',
            'last_name' => 'Administrador',
            'phone' => '+57 300 000 0000',
            'document_type' => 'CC',
            'document_number' => '1000000000',
            'role_id' => $superAdminRole->id,
            'is_active' => true,
            'email_verified_at' => $now,
        ]);

        $this->command->info('');
        $this->command->info('✅ Usuario Super Administrador creado exitosamente');
        $this->command->info('');
        $this->command->info('📧 Email: admin@plataforma.com');
        $this->command->info('🔑 Password: Admin2024!');
        $this->command->info('');
        $this->command->warn('⚠️  IMPORTANTE: Cambiar la contraseña después del primer login');
        $this->command->info('');

        // Crear usuarios de ejemplo adicionales
        $this->createExampleUsers($superAdminRole->id);
    }

    /**
     * Crear usuarios de ejemplo para testing
     */
    private function createExampleUsers(int $superAdminRoleId): void
    {
        $now = Carbon::now();

        // Obtener roles
        $adminCampanaRole = Role::where('name', 'admin_campana')->first();
        $coordinadorRole = Role::where('name', 'coordinador')->first();
        $operadorRole = Role::where('name', 'operador_call_center')->first();
        $testigoRole = Role::where('name', 'testigo')->first();

        $exampleUsers = [
            [
                'email' => 'director@campana.com',
                'password' => Hash::make('Director2024!'),
                'first_name' => 'Juan',
                'last_name' => 'Pérez García',
                'phone' => '+57 310 111 1111',
                'document_type' => 'CC',
                'document_number' => '1000000001',
                'role_id' => $adminCampanaRole->id,
                'is_active' => true,
                'email_verified_at' => $now,
            ],
            [
                'email' => 'coordinador@campana.com',
                'password' => Hash::make('Coordinador2024!'),
                'first_name' => 'María',
                'last_name' => 'Rodríguez López',
                'phone' => '+57 320 222 2222',
                'document_type' => 'CC',
                'document_number' => '1000000002',
                'role_id' => $coordinadorRole->id,
                'is_active' => true,
                'email_verified_at' => $now,
            ],
            [
                'email' => 'operador@campana.com',
                'password' => Hash::make('Operador2024!'),
                'first_name' => 'Carlos',
                'last_name' => 'Martínez Silva',
                'phone' => '+57 330 333 3333',
                'document_type' => 'CC',
                'document_number' => '1000000003',
                'role_id' => $operadorRole->id,
                'is_active' => true,
                'email_verified_at' => $now,
            ],
            [
                'email' => 'testigo@campana.com',
                'password' => Hash::make('Testigo2024!'),
                'first_name' => 'Ana',
                'last_name' => 'González Ramírez',
                'phone' => '+57 340 444 4444',
                'document_type' => 'CC',
                'document_number' => '1000000004',
                'role_id' => $testigoRole->id,
                'is_active' => true,
                'email_verified_at' => $now,
            ],
        ];

        foreach ($exampleUsers as $userData) {
            User::create($userData);
        }

        $this->command->info('✅ 4 usuarios de ejemplo creados:');
        $this->command->info('   - director@campana.com / Director2024!');
        $this->command->info('   - coordinador@campana.com / Coordinador2024!');
        $this->command->info('   - operador@campana.com / Operador2024!');
        $this->command->info('   - testigo@campana.com / Testigo2024!');
    }
}
