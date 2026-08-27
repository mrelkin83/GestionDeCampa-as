<?php

namespace App\Console\Commands;

use App\Models\CensoImportacion;
use App\Models\CensoVersion;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ImportCensoElectoralCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:censo
                            {file : Path to Excel/CSV file with censo electoral data}
                            {--user_id= : ID of the user running this import (queda registrado en censo_importaciones)}
                            {--campana_id= : ID of the campaign to also create/sync votantes for}
                            {--censo-version= : Código de la versión de censo (censo_versiones.codigo), ej. "2027-03". Si ya existe, se reutiliza. No se llama --version: ese nombre choca con la opción global de Symfony Console (php artisan --version)}
                            {--chunk=1000 : Number of rows to process per batch}
                            {--skip-duplicates : Skip duplicate documents instead of updating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa censo electoral desde archivo Excel/CSV de la Registraduría';

    protected int $imported = 0;
    protected int $updated = 0;
    protected int $errors = 0;
    protected int $skipped = 0;
    protected int $votantesCreados = 0;
    protected int $votantesActualizados = 0;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');
        $campanaId = $this->option('campana_id') ? (int) $this->option('campana_id') : null;
        $chunkSize = (int) $this->option('chunk');
        $userId = $this->option('user_id') ? (int) $this->option('user_id') : null;

        if (!file_exists($file)) {
            $this->error("❌ Archivo no encontrado: {$file}");
            return 1;
        }

        // censo_importaciones.user_id es NOT NULL: se necesita un usuario real
        // para dejar auditoría de quién ejecutó la importación.
        if (!$userId || !User::whereKey($userId)->exists()) {
            $this->error("❌ Debe indicar --user_id con el ID de un usuario existente (para el log de auditoría censo_importaciones)");
            return 1;
        }

        if ($campanaId && !DB::table('campanas')->where('id', $campanaId)->exists()) {
            $this->error("❌ Campaña con ID {$campanaId} no existe");
            return 1;
        }

        $versionCodigo = $this->option('censo-version') ?? now()->format('Y-m-d');

        $version = CensoVersion::firstOrCreate(
            ['codigo' => $versionCodigo],
            [
                'nombre' => 'Importación ' . $versionCodigo,
                'fecha_corte' => now(),
                'fuente' => 'Registraduría Nacional',
                'estado' => 'procesando',
            ]
        );

        $importacion = CensoImportacion::create([
            'version_id' => $version->id,
            'user_id' => $userId,
            'archivo_original' => basename($file),
            'estado' => 'procesando',
            'fecha_inicio' => now(),
        ]);

        $this->info("📊 Importando Censo Electoral");
        $this->info("📁 Archivo: {$file}");
        $this->info("📌 Versión: {$version->codigo} (id={$version->id})");
        if ($campanaId) {
            $this->info("🎯 Campaña ID: {$campanaId}");
        }
        $this->newLine();

        try {
            $rows = $this->leerFilas($file);

            if (empty($rows)) {
                throw new \Exception('El archivo no contiene filas de datos');
            }

            $header = array_shift($rows);
            $columnMap = $this->mapColumns($header);

            if (!$columnMap) {
                throw new \Exception('No se pudieron mapear las columnas del archivo');
            }

            $totalFilas = count($rows);
            $bar = $this->output->createProgressBar($totalFilas);
            $bar->start();

            $batch = [];

            foreach ($rows as $lineNumber => $row) {
                try {
                    $censoData = $this->mapRowToCenso($row, $columnMap, $version->id);

                    if ($censoData) {
                        $batch[] = $censoData;
                    }

                    if (count($batch) >= $chunkSize) {
                        $this->processBatch($batch, $campanaId);
                        $batch = [];
                    }
                } catch (\Exception $e) {
                    $this->errors++;
                    Log::warning("Error en línea {$lineNumber}: " . $e->getMessage(), ['row' => $row]);
                }

                $bar->advance();
            }

            if (!empty($batch)) {
                $this->processBatch($batch, $campanaId);
            }

            $bar->finish();
            $this->newLine();

            $version->update([
                'total_registros' => $version->registros()->count(),
                'estado' => 'activa',
            ]);

            $importacion->update([
                'total_filas' => $totalFilas,
                'filas_exitosas' => $this->imported + $this->updated,
                'filas_errores' => $this->errors,
                'filas_duplicadas' => $this->skipped,
                'estado' => 'completada',
                'progreso_porcentaje' => 100,
                'fecha_fin' => now(),
                'estadisticas' => [
                    'censo_importados' => $this->imported,
                    'censo_actualizados' => $this->updated,
                    'votantes_creados' => $this->votantesCreados,
                    'votantes_actualizados' => $this->votantesActualizados,
                ],
            ]);

            $this->newLine(2);
            $this->info("✅ Importación completada!");
            $this->table(
                ['Métrica', 'Cantidad'],
                [
                    ['Censo importados', $this->imported],
                    ['Censo actualizados', $this->updated],
                    ['Errores', $this->errors],
                    ['Omitidos (duplicados)', $this->skipped],
                    ['Votantes creados (campaña)', $this->votantesCreados],
                    ['Votantes actualizados (campaña)', $this->votantesActualizados],
                    ['Total procesados', $totalFilas],
                ]
            );

            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Error durante la importación: " . $e->getMessage());
            Log::error('Error importando censo electoral', [
                'file' => $file,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $importacion->update([
                'estado' => 'fallida',
                'mensaje_error' => $e->getMessage(),
                'fecha_fin' => now(),
            ]);
            $version->update(['estado' => 'borrador']);

            return 1;
        }
    }

    /**
     * Leer todas las filas del archivo (Excel o CSV) como array de arrays,
     * con la fila de encabezado en la posición 0. Unifica ambos formatos
     * para que el resto del comando no necesite dos rutas de procesamiento
     * distintas (antes, la ruta Excel usaba una clase CensoElectoralImport
     * cuyo collection() estaba vacío -no importaba ni una fila-).
     */
    protected function leerFilas(string $file): array
    {
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        if (in_array($extension, ['xlsx', 'xls', 'ods'])) {
            $this->info("📑 Procesando archivo Excel...");
            $sheets = Excel::toArray(null, $file);

            return $sheets[0] ?? [];
        }

        $this->info("📄 Procesando archivo CSV...");
        $rows = [];
        $handle = fopen($file, 'r');

        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Mapear columnas del archivo a campos del censo
     */
    protected function mapColumns(array $header): ?array
    {
        $map = [];

        $normalizedHeaders = array_map(function ($h) {
            return Str::slug(strtolower((string) $h), '_');
        }, $header);

        $mappings = [
            'documento' => ['documento', 'cedula', 'num_documento', 'numero_documento', 'identification'],
            'tipo_documento' => ['tipo_documento', 'tipo_doc', 'document_type'],
            'primer_nombre' => ['primer_nombre', 'primernombre', 'first_name'],
            'segundo_nombre' => ['segundo_nombre', 'segundonombre', 'middle_name'],
            'primer_apellido' => ['primer_apellido', 'primerapellido', 'last_name'],
            'segundo_apellido' => ['segundo_apellido', 'segundoapellido', 'second_last_name'],
            'nombres' => ['nombres', 'nombre', 'name'],
            'apellidos' => ['apellidos', 'apellido', 'surname'],
            'fecha_nacimiento' => ['fecha_nacimiento', 'fec_nacimiento', 'birth_date', 'nacimiento'],
            'sexo' => ['sexo', 'genero', 'gender', 'sex'],
            'direccion' => ['direccion', 'address', 'dir'],
            'telefono' => ['telefono', 'phone'],
            'celular' => ['celular', 'mobile', 'cel'],
            'email' => ['email', 'correo', 'mail', 'e_mail'],
            'departamento_codigo' => ['cod_departamento', 'codigo_departamento', 'dept_code'],
            'municipio_codigo' => ['cod_municipio', 'codigo_municipio', 'mun_code'],
            'puesto_votacion_codigo' => ['puesto', 'puesto_votacion', 'cod_puesto', 'polling_station'],
            'mesa_numero' => ['mesa', 'num_mesa', 'table_number'],
        ];

        foreach ($mappings as $field => $possibleNames) {
            foreach ($possibleNames as $name) {
                $index = array_search($name, $normalizedHeaders, true);
                if ($index !== false) {
                    $map[$field] = $index;
                    break;
                }
            }
        }

        if (!isset($map['documento'])) {
            $this->error("❌ No se encontró columna 'documento' en el archivo");
            return null;
        }

        if (!isset($map['municipio_codigo'])) {
            $this->error("❌ No se encontró columna de código de municipio (censo_electoral.municipio_id es obligatorio)");
            return null;
        }

        return $map;
    }

    /**
     * Mapear fila a datos de censo_electoral (esquema real: primer_nombre/
     * segundo_nombre/primer_apellido/segundo_apellido/genero/departamento_id/
     * municipio_id -no 'nombres'/'apellidos'/'sexo'/'puesto_votacion' como
     * strings sueltos, que nunca existieron en ninguna tabla real-).
     */
    protected function mapRowToCenso(array $row, array $columnMap, int $versionId): ?array
    {
        $documento = trim((string) ($row[$columnMap['documento']] ?? ''));

        if ($documento === '') {
            $this->skipped++;
            return null;
        }

        $codigoMunicipio = trim((string) ($row[$columnMap['municipio_codigo']] ?? ''));
        $municipio = $codigoMunicipio !== ''
            ? DB::table('municipios')->where('codigo', $codigoMunicipio)->first(['id', 'departamento_id'])
            : null;

        if (!$municipio) {
            // departamento_id/municipio_id son NOT NULL en censo_electoral:
            // sin municipio resuelto, la fila no se puede insertar.
            throw new \Exception("Municipio con código '{$codigoMunicipio}' no encontrado (documento {$documento})");
        }

        $puestoId = null;
        if (isset($columnMap['puesto_votacion_codigo'])) {
            $codigoPuesto = trim((string) ($row[$columnMap['puesto_votacion_codigo']] ?? ''));
            if ($codigoPuesto !== '') {
                $puestoId = DB::table('puestos_votacion')
                    ->where('codigo', $codigoPuesto)
                    ->where('municipio_id', $municipio->id)
                    ->value('id');
            }
        }

        $numeroMesa = isset($columnMap['mesa_numero'])
            ? trim((string) ($row[$columnMap['mesa_numero']] ?? ''))
            : null;

        $mesaId = null;
        if ($puestoId && $numeroMesa) {
            $mesaId = DB::table('mesas')
                ->where('puesto_votacion_id', $puestoId)
                ->where('numero', $numeroMesa)
                ->value('id');
        }

        [$primerNombre, $segundoNombre] = $this->resolverNombre($row, $columnMap);
        [$primerApellido, $segundoApellido] = $this->resolverApellido($row, $columnMap);

        if ($primerNombre === '' || $primerApellido === '') {
            throw new \Exception("Nombre o apellido vacío (documento {$documento})");
        }

        $fechaNacimiento = isset($columnMap['fecha_nacimiento'])
            ? $this->parseDate($row[$columnMap['fecha_nacimiento']] ?? null)
            : null;

        $genero = isset($columnMap['sexo']) ? $this->parseSexo($row[$columnMap['sexo']] ?? null) : null;

        $data = [
            'version_id' => $versionId,
            'documento' => $documento,
            'tipo_documento' => strtoupper(trim((string) ($row[$columnMap['tipo_documento']] ?? 'CC'))) ?: 'CC',
            'primer_nombre' => $primerNombre,
            'segundo_nombre' => $segundoNombre ?: null,
            'primer_apellido' => $primerApellido,
            'segundo_apellido' => $segundoApellido ?: null,
            'genero' => $genero ?? 'M',
            'fecha_nacimiento' => $fechaNacimiento,
            // Carbon::diffInYears() en Carbon 3 devuelve un float con signo
            // (ej. -41.45) según el orden de los argumentos; ->age siempre
            // da un entero no negativo calculado contra la fecha actual.
            'edad' => $fechaNacimiento ? \Carbon\Carbon::parse($fechaNacimiento)->age : null,
            'departamento_id' => $municipio->departamento_id,
            'municipio_id' => $municipio->id,
            'puesto_votacion_id' => $puestoId,
            'mesa_id' => $mesaId,
            'numero_mesa' => $numeroMesa ?: null,
            'telefono' => isset($columnMap['telefono']) ? $this->cleanPhone($row[$columnMap['telefono']] ?? null) : null,
            'celular' => isset($columnMap['celular']) ? $this->cleanPhone($row[$columnMap['celular']] ?? null) : null,
            'email' => isset($columnMap['email']) ? (trim((string) ($row[$columnMap['email']] ?? '')) ?: null) : null,
            'direccion_residencia' => isset($columnMap['direccion']) ? (trim((string) ($row[$columnMap['direccion']] ?? '')) ?: null) : null,
            'estado_activo' => true,
            'estado_registro' => 'activo',
        ];

        $data['hash_registro'] = hash('sha256', implode('|', [
            $data['documento'],
            $data['tipo_documento'],
            $data['primer_nombre'],
            $data['primer_apellido'],
            $data['municipio_id'],
        ]));

        return $data;
    }

    /**
     * Resolver primer_nombre/segundo_nombre: prioriza columnas ya separadas
     * si existen, si no divide una columna combinada 'nombres'.
     */
    protected function resolverNombre(array $row, array $columnMap): array
    {
        if (isset($columnMap['primer_nombre'])) {
            $primero = trim((string) ($row[$columnMap['primer_nombre']] ?? ''));
            $segundo = isset($columnMap['segundo_nombre']) ? trim((string) ($row[$columnMap['segundo_nombre']] ?? '')) : '';
            return [$primero, $segundo];
        }

        if (isset($columnMap['nombres'])) {
            $partes = preg_split('/\s+/', trim((string) ($row[$columnMap['nombres']] ?? '')), -1, PREG_SPLIT_NO_EMPTY);
            return [$partes[0] ?? '', implode(' ', array_slice($partes, 1))];
        }

        return ['', ''];
    }

    protected function resolverApellido(array $row, array $columnMap): array
    {
        if (isset($columnMap['primer_apellido'])) {
            $primero = trim((string) ($row[$columnMap['primer_apellido']] ?? ''));
            $segundo = isset($columnMap['segundo_apellido']) ? trim((string) ($row[$columnMap['segundo_apellido']] ?? '')) : '';
            return [$primero, $segundo];
        }

        if (isset($columnMap['apellidos'])) {
            $partes = preg_split('/\s+/', trim((string) ($row[$columnMap['apellidos']] ?? '')), -1, PREG_SPLIT_NO_EMPTY);
            return [$partes[0] ?? '', implode(' ', array_slice($partes, 1))];
        }

        return ['', ''];
    }

    /**
     * Procesar lote: upsert contra censo_electoral (único real por
     * version_id+documento) y, si se pidió --campana_id, espejar contra
     * votantes (único real por campana_id+documento) con los nombres de
     * columna reales del modelo Votante.
     */
    protected function processBatch(array $batch, ?int $campanaId): void
    {
        foreach ($batch as $censoData) {
            try {
                $existente = DB::table('censo_electoral')
                    ->where('version_id', $censoData['version_id'])
                    ->where('documento', $censoData['documento'])
                    ->first(['id']);

                if ($existente) {
                    if ($this->option('skip-duplicates')) {
                        $this->skipped++;
                        continue;
                    }

                    DB::table('censo_electoral')
                        ->where('id', $existente->id)
                        ->update(array_merge($censoData, ['updated_at' => now()]));
                    $this->updated++;
                    $censoId = $existente->id;
                } else {
                    $censoId = DB::table('censo_electoral')->insertGetId(array_merge($censoData, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                    $this->imported++;
                }

                if ($campanaId) {
                    $this->sincronizarVotante($campanaId, $censoId, $censoData);
                }
            } catch (\Exception $e) {
                $this->errors++;
                Log::warning('Error insertando registro de censo: ' . $e->getMessage(), [
                    'documento' => $censoData['documento'] ?? 'unknown',
                ]);
            }
        }
    }

    /**
     * Crear/actualizar el votante de una campaña específica a partir de un
     * registro de censo ya importado.
     */
    protected function sincronizarVotante(int $campanaId, int $censoId, array $censoData): void
    {
        $votanteData = [
            'campana_id' => $campanaId,
            'censo_id' => $censoId,
            'documento' => $censoData['documento'],
            'tipo_documento' => $censoData['tipo_documento'],
            'primer_nombre' => $censoData['primer_nombre'],
            'segundo_nombre' => $censoData['segundo_nombre'],
            'primer_apellido' => $censoData['primer_apellido'],
            'segundo_apellido' => $censoData['segundo_apellido'],
            'genero' => $censoData['genero'],
            'fecha_nacimiento' => $censoData['fecha_nacimiento'],
            'edad' => $censoData['edad'],
            'celular' => $censoData['celular'],
            'telefono' => $censoData['telefono'],
            'email' => $censoData['email'],
            'departamento_id' => $censoData['departamento_id'],
            'municipio_id' => $censoData['municipio_id'],
            'puesto_votacion_id' => $censoData['puesto_votacion_id'],
            'mesa_id' => $censoData['mesa_id'],
            'estado' => 'activo',
        ];

        $existente = DB::table('votantes')
            ->where('campana_id', $campanaId)
            ->where('documento', $censoData['documento'])
            ->first(['id']);

        if ($existente) {
            DB::table('votantes')->where('id', $existente->id)->update(array_merge($votanteData, ['updated_at' => now()]));
            $this->votantesActualizados++;
        } else {
            DB::table('votantes')->insert(array_merge($votanteData, ['created_at' => now(), 'updated_at' => now()]));
            $this->votantesCreados++;
        }
    }

    /**
     * Parsear fecha en diferentes formatos
     */
    protected function parseDate(?string $date): ?string
    {
        if (!$date) {
            return null;
        }

        $formats = ['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d'];

        foreach ($formats as $format) {
            $parsed = \DateTime::createFromFormat($format, $date);
            if ($parsed) {
                return $parsed->format('Y-m-d');
            }
        }

        return null;
    }

    /**
     * Parsear sexo/género (censo_electoral.genero es varchar(1): M o F)
     */
    protected function parseSexo(?string $sexo): ?string
    {
        if (!$sexo) {
            return null;
        }

        $sexo = strtoupper(substr(trim($sexo), 0, 1));

        return match ($sexo) {
            'M' => 'M',
            'F' => 'F',
            'H' => 'M',
            default => null,
        };
    }

    /**
     * Limpiar número de teléfono
     */
    protected function cleanPhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (!str_starts_with($phone, '+')) {
            $phone = '+57' . ltrim($phone, '0');
        }

        return $phone;
    }
}
