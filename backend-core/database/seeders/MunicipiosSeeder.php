<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MunicipiosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Municipios principales de Colombia (capitales + importantes)
     * Para producción se importarían los 1102 municipios desde CSV
     */
    public function run(): void
    {
        $now = Carbon::now();

        // Obtener IDs de departamentos
        $departamentos = DB::table('departamentos')->pluck('id', 'codigo');

        $municipios = [
            // Antioquia (05)
            ['codigo' => '05001', 'codigo_departamento' => '05', 'codigo_municipio' => '001', 'nombre' => 'Medellín', 'tipo' => 'distrito', 'poblacion' => 2508452, 'departamento_id' => $departamentos['05']],
            ['codigo' => '05088', 'codigo_departamento' => '05', 'codigo_municipio' => '088', 'nombre' => 'Bello', 'tipo' => 'municipio', 'poblacion' => 506513, 'departamento_id' => $departamentos['05']],
            ['codigo' => '05360', 'codigo_departamento' => '05', 'codigo_municipio' => '360', 'nombre' => 'Itagüí', 'tipo' => 'municipio', 'poblacion' => 281853, 'departamento_id' => $departamentos['05']],
            ['codigo' => '05266', 'codigo_departamento' => '05', 'codigo_municipio' => '266', 'nombre' => 'Envigado', 'tipo' => 'municipio', 'poblacion' => 246789, 'departamento_id' => $departamentos['05']],

            // Atlántico (08)
            ['codigo' => '08001', 'codigo_departamento' => '08', 'codigo_municipio' => '001', 'nombre' => 'Barranquilla', 'tipo' => 'distrito', 'poblacion' => 1232766, 'departamento_id' => $departamentos['08']],
            ['codigo' => '08758', 'codigo_departamento' => '08', 'codigo_municipio' => '758', 'nombre' => 'Soledad', 'tipo' => 'municipio', 'poblacion' => 655734, 'departamento_id' => $departamentos['08']],
            ['codigo' => '08520', 'codigo_departamento' => '08', 'codigo_municipio' => '520', 'nombre' => 'Malambo', 'tipo' => 'municipio', 'poblacion' => 131610, 'departamento_id' => $departamentos['08']],

            // Bogotá D.C. (11)
            ['codigo' => '11001', 'codigo_departamento' => '11', 'codigo_municipio' => '001', 'nombre' => 'Bogotá D.C.', 'tipo' => 'distrito', 'poblacion' => 7412566, 'departamento_id' => $departamentos['11']],

            // Bolívar (13)
            ['codigo' => '13001', 'codigo_departamento' => '13', 'codigo_municipio' => '001', 'nombre' => 'Cartagena', 'tipo' => 'distrito', 'poblacion' => 1028736, 'departamento_id' => $departamentos['13']],
            ['codigo' => '13244', 'codigo_departamento' => '13', 'codigo_municipio' => '244', 'nombre' => 'Turbaco', 'tipo' => 'municipio', 'poblacion' => 89879, 'departamento_id' => $departamentos['13']],

            // Boyacá (15)
            ['codigo' => '15001', 'codigo_departamento' => '15', 'codigo_municipio' => '001', 'nombre' => 'Tunja', 'tipo' => 'municipio', 'poblacion' => 203251, 'departamento_id' => $departamentos['15']],
            ['codigo' => '15238', 'codigo_departamento' => '15', 'codigo_municipio' => '238', 'nombre' => 'Duitama', 'tipo' => 'municipio', 'poblacion' => 132032, 'departamento_id' => $departamentos['15']],
            ['codigo' => '15759', 'codigo_departamento' => '15', 'codigo_municipio' => '759', 'nombre' => 'Sogamoso', 'tipo' => 'municipio', 'poblacion' => 126551, 'departamento_id' => $departamentos['15']],

            // Caldas (17)
            ['codigo' => '17001', 'codigo_departamento' => '17', 'codigo_municipio' => '001', 'nombre' => 'Manizales', 'tipo' => 'municipio', 'poblacion' => 434403, 'departamento_id' => $departamentos['17']],

            // Caquetá (18)
            ['codigo' => '18001', 'codigo_departamento' => '18', 'codigo_municipio' => '001', 'nombre' => 'Florencia', 'tipo' => 'municipio', 'poblacion' => 188216, 'departamento_id' => $departamentos['18']],

            // Cauca (19)
            ['codigo' => '19001', 'codigo_departamento' => '19', 'codigo_municipio' => '001', 'nombre' => 'Popayán', 'tipo' => 'municipio', 'poblacion' => 308981, 'departamento_id' => $departamentos['19']],

            // Cesar (20)
            ['codigo' => '20001', 'codigo_departamento' => '20', 'codigo_municipio' => '001', 'nombre' => 'Valledupar', 'tipo' => 'municipio', 'poblacion' => 492820, 'departamento_id' => $departamentos['20']],

            // Córdoba (23)
            ['codigo' => '23001', 'codigo_departamento' => '23', 'codigo_municipio' => '001', 'nombre' => 'Montería', 'tipo' => 'municipio', 'poblacion' => 505334, 'departamento_id' => $departamentos['23']],

            // Cundinamarca (25)
            ['codigo' => '25175', 'codigo_departamento' => '25', 'codigo_municipio' => '175', 'nombre' => 'Chía', 'tipo' => 'municipio', 'poblacion' => 140557, 'departamento_id' => $departamentos['25']],
            ['codigo' => '25286', 'codigo_departamento' => '25', 'codigo_municipio' => '286', 'nombre' => 'Facatativá', 'tipo' => 'municipio', 'poblacion' => 144699, 'departamento_id' => $departamentos['25']],
            ['codigo' => '25295', 'codigo_departamento' => '25', 'codigo_municipio' => '295', 'nombre' => 'Funza', 'tipo' => 'municipio', 'poblacion' => 90158, 'departamento_id' => $departamentos['25']],
            ['codigo' => '25473', 'codigo_departamento' => '25', 'codigo_municipio' => '473', 'nombre' => 'Mosquera', 'tipo' => 'municipio', 'poblacion' => 96877, 'departamento_id' => $departamentos['25']],
            ['codigo' => '25754', 'codigo_departamento' => '25', 'codigo_municipio' => '754', 'nombre' => 'Soacha', 'tipo' => 'municipio', 'poblacion' => 753709, 'departamento_id' => $departamentos['25']],
            ['codigo' => '25899', 'codigo_departamento' => '25', 'codigo_municipio' => '899', 'nombre' => 'Zipaquirá', 'tipo' => 'municipio', 'poblacion' => 141403, 'departamento_id' => $departamentos['25']],

            // Chocó (27)
            ['codigo' => '27001', 'codigo_departamento' => '27', 'codigo_municipio' => '001', 'nombre' => 'Quibdó', 'tipo' => 'municipio', 'poblacion' => 129237, 'departamento_id' => $departamentos['27']],

            // Huila (41)
            ['codigo' => '41001', 'codigo_departamento' => '41', 'codigo_municipio' => '001', 'nombre' => 'Neiva', 'tipo' => 'municipio', 'poblacion' => 357392, 'departamento_id' => $departamentos['41']],

            // La Guajira (44)
            ['codigo' => '44001', 'codigo_departamento' => '44', 'codigo_municipio' => '001', 'nombre' => 'Riohacha', 'tipo' => 'municipio', 'poblacion' => 279670, 'departamento_id' => $departamentos['44']],

            // Magdalena (47)
            ['codigo' => '47001', 'codigo_departamento' => '47', 'codigo_municipio' => '001', 'nombre' => 'Santa Marta', 'tipo' => 'distrito', 'poblacion' => 506124, 'departamento_id' => $departamentos['47']],

            // Meta (50)
            ['codigo' => '50001', 'codigo_departamento' => '50', 'codigo_municipio' => '001', 'nombre' => 'Villavicencio', 'tipo' => 'municipio', 'poblacion' => 531275, 'departamento_id' => $departamentos['50']],

            // Nariño (52)
            ['codigo' => '52001', 'codigo_departamento' => '52', 'codigo_municipio' => '001', 'nombre' => 'Pasto', 'tipo' => 'municipio', 'poblacion' => 450664, 'departamento_id' => $departamentos['52']],

            // Norte de Santander (54)
            ['codigo' => '54001', 'codigo_departamento' => '54', 'codigo_municipio' => '001', 'nombre' => 'Cúcuta', 'tipo' => 'municipio', 'poblacion' => 656037, 'departamento_id' => $departamentos['54']],

            // Quindío (63)
            ['codigo' => '63001', 'codigo_departamento' => '63', 'codigo_municipio' => '001', 'nombre' => 'Armenia', 'tipo' => 'municipio', 'poblacion' => 307388, 'departamento_id' => $departamentos['63']],

            // Risaralda (66)
            ['codigo' => '66001', 'codigo_departamento' => '66', 'codigo_municipio' => '001', 'nombre' => 'Pereira', 'tipo' => 'municipio', 'poblacion' => 488839, 'departamento_id' => $departamentos['66']],

            // Santander (68)
            ['codigo' => '68001', 'codigo_departamento' => '68', 'codigo_municipio' => '001', 'nombre' => 'Bucaramanga', 'tipo' => 'municipio', 'poblacion' => 613400, 'departamento_id' => $departamentos['68']],
            ['codigo' => '68276', 'codigo_departamento' => '68', 'codigo_municipio' => '276', 'nombre' => 'Floridablanca', 'tipo' => 'municipio', 'poblacion' => 273077, 'departamento_id' => $departamentos['68']],
            ['codigo' => '68307', 'codigo_departamento' => '68', 'codigo_municipio' => '307', 'nombre' => 'Girón', 'tipo' => 'municipio', 'poblacion' => 193904, 'departamento_id' => $departamentos['68']],

            // Sucre (70)
            ['codigo' => '70001', 'codigo_departamento' => '70', 'codigo_municipio' => '001', 'nombre' => 'Sincelejo', 'tipo' => 'municipio', 'poblacion' => 288079, 'departamento_id' => $departamentos['70']],

            // Tolima (73)
            ['codigo' => '73001', 'codigo_departamento' => '73', 'codigo_municipio' => '001', 'nombre' => 'Ibagué', 'tipo' => 'municipio', 'poblacion' => 553524, 'departamento_id' => $departamentos['73']],

            // Valle del Cauca (76)
            ['codigo' => '76001', 'codigo_departamento' => '76', 'codigo_municipio' => '001', 'nombre' => 'Cali', 'tipo' => 'distrito', 'poblacion' => 2258653, 'departamento_id' => $departamentos['76']],
            ['codigo' => '76111', 'codigo_departamento' => '76', 'codigo_municipio' => '111', 'nombre' => 'Buenaventura', 'tipo' => 'distrito', 'poblacion' => 427807, 'departamento_id' => $departamentos['76']],
            ['codigo' => '76520', 'codigo_departamento' => '76', 'codigo_municipio' => '520', 'nombre' => 'Palmira', 'tipo' => 'municipio', 'poblacion' => 318483, 'departamento_id' => $departamentos['76']],

            // Otros departamentos (capitales)
            ['codigo' => '81001', 'codigo_departamento' => '81', 'codigo_municipio' => '001', 'nombre' => 'Arauca', 'tipo' => 'municipio', 'poblacion' => 99494, 'departamento_id' => $departamentos['81']],
            ['codigo' => '85001', 'codigo_departamento' => '85', 'codigo_municipio' => '001', 'nombre' => 'Yopal', 'tipo' => 'municipio', 'poblacion' => 155216, 'departamento_id' => $departamentos['85']],
            ['codigo' => '86001', 'codigo_departamento' => '86', 'codigo_municipio' => '001', 'nombre' => 'Mocoa', 'tipo' => 'municipio', 'poblacion' => 44818, 'departamento_id' => $departamentos['86']],
            ['codigo' => '88001', 'codigo_departamento' => '88', 'codigo_municipio' => '001', 'nombre' => 'San Andrés', 'tipo' => 'municipio', 'poblacion' => 75167, 'departamento_id' => $departamentos['88']],
            ['codigo' => '91001', 'codigo_departamento' => '91', 'codigo_municipio' => '001', 'nombre' => 'Leticia', 'tipo' => 'municipio', 'poblacion' => 50712, 'departamento_id' => $departamentos['91']],
            ['codigo' => '94001', 'codigo_departamento' => '94', 'codigo_municipio' => '001', 'nombre' => 'Inírida', 'tipo' => 'municipio', 'poblacion' => 20081, 'departamento_id' => $departamentos['94']],
            ['codigo' => '95001', 'codigo_departamento' => '95', 'codigo_municipio' => '001', 'nombre' => 'San José del Guaviare', 'tipo' => 'municipio', 'poblacion' => 65739, 'departamento_id' => $departamentos['95']],
            ['codigo' => '97001', 'codigo_departamento' => '97', 'codigo_municipio' => '001', 'nombre' => 'Mitú', 'tipo' => 'municipio', 'poblacion' => 16936, 'departamento_id' => $departamentos['97']],
            ['codigo' => '99001', 'codigo_departamento' => '99', 'codigo_municipio' => '001', 'nombre' => 'Puerto Carreño', 'tipo' => 'municipio', 'poblacion' => 18263, 'departamento_id' => $departamentos['99']],
        ];

        foreach ($municipios as &$mun) {
            $mun['nombre_oficial'] = ($mun['tipo'] === 'distrito' ? 'Distrito de ' : 'Municipio de ') . $mun['nombre'];
            $mun['created_at'] = $now;
            $mun['updated_at'] = $now;
        }

        DB::table('municipios')->insert($municipios);

        $this->command->info('✅ ' . count($municipios) . ' municipios principales creados exitosamente');
        $this->command->warn('⚠️  Para producción: importar los 1102 municipios completos desde CSV oficial');
    }
}
