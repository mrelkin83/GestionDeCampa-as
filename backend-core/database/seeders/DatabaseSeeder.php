<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Roles y permisos (primero)
            RolesAndPermissionsSeeder::class,

            // 2. Estructura electoral
            DepartamentosSeeder::class,
            MunicipiosSeeder::class,

            // 3. Usuarios iniciales
            AdminUserSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('🎉 Database seeding completado exitosamente!');
        $this->command->info('');
        $this->command->info('📊 Resumen:');
        $this->command->info('  - 6 roles creados');
        $this->command->info('  - 33 departamentos creados');
        $this->command->info('  - ~50 municipios principales creados');
        $this->command->info('  - 5 usuarios de ejemplo creados');
        $this->command->info('');
        $this->command->warn('⚠️  Próximos pasos:');
        $this->command->warn('  1. Cambiar contraseñas de usuarios iniciales');
        $this->command->warn('  2. Importar municipios completos (1102)');
        $this->command->warn('  3. Importar censo electoral');
        $this->command->warn('  4. Crear campaña de prueba');
    }
}
