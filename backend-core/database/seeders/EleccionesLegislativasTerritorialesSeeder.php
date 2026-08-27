<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Election;
use App\Models\ElectionPosition;
use App\Models\Candidate;
use App\Models\Departamento;
use App\Models\Municipio;
use Carbon\Carbon;

/**
 * ⚠️ ROTO: falla en la primera inserción (Election::create incluye
 * 'descripcion'/'estado'/'configuracion', columnas que no existen en
 * `elections` -esa tabla real solo tiene id/year/tipo/fecha/nombre/activa,
 * ver migración 2024_05_08_000000_create_elections_reference_tables).
 * El mismo problema se repite para ElectionPosition ('descripcion',
 * 'numero_curules', 'configuracion' tampoco existen en `election_positions`)
 * y probablemente para Candidate. Este seeder fue escrito contra un
 * esquema mucho más rico que el que finalmente se migró, y no se ejecuta
 * automáticamente (no está en DatabaseSeeder). Reescribirlo bien implica
 * decidir cómo simplificar esos datos (curules, configuración de segunda
 * vuelta, etc.) al esquema real actual, o migrar el esquema para
 * soportarlos -una decisión de producto, no un fix mecánico- así que se
 * deja documentado en vez de tocado.
 *
 * Seeder: EleccionesLegislativasTerritorialesSeeder
 * 
 * Configura el sistema para elecciones legislativas y territoriales
 * Ejemplo: Elecciones de octubre 2027 en Colombia
 */
class EleccionesLegislativasTerritorialesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🗳️  Creando elecciones legislativas y territoriales...');

        // ==========================================
        // 1. ELECCIONES LEGISLATIVAS
        // ==========================================
        
        $eleccionLegislativa = Election::create([
            'nombre' => 'Elecciones Legislativas 2027',
            'tipo' => 'LEGISLATIVA',
            'fecha' => Carbon::create(2027, 3, 14), // Marzo, un mes antes de territoriales
            'descripcion' => 'Elecciones para Senado de la República y Cámara de Representantes',
            'estado' => 'ACTIVA',
            'configuracion' => json_encode([
                'umbral_electoral' => 3, // 3% para Senado
                'cupo_especial' => 2,    // 2 curules especiales
                'circunscripciones' => [
                    'indigenas' => 1,
                    'negritudes' => 1,
                    'rom' => 0,
                ]
            ]),
        ]);

        $this->command->info("✅ Elección Legislativa creada: {$eleccionLegislativa->nombre}");

        // Cargos Legislativos
        $cargoSenado = ElectionPosition::create([
            'election_id' => $eleccionLegislativa->id,
            'nombre' => 'Senado de la República',
            'descripcion' => '102 curules nacionales',
            'nivel_territorial' => 'NACIONAL',
            'numero_curules' => 102,
            'umbral_votos' => 3.0, // 3%
            'configuracion' => json_encode([
                'tipo_votacion' => 'LISTA_CERRADA',
                'circunscripcion' => 'NACIONAL',
                'cupo_especial' => true,
            ]),
        ]);

        $cargoCamara = ElectionPosition::create([
            'election_id' => $eleccionLegislativa->id,
            'nombre' => 'Cámara de Representantes',
            'descripcion' => '165 curules por circunscripciones territoriales',
            'nivel_territorial' => 'TERRITORIAL',
            'numero_curules' => 165,
            'umbral_votos' => null,
            'configuracion' => json_encode([
                'tipo_votacion' => 'LISTA_CERRADA',
                'circunscripciones' => [
                    'territoriales' => 161, // Por departamentos
                    'especiales' => 4,      // Indígenas, negritudes, etc.
                ],
            ]),
        ]);

        $this->command->info('✅ Cargos legislativos creados');

        // Candidatos ejemplo - Senado (primeros 10 para demo)
        $partidosSenado = [
            ['nombre' => 'Partido Centro Democrático', 'lista' => 'C'],
            ['nombre' => 'Partido Liberal', 'lista' => 'L'],
            ['nombre' => 'Partido Conservador', 'lista' => 'O'],
            ['nombre' => 'Partido de la U', 'lista' => 'U'],
            ['nombre' => 'Pacto Histórico', 'lista' => 'P'],
        ];

        foreach ($partidosSenado as $index => $partido) {
            for ($i = 1; $i <= 5; $i++) {
                Candidate::create([
                    'election_position_id' => $cargoSenado->id,
                    'numero' => ($index * 10) + $i,
                    'nombre' => "Candidato {$partido['lista']}-{$i}",
                    'partido_politico' => $partido['nombre'],
                    'lista' => $partido['lista'],
                    'foto_url' => null,
                    'estado' => 'ACTIVO',
                    'metadata' => json_encode([
                        'numero_cedula' => fake()->numerify('##########'),
                        'ciudad_origen' => fake()->city(),
                    ]),
                ]);
            }
        }

        // Candidatos Cámara - Ejemplo por departamentos
        $departamentos = Departamento::take(5)->get(); // Primeros 5 deptos para demo
        
        foreach ($departamentos as $depto) {
            for ($i = 1; $i <= 3; $i++) {
                Candidate::create([
                    'election_position_id' => $cargoCamara->id,
                    'numero' => ($depto->id * 10) + $i,
                    'nombre' => "Rep. {$depto->nombre} - {$i}",
                    'partido_politico' => $partidosSenado[array_rand($partidosSenado)]['nombre'],
                    'departamento_id' => $depto->id,
                    'lista' => chr(64 + $i), // A, B, C
                    'estado' => 'ACTIVO',
                ]);
            }
        }

        $this->command->info('✅ Candidatos legislativos creados');

        // ==========================================
        // 2. ELECCIONES TERRITORIALES
        // ==========================================
        
        $eleccionTerritorial = Election::create([
            'nombre' => 'Elecciones Territoriales 2027',
            'tipo' => 'TERRITORIAL',
            'fecha' => Carbon::create(2027, 10, 27), // Octubre
            'descripcion' => 'Elecciones para Gobernadores, Alcaldes, Asambleas y Concejos',
            'estado' => 'PROGRAMADA',
            'configuracion' => json_encode([
                'segunda_vuelta' => true,
                'umbral_segunda_vuelta' => 50.01,
                'cargos' => [
                    'gobernadores' => 32,    // 32 departamentos
                    'asambleas' => 32,       // Una por departamento
                    'alcaldes' => 1102,      // Municipios
                    'concejos' => 1102,      // Uno por municipio
                ],
            ]),
        ]);

        $this->command->info("✅ Elección Territorial creada: {$eleccionTerritorial->nombre}");

        // Cargos Territoriales
        $cargoGobernador = ElectionPosition::create([
            'election_id' => $eleccionTerritorial->id,
            'nombre' => 'Gobernador',
            'descripcion' => 'Gobernador de Departamento',
            'nivel_territorial' => 'DEPARTAMENTAL',
            'numero_curules' => 1,
            'umbral_votos' => 50.01, // Mayoría absoluta, sino 2da vuelta
            'configuracion' => json_encode([
                'tipo_votacion' => 'SIMPLE_PLURALIDAD',
                'segunda_vuelta' => true,
                'formula' => 'GOBERNADOR_Y_VICE',
            ]),
        ]);

        $cargoAsamblea = ElectionPosition::create([
            'election_id' => $eleccionTerritorial->id,
            'nombre' => 'Asamblea Departamental',
            'descripcion' => 'Asamblea del departamento',
            'nivel_territorial' => 'DEPARTAMENTAL',
            'numero_curules' => null, // Variable por departamento
            'umbral_votos' => null,
            'configuracion' => json_encode([
                'tipo_votacion' => 'LISTA_CERRADA',
                'curules_variable' => true, // Dependiendo del censo
            ]),
        ]);

        $cargoAlcalde = ElectionPosition::create([
            'election_id' => $eleccionTerritorial->id,
            'nombre' => 'Alcalde Municipal',
            'descripcion' => 'Alcalde de municipio',
            'nivel_territorial' => 'MUNICIPAL',
            'numero_curules' => 1,
            'umbral_votos' => 50.01,
            'configuracion' => json_encode([
                'tipo_votacion' => 'SIMPLE_PLURALIDAD',
                'segunda_vuelta' => true,
                'formula' => 'ALCALDE_Y_VICE',
            ]),
        ]);

        $cargoConcejo = ElectionPosition::create([
            'election_id' => $eleccionTerritorial->id,
            'nombre' => 'Concejo Municipal',
            'descripcion' => 'Concejo del municipio',
            'nivel_territorial' => 'MUNICIPAL',
            'numero_curules' => null, // Variable por municipio
            'umbral_votos' => null,
            'configuracion' => json_encode([
                'tipo_votacion' => 'LISTA_ABIERTA', // Voto preferente opcional
                'voto_preferente' => true,
            ]),
        ]);

        $this->command->info('✅ Cargos territoriales creados');

        // Candidatos Territoriales - Ejemplo
        
        // Gobernadores (ejemplo primeros 3 departamentos)
        $deptosGobernador = Departamento::take(3)->get();
        foreach ($deptosGobernador as $depto) {
            for ($i = 1; $i <= 4; $i++) {
                Candidate::create([
                    'election_position_id' => $cargoGobernador->id,
                    'numero' => ($depto->id * 10) + $i,
                    'nombre' => "Candidato Gobernador {$depto->nombre} {$i}",
                    'partido_politico' => $partidosSenado[($i-1) % count($partidosSenado)]['nombre'],
                    'departamento_id' => $depto->id,
                    'estado' => 'ACTIVO',
                    'metadata' => json_encode([
                        'vicegobernador' => "Vice {$depto->nombre} {$i}",
                    ]),
                ]);
            }
        }

        // Alcaldes (ejemplo primeros 5 municipios)
        $municipios = Municipio::take(5)->get();
        foreach ($municipios as $mun) {
            for ($i = 1; $i <= 3; $i++) {
                Candidate::create([
                    'election_position_id' => $cargoAlcalde->id,
                    'numero' => ($mun->id * 10) + $i,
                    'nombre' => "Candidato Alcalde {$mun->nombre} {$i}",
                    'partido_politico' => $partidosSenado[($i-1) % count($partidosSenado)]['nombre'],
                    'municipio_id' => $mun->id,
                    'departamento_id' => $mun->departamento_id,
                    'estado' => 'ACTIVO',
                ]);
            }
        }

        $this->command->info('✅ Candidatos territoriales creados');

        // ==========================================
        // 3. CONFIGURAR MESAS PARA AMBAS ELECCIONES
        // ==========================================
        
        $this->command->info('📍 Configurando mesas...');

        // Asignar cargos a mesas existentes
        $mesas = \App\Models\Mesa::take(50)->get();
        
        foreach ($mesas as $mesa) {
            // Legislativas - Todas las mesas votan por Senado
            \App\Models\MesaCargoStatus::create([
                'mesa_id' => $mesa->id,
                'cargo_id' => $cargoSenado->id,
                'estado' => 'PENDIENTE',
            ]);

            // Cámara - Según circunscripción territorial
            // Todas las mesas votan por Cámara
            \App\Models\MesaCargoStatus::create([
                'mesa_id' => $mesa->id,
                'cargo_id' => $cargoCamara->id,
                'estado' => 'PENDIENTE',
            ]);

            // Territoriales - Gobernador (si aplica al departamento)
            \App\Models\MesaCargoStatus::create([
                'mesa_id' => $mesa->id,
                'cargo_id' => $cargoGobernador->id,
                'estado' => 'PENDIENTE',
            ]);

            // Asamblea
            \App\Models\MesaCargoStatus::create([
                'mesa_id' => $mesa->id,
                'cargo_id' => $cargoAsamblea->id,
                'estado' => 'PENDIENTE',
            ]);

            // Alcalde y Concejo (según municipio del puesto)
            $puesto = $mesa->puesto;
            if ($puesto) {
                \App\Models\MesaCargoStatus::create([
                    'mesa_id' => $mesa->id,
                    'cargo_id' => $cargoAlcalde->id,
                    'estado' => 'PENDIENTE',
                ]);

                \App\Models\MesaCargoStatus::create([
                    'mesa_id' => $mesa->id,
                    'cargo_id' => $cargoConcejo->id,
                    'estado' => 'PENDIENTE',
                ]);
            }
        }

        $this->command->info('✅ Mesas configuradas para ambas elecciones');

        // ==========================================
        // RESUMEN
        // ==========================================
        
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('  CONFIGURACIÓN COMPLETADA');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info("📅 Elección Legislativa: {$eleccionLegislativa->nombre}");
        $this->command->info("   - Senado: 102 curules");
        $this->command->info("   - Cámara: 165 curules");
        $this->command->info("   - Candidatos: " . Candidate::whereIn('election_position_id', [$cargoSenado->id, $cargoCamara->id])->count());
        $this->command->info('');
        $this->command->info("📅 Elección Territorial: {$eleccionTerritorial->nombre}");
        $this->command->info("   - Gobernadores: 32 departamentos");
        $this->command->info("   - Alcaldes: 1,102 municipios");
        $this->command->info("   - Asambleas y Concejos");
        $this->command->info("   - Candidatos: " . Candidate::whereIn('election_position_id', [$cargoGobernador->id, $cargoAlcalde->id])->count());
        $this->command->info('');
        $this->command->info('✅ Sistema listo para elecciones legislativas y territoriales');
        $this->command->info('═══════════════════════════════════════════════════');
    }
}
