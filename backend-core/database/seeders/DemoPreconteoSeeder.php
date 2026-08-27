<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\PuestoVotacion;
use App\Models\Mesa;
use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\PrecountMetadata;
use App\Models\PrecountValidation;
use App\Models\MesaCargoStatus;
use App\Models\User;

class DemoPreconteoSeeder extends Seeder
{
    /**
     * ⚠️ ROTO: falla insertando en `candidates` con la columna 'partido'
     * (la columna real es 'partido_politico', ver
     * PrecountController::getCandidatosByCargo). No se ejecuta
     * automáticamente (no está en DatabaseSeeder); no se investigó si hay
     * más discrepancias de esquema más allá de este primer punto de fallo.
     *
     * Run the database seeds.
     *
     * Crea un escenario completo de demo para preconteo:
     * - 1 Departamento (Antioquia)
     * - 2 Municipios (Medellín, Envigado)
     * - 3 Puestos de votación
     * - 10 Mesas
     * - 5 Actas validadas, 3 observadas, 2 pendientes
     */
    public function run(): void
    {
        $this->command->info('🗳️ Creando DEMO de preconteo electoral...');
        $this->command->info('');

        // Obtener o crear usuario demo
        $user = User::first();
        if (!$user) {
            $this->command->error('No hay usuarios. Ejecuta AdminUserSeeder primero.');
            return;
        }

        // Crear/verificar elección y cargo
        $eleccionId = DB::table('elections')->insertGetId([
            'year' => 2027,
            'tipo' => 'territorial',
            'fecha' => '2027-10-24',
            'nombre' => 'Elecciones Territoriales 2027 - DEMO',
            'activa' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $cargoId = DB::table('election_positions')->insertGetId([
            'election_id' => $eleccionId,
            'tipo' => 'alcaldia',
            'nombre' => 'Alcaldía Municipal',
            'nivel' => 'municipal',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Crear candidatos
        $candidatos = [
            ['id' => 1, 'nombre' => 'Carlos Rodríguez', 'partido' => 'Partido A', 'numero' => 1],
            ['id' => 2, 'nombre' => 'María González', 'partido' => 'Partido B', 'numero' => 2],
            ['id' => 3, 'nombre' => 'Juan Pérez', 'partido' => 'Partido C', 'numero' => 3],
        ];

        foreach ($candidatos as $candidato) {
            DB::table('candidates')->insert([
                'id' => $candidato['id'],
                'election_position_id' => $cargoId,
                'nombre' => $candidato['nombre'],
                'partido' => $candidato['partido'],
                'numero' => $candidato['numero'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        $this->command->info("✅ Elección y cargo creados (ID: {$eleccionId})");
        $this->command->info("✅ 3 candidatos creados");
        $this->command->info('');

        // Crear estructura territorial
        $depto = Departamento::firstOrCreate(
            ['codigo' => '05'],
            ['nombre' => 'Antioquia', 'capital' => 'Medellín']
        );

        $municipios = [
            Municipio::firstOrCreate(
                ['codigo' => '05001'],
                ['nombre' => 'Medellín', 'departamento_id' => $depto->id]
            ),
            Municipio::firstOrCreate(
                ['codigo' => '05266'],
                ['nombre' => 'Envigado', 'departamento_id' => $depto->id]
            ),
        ];

        $puestos = [];
        foreach ($municipios as $muni) {
            $puesto = PuestoVotacion::firstOrCreate(
                ['codigo' => 'PUESTO_' . $muni->codigo],
                [
                    'nombre' => 'Colegio ' . $muni->nombre,
                    'direccion' => 'Calle Principal ' . $muni->nombre,
                    'municipio_id' => $muni->id,
                    'capacidad_mesas' => 5
                ]
            );
            $puestos[] = $puesto;
        }

        // Crear mesas
        $mesas = [];
        foreach ($puestos as $puesto) {
            for ($i = 1; $i <= 5; $i++) {
                $mesas[] = Mesa::firstOrCreate(
                    ['numero' => 'M' . $puesto->id . '-' . $i, 'puesto_id' => $puesto->id],
                    ['tipo_mesa' => 'ordinaria', 'potencial_votantes' => 300]
                );
            }
        }

        $this->command->info("✅ 2 municipios creados");
        $this->command->info("✅ 2 puestos de votación creados");
        $this->command->info("✅ " . count($mesas) . " mesas creadas");
        $this->command->info('');

        // Crear actas de ejemplo
        $estados = ['VALIDADA', 'VALIDADA', 'VALIDADA', 'VALIDADA', 'VALIDADA', 'OBSERVADA', 'OBSERVADA', 'OBSERVADA', 'CARGADA', 'CARGADA'];

        foreach ($mesas as $index => $mesa) {
            $estado = $estados[$index] ?? 'PENDIENTE';
            
            $this->crearActaDemo(
                mesa: $mesa,
                cargoId: $cargoId,
                usuarioId: $user->id,
                estado: $estado,
                candidatos: $candidatos
            );
        }

        $this->command->info('');
        $this->command->info('📊 RESUMEN DEMO:');
        $this->command->info('  ✅ 5 actas VALIDADAS');
        $this->command->info('  ⚠️  3 actas OBSERVADAS');
        $this->command->info('  📝 2 actas CARGADAS');
        $this->command->info('');
        $this->command->info('🎉 DEMO creado exitosamente!');
        $this->command->info('');
        $this->command->info('Endpoints para probar:');
        $this->command->info("  GET /api/preconteo/elecciones");
        $this->command->info("  GET /api/preconteo/elecciones/{$eleccionId}/cargos");
        $this->command->info("  GET /api/preconteo/progreso?election_position_id={$cargoId}");
        $this->command->info("  GET /api/preconteo/resultados?election_position_id={$cargoId}&scope_type=DEPARTAMENTO&scope_id={$depto->id}");
    }

    /**
     * Crear un acta demo
     */
    private function crearActaDemo($mesa, int $cargoId, int $usuarioId, string $estado, array $candidatos): void
    {
        $sufragantes = rand(200, 300);
        $nulos = rand(0, 5);
        $blancos = rand(0, 10);
        $disponibles = $sufragantes - $nulos - $blancos;

        // Distribuir votos entre candidatos
        $votosC1 = (int)($disponibles * 0.45);
        $votosC2 = (int)($disponibles * 0.35);
        $votosC3 = $disponibles - $votosC1 - $votosC2;

        $votos = [
            ['candidate_id' => 1, 'votos' => $votosC1],
            ['candidate_id' => 2, 'votos' => $votosC2],
            ['candidate_id' => 3, 'votos' => $votosC3],
        ];

        // Si es observada, crear suma inválida
        if ($estado === 'OBSERVADA') {
            $votos[0]['votos'] += 20; // Suma inválida
        }

        $record = PrecountRecord::create([
            'polling_table_id' => $mesa->id,
            'election_position_id' => $cargoId,
            'version' => 1,
            'total_sufragantes' => $sufragantes,
            'votos_nulos' => $nulos,
            'votos_no_marcados' => $blancos,
            'observaciones' => $estado === 'OBSERVADA' ? 'Revisar suma de votos' : 'Sin novedades',
            'estado' => $estado
        ]);

        foreach ($votos as $voto) {
            PrecountVote::create([
                'precount_record_id' => $record->id,
                'candidate_id' => $voto['candidate_id'],
                'votos' => $voto['votos']
            ]);
        }

        PrecountMetadata::create([
            'precount_record_id' => $record->id,
            'reportado_por_usuario_id' => $usuarioId,
            'rol' => 'testigo',
            'gps_lat' => 6.2442 + (rand(-1000, 1000) / 100000),
            'gps_lng' => -75.5812 + (rand(-1000, 1000) / 100000),
            'dispositivo' => 'Mozilla/5.0 (Linux; Android 10)',
            'offline' => rand(0, 1) === 1,
            'sincronizado_at' => rand(0, 1) === 1 ? now() : null
        ]);

        // Crear validación si es observada
        if ($estado === 'OBSERVADA') {
            PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'SUMA_INVALIDA',
                'severidad' => 'WARNING',
                'mensaje' => 'La suma de votos no coincide con el total de sufragantes',
                'resuelta' => false
            ]);
        }

        // Actualizar mesa_cargo_status
        MesaCargoStatus::updateOrCreate(
            ['mesa_id' => $mesa->id, 'cargo_id' => $cargoId],
            [
                'estado' => $estado,
                'precount_record_id' => $record->id,
                'reportada_at' => now(),
                'validada_at' => $estado === 'VALIDADA' ? now() : null
            ]
        );

        $icono = $estado === 'VALIDADA' ? '✅' : ($estado === 'OBSERVADA' ? '⚠️' : '📝');
        $this->command->info("  {$icono} Acta {$record->id} - Mesa {$mesa->numero} - {$estado}");
    }
}
