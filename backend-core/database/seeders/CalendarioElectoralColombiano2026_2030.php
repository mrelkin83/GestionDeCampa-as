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
 * Seeder: CalendarioElectoralColombiano2026_2030
 * 
 * Configura el calendario electoral colombiano siguiendo las reglas:
 * - Periodos de 4 años
 * - Presidenciales: Último domingo de mayo
 * - Legislativas: Primer domingo de marzo
 * - Territoriales: Último domingo de octubre
 * 
 * NOTA: Las elecciones NO son simultáneas, cada una tiene su fecha específica
 */
class CalendarioElectoralColombiano2026_2030 extends Seeder
{
    /**
     * Calcular el último domingo de un mes
     */
    private function ultimoDomingo(int $año, int $mes): Carbon
    {
        // Último día del mes
        $ultimoDia = Carbon::create($año, $mes, 1)->endOfMonth();
        
        // Retroceder hasta el domingo
        while ($ultimoDia->dayOfWeek !== Carbon::SUNDAY) {
            $ultimoDia->subDay();
        }
        
        return $ultimoDia;
    }

    /**
     * Calcular el primer domingo de un mes
     */
    private function primerDomingo(int $año, int $mes): Carbon
    {
        $primerDia = Carbon::create($año, $mes, 1);
        
        // Avanzar hasta el domingo
        while ($primerDia->dayOfWeek !== Carbon::SUNDAY) {
            $primerDia->addDay();
        }
        
        return $primerDia;
    }

    public function run(): void
    {
        $this->command->info('🗳️  Configurando Calendario Electoral Colombiano 2026-2030...');
        $this->command->info('   NOTA: Las elecciones son en fechas separadas según la ley colombiana');
        $this->command->info('');

        // ==========================================
        // 1. ELECCIONES LEGISLATIVAS 2026
        // Fecha: Primer domingo de marzo de 2026 = 8 de marzo 2026
        // Periodo: 20 de julio 2026 - 20 de julio 2030
        // ==========================================
        
        $fechaLegislativas = $this->primerDomingo(2026, 3); // 8 de marzo 2026
        
        $eleccionLegislativa = Election::create([
            'nombre' => 'Elecciones Legislativas 2026',
            'tipo' => 'LEGISLATIVA',
            'fecha' => $fechaLegislativas,
            'fecha_inicio_periodo' => Carbon::create(2026, 7, 20), // 20 de julio
            'fecha_fin_periodo' => Carbon::create(2030, 7, 20),    // 4 años después
            'descripcion' => 'Elecciones para Senado de la República (102 curules) y Cámara de Representantes (165 curules). Periodo 2026-2030.',
            'estado' => 'CERRADA', // Ya pasaron el 8 de marzo 2026
            'configuracion' => json_encode([
                'regla_fecha' => 'Primer domingo de marzo',
                'periodo_legislatura' => '20 de julio al 20 de julio (4 años)',
                'umbral_electoral' => 3,
                'cupo_especial' => [
                    'indigenas' => 1,
                    'comunidades_negras' => 1,
                ],
                'nota_historica' => 'Elecciones realizadas el 8 de marzo 2026',
            ]),
        ]);

        $this->command->info("✅ Elección Legislativa: {$eleccionLegislativa->nombre}");
        $this->command->info("   📅 Fecha: {$fechaLegislativas->format('d/m/Y')}");
        $this->command->info("   🏛️  Periodo: 20 julio 2026 - 20 julio 2030");

        // Cargos Legislativos
        $cargoSenado = ElectionPosition::create([
            'election_id' => $eleccionLegislativa->id,
            'nombre' => 'Senado de la República',
            'descripcion' => '102 curules a nivel nacional. Umbral electoral: 3%',
            'nivel_territorial' => 'NACIONAL',
            'numero_curules' => 102,
            'umbral_votos' => 3.0,
            'configuracion' => json_encode([
                'tipo_votacion' => 'LISTA_CERRADA',
                'circunscripcion' => 'NACIONAL',
                'inicio_periodo' => '20 de julio',
                'fin_periodo' => '20 de julio (4 años)',
            ]),
        ]);

        $cargoCamara = ElectionPosition::create([
            'election_id' => $eleccionLegislativa->id,
            'nombre' => 'Cámara de Representantes',
            'descripcion' => '165 curules (161 territoriales + 4 especiales)',
            'nivel_territorial' => 'TERRITORIAL',
            'numero_curules' => 165,
            'configuracion' => json_encode([
                'tipo_votacion' => 'LISTA_CERRADA',
                'circunscripciones' => [
                    'territoriales' => 161,
                    'indigenas' => 1,
                    'comunidades_afro' => 1,
                    'raizales_rom' => 2,
                ],
                'inicio_periodo' => '20 de julio',
                'fin_periodo' => '20 de julio (4 años)',
            ]),
        ]);

        // ==========================================
        // 2. ELECCIONES PRESIDENCIALES 2026
        // Fecha: Último domingo de mayo de 2026 = 31 de mayo 2026
        // Periodo: 7 de agosto 2026 - 7 de agosto 2030
        // ==========================================
        
        $fechaPresidenciales = $this->ultimoDomingo(2026, 5); // 31 de mayo 2026
        
        $eleccionPresidencial = Election::create([
            'nombre' => 'Elecciones Presidenciales 2026',
            'tipo' => 'PRESIDENCIAL',
            'fecha' => $fechaPresidenciales,
            'fecha_inicio_periodo' => Carbon::create(2026, 8, 7), // 7 de agosto
            'fecha_fin_periodo' => Carbon::create(2030, 8, 7),    // 4 años después
            'descripcion' => 'Elecciones para Presidente y Vicepresidente de la República. Periodo constitucional 2026-2030.',
            'estado' => 'PROGRAMADA', // Próximas: 31 mayo 2026
            'configuracion' => json_encode([
                'regla_fecha' => 'Último domingo de mayo',
                'periodo_presidencial' => '7 de agosto al 7 de agosto (4 años)',
                'segunda_vuelta' => true,
                'mayoria_requerida' => 50.01,
                'formula' => 'Presidente + Vicepresidente',
            ]),
        ]);

        $this->command->info("");
        $this->command->info("✅ Elección Presidencial: {$eleccionPresidencial->nombre}");
        $this->command->info("   📅 Fecha: {$fechaPresidenciales->format('d/m/Y')}");
        $this->command->info("   🏛️  Periodo: 7 agosto 2026 - 7 agosto 2030");

        $cargoPresidente = ElectionPosition::create([
            'election_id' => $eleccionPresidencial->id,
            'nombre' => 'Presidente de la República',
            'descripcion' => 'Jefe de Estado y de Gobierno. Mayoría absoluta requerida.',
            'nivel_territorial' => 'NACIONAL',
            'numero_curules' => 1,
            'umbral_votos' => 50.01,
            'configuracion' => json_encode([
                'tipo_votacion' => 'SIMPLE_PLURALIDAD',
                'segunda_vuelta' => true,
                'formula' => 'Presidente + Vicepresidente',
                'inicio_periodo' => '7 de agosto',
                'fin_periodo' => '7 de agosto (4 años)',
            ]),
        ]);

        // ==========================================
        // 3. ELECCIONES TERRITORIALES 2027
        // Fecha: Último domingo de octubre de 2027 = 31 de octubre 2027
        // Periodo: 1 de enero 2028 - 31 de diciembre 2031
        // ==========================================
        
        $fechaTerritoriales = $this->ultimoDomingo(2027, 10); // 31 de octubre 2027
        
        $eleccionTerritorial = Election::create([
            'nombre' => 'Elecciones Territoriales 2027',
            'tipo' => 'TERRITORIAL',
            'fecha' => $fechaTerritoriales,
            'fecha_inicio_periodo' => Carbon::create(2028, 1, 1),  // 1 de enero
            'fecha_fin_periodo' => Carbon::create(2031, 12, 31),   // 4 años después
            'descripcion' => 'Gobernadores (32), Alcaldes (1,102), Asambleas y Concejos. Periodo 2028-2031.',
            'estado' => 'PROGRAMADA', // 31 octubre 2027
            'configuracion' => json_encode([
                'regla_fecha' => 'Último domingo de octubre',
                'periodo_territorial' => '1 de enero al 31 de diciembre (4 años)',
                'segunda_vuelta' => true,
                'mayoria_requerida' => 50.01,
                'cargos' => [
                    'gobernadores' => 32,
                    'asambleas' => 32,
                    'alcaldes' => 1102,
                    'concejos' => 1102,
                ],
            ]),
        ]);

        $this->command->info("");
        $this->command->info("✅ Elección Territorial: {$eleccionTerritorial->nombre}");
        $this->command->info("   📅 Fecha: {$fechaTerritoriales->format('d/m/Y')}");
        $this->command->info("   🏛️  Periodo: 1 enero 2028 - 31 diciembre 2031");

        // Cargos Territoriales
        $cargosTerritoriales = [
            [
                'nombre' => 'Gobernador',
                'nivel' => 'DEPARTAMENTAL',
                'curules' => 1,
                'segunda_vuelta' => true,
                'formula' => 'Gobernador + Vicegobernador',
            ],
            [
                'nombre' => 'Asamblea Departamental',
                'nivel' => 'DEPARTAMENTAL',
                'curules' => null, // Variable
                'segunda_vuelta' => false,
                'voto_preferente' => false,
            ],
            [
                'nombre' => 'Alcalde Municipal',
                'nivel' => 'MUNICIPAL',
                'curules' => 1,
                'segunda_vuelta' => true,
                'formula' => 'Alcalde + Vicealcalde',
            ],
            [
                'nombre' => 'Concejo Municipal',
                'nivel' => 'MUNICIPAL',
                'curules' => null, // Variable
                'segunda_vuelta' => false,
                'voto_preferente' => true,
            ],
        ];

        foreach ($cargosTerritoriales as $cargoData) {
            ElectionPosition::create([
                'election_id' => $eleccionTerritorial->id,
                'nombre' => $cargoData['nombre'],
                'nivel_territorial' => $cargoData['nivel'],
                'numero_curules' => $cargoData['curules'],
                'configuracion' => json_encode([
                    'segunda_vuelta' => $cargoData['segunda_vuelta'] ?? false,
                    'voto_preferente' => $cargoData['voto_preferente'] ?? false,
                    'formula' => $cargoData['formula'] ?? null,
                    'inicio_periodo' => '1 de enero',
                    'fin_periodo' => '31 de diciembre (4 años)',
                ]),
            ]);
        }

        // ==========================================
        // RESUMEN DEL CALENDARIO
        // ==========================================
        
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('           CALENDARIO ELECTORAL COLOMBIANO 2026-2030');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('📅 LEGISLATIVAS 2026:');
        $this->command->info("   Fecha: {$fechaLegislativas->format('l, d \d\e F \d\e Y')}");
        $this->command->info('   Cargos: Senado (102) + Cámara (165)');
        $this->command->info('   Periodo: 20 julio 2026 - 20 julio 2030');
        $this->command->info('   Estado: ✅ REALIZADAS (8 marzo 2026)');
        $this->command->info('');
        $this->command->info('📅 PRESIDENCIALES 2026:');
        $this->command->info("   Fecha: {$fechaPresidenciales->format('l, d \d\e F \d\e Y')}");
        $this->command->info('   Cargo: Presidente + Vicepresidente');
        $this->command->info('   Periodo: 7 agosto 2026 - 7 agosto 2030');
        $this->command->info('   Estado: ⏳ PRÓXIMAS (31 mayo 2026)');
        $this->command->info('');
        $this->command->info('📅 TERRITORIALES 2027:');
        $this->command->info("   Fecha: {$fechaTerritoriales->format('l, d \d\e F \d\e Y')}");
        $this->command->info('   Cargos: Gobernadores + Alcaldes + Asambleas + Concejos');
        $this->command->info('   Periodo: 1 enero 2028 - 31 diciembre 2031');
        $this->command->info('   Estado: 📋 PROGRAMADAS (31 octubre 2027)');
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('  REGLAS DEL SISTEMA ELECTORAL COLOMBIANO:');
        $this->command->info('═══════════════════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('✓ Periodos de 4 años exactos');
        $this->command->info('✓ Las tres elecciones son en FECHAS DIFERENTES');
        $this->command->info('✓ NO se mezclan elecciones');
        $this->command->info('✓ Legislativas: 1er domingo de marzo');
        $this->command->info('✓ Presidenciales: Último domingo de mayo');
        $this->command->info('✓ Territoriales: Último domingo de octubre');
        $this->command->info('');
        $this->command->info('✅ Sistema configurado correctamente para el calendario colombiano');
        $this->command->info('═══════════════════════════════════════════════════════════════');
    }
}
