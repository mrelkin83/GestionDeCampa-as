<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PrecountRecord;
use App\Models\PrecountVote;
use App\Models\PrecountEvidence;
use App\Models\PrecountMetadata;
use App\Models\PrecountValidation;
use App\Models\PrecountAggregate;
use App\Models\MesaCargoStatus;
use App\Models\Mesa;
use App\Models\User;

class PrecountTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Crea datos de prueba para el sistema de preconteo
     */
    public function run(): void
    {
        $this->command->info('Creando datos de prueba para preconteo...');

        // Obtener mesas existentes (si hay)
        $mesas = Mesa::limit(10)->get();
        
        if ($mesas->isEmpty()) {
            $this->command->warn('No hay mesas en la BD. Creando registros con mesa_id = 1');
            $mesas = collect([(object)['id' => 1, 'puesto_id' => 1]]);
        }

        // Obtener usuario de prueba
        $usuario = User::first();
        if (!$usuario) {
            $this->command->warn('No hay usuarios. Usando ID = 1');
            $usuario = (object)['id' => 1];
        }

        // Cargo de prueba (Alcaldía). Se busca dinamicamente en vez de
        // asumir id=1: en una BD recien migrada los ids de referencia
        // (elections/election_positions) no arrancan necesariamente en 1,
        // lo que hacia fallar el seeder con una violacion de FK.
        // EleccionesYCargosSeeder crea varios cargos pero solo asigna
        // candidatos de prueba a uno de tipo "Alcaldía" -y si se ejecuto mas
        // de una vez (no es idempotente), puede haber varios cargos con ese
        // nombre sin candidatos. Se busca explicitamente uno que sí tenga
        // candidatos en vez de asumir el primero.
        $cargoId = \App\Models\Candidato::select('election_position_id')
            ->groupBy('election_position_id')
            ->havingRaw('COUNT(*) >= 3')
            ->value('election_position_id');

        if (!$cargoId) {
            $this->command->error('No hay ningún cargo con al menos 3 candidatos. Ejecute EleccionesYCargosSeeder primero.');
            return;
        }

        // Igual que cargoId: no se puede asumir candidate_id 1/2/3, hay que
        // usar los candidatos reales creados para este cargo.
        $candidateIds = \App\Models\Candidato::where('election_position_id', $cargoId)
            ->orderBy('numero_tarjeton')
            ->pluck('id')
            ->values();
        if ($candidateIds->count() < 3) {
            $this->command->error('El cargo de prueba necesita al menos 3 candidatos. Ejecute EleccionesYCargosSeeder primero.');
            return;
        }

        // Crear 10 actas de prueba
        foreach ($mesas as $index => $mesa) {
            $this->crearActaCompleta(
                mesaId: $mesa->id,
                cargoId: $cargoId,
                candidateIds: $candidateIds,
                usuarioId: $usuario->id,
                version: 1,
                estado: $index < 7 ? 'VALIDADA' : ($index < 9 ? 'OBSERVADA' : 'CARGADA')
            );
        }

        // Crear una acta con versión 2 (corrección)
        $this->crearActaCompleta(
            mesaId: $mesas->first()->id,
            cargoId: $cargoId,
            candidateIds: $candidateIds,
            usuarioId: $usuario->id,
            version: 2,
            estado: 'VALIDADA'
        );

        $this->command->info('✅ Datos de prueba creados exitosamente!');
        $this->command->info('   - 10 actas creadas');
        $this->command->info('   - 1 acta con versión 2 (corrección)');
        $this->command->info('   - Estados: VALIDADA, OBSERVADA, CARGADA');
    }

    /**
     * Crear un acta completa con todos sus datos
     */
    private function crearActaCompleta(int $mesaId, int $cargoId, \Illuminate\Support\Collection $candidateIds, int $usuarioId, int $version, string $estado): void
    {
        $sufragantes = rand(200, 350);
        $votosNulos = rand(0, 5);
        $votosBlancos = rand(0, 10);
        
        // Calcular votos para candidatos
        $votosDisponibles = $sufragantes - $votosNulos - $votosBlancos;
        $votosCandidato1 = (int)($votosDisponibles * 0.45);
        $votosCandidato2 = (int)($votosDisponibles * 0.35);
        $votosCandidato3 = $votosDisponibles - $votosCandidato1 - $votosCandidato2;

        // Crear record
        $record = PrecountRecord::create([
            'polling_table_id' => $mesaId,
            'election_position_id' => $cargoId,
            'version' => $version,
            'total_sufragantes' => $sufragantes,
            'votos_nulos' => $votosNulos,
            'votos_no_marcados' => $votosBlancos,
            'observaciones' => $estado === 'OBSERVADA' ? 'Revisar suma de votos' : 'Sin novedades',
            'estado' => $estado
        ]);

        // Crear votos por candidato
        PrecountVote::create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidateIds[0],
            'votos' => $votosCandidato1
        ]);

        PrecountVote::create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidateIds[1],
            'votos' => $votosCandidato2
        ]);

        PrecountVote::create([
            'precount_record_id' => $record->id,
            'candidate_id' => $candidateIds[2],
            'votos' => $votosCandidato3
        ]);

        // Crear evidencia
        PrecountEvidence::create([
            'precount_record_id' => $record->id,
            'imagen_url' => 'https://bucket.contabo.com/actas/' . $record->id . '.jpg',
            'hash_imagen' => hash('sha256', 'imagen_' . $record->id),
            'ocr_text' => null,
            'legible' => true
        ]);

        // Crear metadata
        PrecountMetadata::create([
            'precount_record_id' => $record->id,
            'reportado_por_usuario_id' => $usuarioId,
            'rol' => 'testigo',
            'gps_lat' => 4.60971 + (rand(-100, 100) / 10000),
            'gps_lng' => -74.08175 + (rand(-100, 100) / 10000),
            'dispositivo' => 'Mozilla/5.0 (Linux; Android 10; SM-A505G)',
            'offline' => rand(0, 1) === 1,
            'sincronizado_at' => rand(0, 1) === 1 ? now() : null
        ]);

        // Crear validaciones si es observada
        if ($estado === 'OBSERVADA') {
            PrecountValidation::create([
                'precount_record_id' => $record->id,
                'tipo' => 'SUMA_INVALIDA',
                'severidad' => 'WARNING',
                'mensaje' => 'La suma de votos no coincide con el total de sufragantes',
                'resuelta' => false
            ]);
        }

        // Actualizar o crear mesa_cargo_status
        MesaCargoStatus::updateOrCreate(
            [
                'mesa_id' => $mesaId,
                'cargo_id' => $cargoId
            ],
            [
                'estado' => $estado,
                'precount_record_id' => $record->id,
                'reportada_at' => now(),
                'validada_at' => $estado === 'VALIDADA' ? now() : null
            ]
        );
    }
}
