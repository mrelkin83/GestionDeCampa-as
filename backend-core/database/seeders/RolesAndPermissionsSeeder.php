<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Crear roles base
        $roles = [
            [
                'name' => 'super_admin',
                'display_name' => 'Super Administrador',
                'description' => 'Acceso total al sistema, gestión de múltiples campañas',
                'permissions' => json_encode(['*']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'admin_campana',
                'display_name' => 'Administrador de Campaña',
                'description' => 'Acceso completo a su campaña asignada',
                'permissions' => json_encode(['campana.*', 'crm.*', 'comunicacion.*', 'eventos.*', 'donaciones.*', 'reportes.*']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'coordinador',
                'display_name' => 'Coordinador Territorial',
                'description' => 'Gestión territorial, líderes y votantes de su zona',
                'permissions' => json_encode(['crm.view', 'crm.edit', 'eventos.view', 'eventos.create', 'comunicacion.view']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'operador_call_center',
                'display_name' => 'Operador Call Center',
                'description' => 'Registro de contactos y actualización de votantes',
                'permissions' => json_encode(['crm.view', 'crm.edit', 'comunicacion.view']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'analista',
                'display_name' => 'Analista',
                'description' => 'Solo visualización de datos y reportes',
                'permissions' => json_encode(['*.view', 'reportes.*']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'testigo',
                'display_name' => 'Testigo Electoral',
                'description' => 'Acceso solo a PWA Día D para reportar actas',
                'permissions' => json_encode(['diad.actas.create', 'diad.actas.view']),
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('roles')->insert($roles);

        // Crear permisos granulares (ejemplos)
        $permissions = [
            // CRM
            ['module' => 'crm', 'action' => 'view', 'resource' => 'votantes', 'name' => 'crm.votantes.view', 'description' => 'Ver listado de votantes'],
            ['module' => 'crm', 'action' => 'create', 'resource' => 'votantes', 'name' => 'crm.votantes.create', 'description' => 'Crear nuevos votantes'],
            ['module' => 'crm', 'action' => 'edit', 'resource' => 'votantes', 'name' => 'crm.votantes.edit', 'description' => 'Editar votantes'],
            ['module' => 'crm', 'action' => 'delete', 'resource' => 'votantes', 'name' => 'crm.votantes.delete', 'description' => 'Eliminar votantes'],
            ['module' => 'crm', 'action' => 'export', 'resource' => 'votantes', 'name' => 'crm.votantes.export', 'description' => 'Exportar votantes'],

            // Comunicación
            ['module' => 'comunicacion', 'action' => 'view', 'resource' => 'campañas', 'name' => 'comunicacion.campanas.view', 'description' => 'Ver campañas de comunicación'],
            ['module' => 'comunicacion', 'action' => 'create', 'resource' => 'campañas', 'name' => 'comunicacion.campanas.create', 'description' => 'Crear campañas de comunicación'],
            ['module' => 'comunicacion', 'action' => 'send', 'resource' => 'sms', 'name' => 'comunicacion.sms.send', 'description' => 'Enviar SMS'],
            ['module' => 'comunicacion', 'action' => 'send', 'resource' => 'email', 'name' => 'comunicacion.email.send', 'description' => 'Enviar emails'],
            ['module' => 'comunicacion', 'action' => 'send', 'resource' => 'whatsapp', 'name' => 'comunicacion.whatsapp.send', 'description' => 'Enviar WhatsApp'],

            // Eventos
            ['module' => 'eventos', 'action' => 'view', 'resource' => 'eventos', 'name' => 'eventos.eventos.view', 'description' => 'Ver eventos'],
            ['module' => 'eventos', 'action' => 'create', 'resource' => 'eventos', 'name' => 'eventos.eventos.create', 'description' => 'Crear eventos'],
            ['module' => 'eventos', 'action' => 'edit', 'resource' => 'eventos', 'name' => 'eventos.eventos.edit', 'description' => 'Editar eventos'],

            // Donaciones
            ['module' => 'donaciones', 'action' => 'view', 'resource' => 'donaciones', 'name' => 'donaciones.donaciones.view', 'description' => 'Ver donaciones'],
            ['module' => 'donaciones', 'action' => 'create', 'resource' => 'donaciones', 'name' => 'donaciones.donaciones.create', 'description' => 'Registrar donaciones'],
            ['module' => 'donaciones', 'action' => 'export', 'resource' => 'reportes_cne', 'name' => 'donaciones.reportes_cne.export', 'description' => 'Exportar reportes CNE'],

            // Día D
            ['module' => 'diad', 'action' => 'view', 'resource' => 'actas', 'name' => 'diad.actas.view', 'description' => 'Ver actas'],
            ['module' => 'diad', 'action' => 'create', 'resource' => 'actas', 'name' => 'diad.actas.create', 'description' => 'Crear/reportar actas'],
            ['module' => 'diad', 'action' => 'validate', 'resource' => 'actas', 'name' => 'diad.actas.validate', 'description' => 'Validar actas'],
        ];

        foreach ($permissions as $permission) {
            $permission['created_at'] = $now;
            $permission['updated_at'] = $now;
            DB::table('permissions')->insert($permission);
        }

        $this->command->info('✅ Roles y permisos creados exitosamente');
    }
}
