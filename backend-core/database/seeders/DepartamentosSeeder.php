<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DepartamentosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Los 32 departamentos de Colombia + Bogotá D.C.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $departamentos = [
            ['codigo' => '05', 'nombre' => 'Antioquia', 'capital' => 'Medellín', 'region' => 'Andina', 'poblacion' => 6407102],
            ['codigo' => '08', 'nombre' => 'Atlántico', 'capital' => 'Barranquilla', 'region' => 'Caribe', 'poblacion' => 2535517],
            ['codigo' => '11', 'nombre' => 'Bogotá D.C.', 'capital' => 'Bogotá', 'region' => 'Andina', 'poblacion' => 7412566],
            ['codigo' => '13', 'nombre' => 'Bolívar', 'capital' => 'Cartagena', 'region' => 'Caribe', 'poblacion' => 2097161],
            ['codigo' => '15', 'nombre' => 'Boyacá', 'capital' => 'Tunja', 'region' => 'Andina', 'poblacion' => 1232780],
            ['codigo' => '17', 'nombre' => 'Caldas', 'capital' => 'Manizales', 'region' => 'Andina', 'poblacion' => 987991],
            ['codigo' => '18', 'nombre' => 'Caquetá', 'capital' => 'Florencia', 'region' => 'Amazonía', 'poblacion' => 401849],
            ['codigo' => '19', 'nombre' => 'Cauca', 'capital' => 'Popayán', 'region' => 'Pacífica', 'poblacion' => 1404313],
            ['codigo' => '20', 'nombre' => 'Cesar', 'capital' => 'Valledupar', 'region' => 'Caribe', 'poblacion' => 1040423],
            ['codigo' => '23', 'nombre' => 'Córdoba', 'capital' => 'Montería', 'region' => 'Caribe', 'poblacion' => 1784783],
            ['codigo' => '25', 'nombre' => 'Cundinamarca', 'capital' => 'Bogotá', 'region' => 'Andina', 'poblacion' => 2919060],
            ['codigo' => '27', 'nombre' => 'Chocó', 'capital' => 'Quibdó', 'region' => 'Pacífica', 'poblacion' => 509521],
            ['codigo' => '41', 'nombre' => 'Huila', 'capital' => 'Neiva', 'region' => 'Andina', 'poblacion' => 1122622],
            ['codigo' => '44', 'nombre' => 'La Guajira', 'capital' => 'Riohacha', 'region' => 'Caribe', 'poblacion' => 957797],
            ['codigo' => '47', 'nombre' => 'Magdalena', 'capital' => 'Santa Marta', 'region' => 'Caribe', 'poblacion' => 1295836],
            ['codigo' => '50', 'nombre' => 'Meta', 'capital' => 'Villavicencio', 'region' => 'Orinoquía', 'poblacion' => 1033466],
            ['codigo' => '52', 'nombre' => 'Nariño', 'capital' => 'Pasto', 'region' => 'Andina', 'poblacion' => 1744275],
            ['codigo' => '54', 'nombre' => 'Norte de Santander', 'capital' => 'Cúcuta', 'region' => 'Andina', 'poblacion' => 1355787],
            ['codigo' => '63', 'nombre' => 'Quindío', 'capital' => 'Armenia', 'region' => 'Andina', 'poblacion' => 565310],
            ['codigo' => '66', 'nombre' => 'Risaralda', 'capital' => 'Pereira', 'region' => 'Andina', 'poblacion' => 951953],
            ['codigo' => '68', 'nombre' => 'Santander', 'capital' => 'Bucaramanga', 'region' => 'Andina', 'poblacion' => 2061095],
            ['codigo' => '70', 'nombre' => 'Sucre', 'capital' => 'Sincelejo', 'region' => 'Caribe', 'poblacion' => 908590],
            ['codigo' => '73', 'nombre' => 'Tolima', 'capital' => 'Ibagué', 'region' => 'Andina', 'poblacion' => 1408272],
            ['codigo' => '76', 'nombre' => 'Valle del Cauca', 'capital' => 'Cali', 'region' => 'Pacífica', 'poblacion' => 4532378],
            ['codigo' => '81', 'nombre' => 'Arauca', 'capital' => 'Arauca', 'region' => 'Orinoquía', 'poblacion' => 262315],
            ['codigo' => '85', 'nombre' => 'Casanare', 'capital' => 'Yopal', 'region' => 'Orinoquía', 'poblacion' => 392739],
            ['codigo' => '86', 'nombre' => 'Putumayo', 'capital' => 'Mocoa', 'region' => 'Amazonía', 'poblacion' => 360691],
            ['codigo' => '88', 'nombre' => 'Archipiélago de San Andrés', 'capital' => 'San Andrés', 'region' => 'Insular', 'poblacion' => 75167],
            ['codigo' => '91', 'nombre' => 'Amazonas', 'capital' => 'Leticia', 'region' => 'Amazonía', 'poblacion' => 79279],
            ['codigo' => '94', 'nombre' => 'Guainía', 'capital' => 'Inírida', 'region' => 'Amazonía', 'poblacion' => 47200],
            ['codigo' => '95', 'nombre' => 'Guaviare', 'capital' => 'San José del Guaviare', 'region' => 'Amazonía', 'poblacion' => 112498],
            ['codigo' => '97', 'nombre' => 'Vaupés', 'capital' => 'Mitú', 'region' => 'Amazonía', 'poblacion' => 45608],
            ['codigo' => '99', 'nombre' => 'Vichada', 'capital' => 'Puerto Carreño', 'region' => 'Orinoquía', 'poblacion' => 107808],
        ];

        foreach ($departamentos as &$depto) {
            $depto['nombre_oficial'] = 'Departamento de ' . $depto['nombre'];
            $depto['created_at'] = $now;
            $depto['updated_at'] = $now;
        }

        DB::table('departamentos')->insert($departamentos);

        $this->command->info('✅ 33 departamentos creados exitosamente');
    }
}
