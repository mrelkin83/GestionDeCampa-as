<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EleccionesYCargosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Crea elecciones y cargos electorales para testing
     */
    public function run(): void
    {
        $this->command->info('Creando elecciones y cargos electorales...');

        // Crear elección territorial 2027
        $eleccionId = DB::table('elections')->insertGetId([
            'year' => 2027,
            'tipo' => 'territorial',
            'fecha' => '2027-10-24',
            'nombre' => 'Elecciones Territoriales 2027',
            'activa' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $this->command->info("Elección creada: ID {$eleccionId}");

        // Crear cargos electorales
        $cargos = [
            [
                'election_id' => $eleccionId,
                'tipo' => 'gobernacion',
                'nombre' => 'Gobernación',
                'nivel' => 'departamental',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'election_id' => $eleccionId,
                'tipo' => 'alcaldia',
                'nombre' => 'Alcaldía',
                'nivel' => 'municipal',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'election_id' => $eleccionId,
                'tipo' => 'asamblea',
                'nombre' => 'Asamblea Departamental',
                'nivel' => 'departamental',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'election_id' => $eleccionId,
                'tipo' => 'concejo',
                'nombre' => 'Concejo Municipal',
                'nivel' => 'municipal',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'election_id' => $eleccionId,
                'tipo' => 'jal',
                'nombre' => 'Junta Administradora Local (JAL)',
                'nivel' => 'local',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        DB::table('election_positions')->insert($cargos);

        $this->command->info('Cargos creados: ' . count($cargos));
        foreach ($cargos as $cargo) {
            $this->command->info("  - {$cargo['nombre']}");
        }

        // Crear candidatos de prueba para Alcaldía
        $cargoAlcaldia = DB::table('election_positions')
            ->where('election_id', $eleccionId)
            ->where('tipo', 'alcaldia')
            ->first();

        if ($cargoAlcaldia) {
            $candidatos = [
                [
                    'election_position_id' => $cargoAlcaldia->id,
                    'nombre' => 'Carlos Rodríguez',
                    'partido_politico' => 'Partido A',
                    'numero_tarjeton' => 1,
                    'foto_url' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'election_position_id' => $cargoAlcaldia->id,
                    'nombre' => 'María González',
                    'partido_politico' => 'Partido B',
                    'numero_tarjeton' => 2,
                    'foto_url' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'election_position_id' => $cargoAlcaldia->id,
                    'nombre' => 'Juan Pérez',
                    'partido_politico' => 'Partido C',
                    'numero_tarjeton' => 3,
                    'foto_url' => null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ];

            DB::table('candidates')->insert($candidatos);
            $this->command->info('Candidatos de prueba creados para Alcaldía: ' . count($candidatos));
        }

        $this->command->info('✅ Elecciones y cargos creados exitosamente!');
    }
}
