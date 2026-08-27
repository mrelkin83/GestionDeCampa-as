<?php

namespace App\Services;

use App\Models\Donacion;
use App\Models\Evento;
use App\Models\Gasto;
use App\Models\Mensaje;
use App\Models\Reporte;
use App\Models\Votante;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * Genera el contenido real de un Reporte (PDF/Excel/CSV) a partir de los
 * datos de la campaña. Antes de este servicio, ReportesExportables.tsx
 * (frontend-web) llamaba a /api/reportes/* -rutas que nunca existieron en
 * backend-core-, dejando esa pantalla completa como un callejón sin salida
 * (todo botón/formulario terminaba en 404).
 */
class ReporteService
{
    // 'incluir_comparativas' se guarda en el registro pero todavía no afecta
    // la salida: comparar contra el período anterior requiere duplicar cada
    // consulta con un rango desplazado y decidir cómo presentarlo por tipo,
    // algo que amerita su propio trabajo. No se marca 'completado' con datos
    // falsos: el reporte se genera igual, sin la sección comparativa.
    public function generar(Reporte $reporte): void
    {
        try {
            $datos = $this->recopilarDatos($reporte);

            $path = match ($reporte->formato) {
                'pdf' => $this->generarPdf($datos, $reporte),
                'csv' => $this->generarCsv($datos, $reporte),
                'excel' => $this->generarExcel($datos, $reporte),
            };

            $reporte->update([
                'estado' => 'completado',
                'archivo_path' => $path,
                'fecha_generacion' => now(),
            ]);
        } catch (\Throwable $e) {
            $reporte->update([
                'estado' => 'error',
                'mensaje_error' => $e->getMessage(),
            ]);
        }
    }

    protected function recopilarDatos(Reporte $reporte): array
    {
        return match ($reporte->tipo) {
            'votantes' => $this->datosVotantes($reporte),
            'financiero' => $this->datosFinanciero($reporte),
            'comunicacion' => $this->datosComunicacion($reporte),
            'eventos' => $this->datosEventos($reporte),
            'general' => $this->datosGeneral($reporte),
        };
    }

    protected function aplicarFiltrosFecha(Builder $query, ?array $filtros, string $columna): Builder
    {
        if (!empty($filtros['fecha_inicio'])) {
            $query->whereDate($columna, '>=', $filtros['fecha_inicio']);
        }
        if (!empty($filtros['fecha_fin'])) {
            $query->whereDate($columna, '<=', $filtros['fecha_fin']);
        }

        return $query;
    }

    protected function datosVotantes(Reporte $reporte): array
    {
        $query = Votante::where('campana_id', $reporte->campana_id);
        $this->aplicarFiltrosFecha($query, $reporte->filtros, 'created_at');

        $total = (clone $query)->count();
        $porIntencion = (clone $query)
            ->select('intencion_voto', DB::raw('count(*) as total'))
            ->groupBy('intencion_voto')
            ->pluck('total', 'intencion_voto');
        $lideres = (clone $query)->where('es_lider', true)->count();
        $topMunicipios = (clone $query)
            ->join('municipios', 'votantes.municipio_id', '=', 'municipios.id')
            ->select('municipios.nombre', DB::raw('count(*) as total'))
            ->groupBy('municipios.nombre')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return [
            'resumen' => [
                'Total de votantes' => number_format($total, 0, ',', '.'),
                'Líderes identificados' => number_format($lideres, 0, ',', '.'),
                'A favor' => number_format($porIntencion['a_favor'] ?? 0, 0, ',', '.'),
                'En contra' => number_format($porIntencion['en_contra'] ?? 0, 0, ',', '.'),
                'Indecisos' => number_format($porIntencion['indeciso'] ?? 0, 0, ',', '.'),
                'Sin definir' => number_format($porIntencion['sin_definir'] ?? 0, 0, ',', '.'),
            ],
            'graficos' => [
                'Intención de voto' => $porIntencion->toArray(),
            ],
            'detalle_titulo' => 'Top 10 municipios por número de votantes',
            'detalle_columnas' => ['Municipio', 'Votantes'],
            'detalle' => $topMunicipios->map(fn($m) => [$m->nombre, $m->total])->toArray(),
        ];
    }

    protected function datosFinanciero(Reporte $reporte): array
    {
        $donacionesQuery = Donacion::where('campana_id', $reporte->campana_id)->where('estado', 'confirmada');
        $gastosQuery = Gasto::where('campana_id', $reporte->campana_id)->where('estado', 'aprobado');
        $this->aplicarFiltrosFecha($donacionesQuery, $reporte->filtros, 'fecha_donacion');
        $this->aplicarFiltrosFecha($gastosQuery, $reporte->filtros, 'fecha_gasto');

        $totalDonaciones = (float) (clone $donacionesQuery)->sum(DB::raw('COALESCE(valor_estimado_especie, monto)'));
        $totalGastos = (float) (clone $gastosQuery)->sum('monto');
        $porCategoria = (clone $gastosQuery)
            ->select('categoria', DB::raw('sum(monto) as total'))
            ->groupBy('categoria')
            ->orderByDesc('total')
            ->get();

        $formatoMoneda = fn (float $v) => '$' . number_format($v, 0, ',', '.');

        return [
            'resumen' => [
                'Total donaciones confirmadas' => $formatoMoneda($totalDonaciones),
                'Total gastos aprobados' => $formatoMoneda($totalGastos),
                'Balance' => $formatoMoneda($totalDonaciones - $totalGastos),
            ],
            'graficos' => [
                'Gastos por categoría' => $porCategoria->pluck('total', 'categoria')->toArray(),
            ],
            'detalle_titulo' => 'Gastos aprobados por categoría',
            'detalle_columnas' => ['Categoría', 'Total'],
            'detalle' => $porCategoria->map(fn ($g) => [$g->categoria, $formatoMoneda((float) $g->total)])->toArray(),
        ];
    }

    protected function datosComunicacion(Reporte $reporte): array
    {
        $query = Mensaje::whereHas(
            'campanaComunicacion',
            fn (Builder $q) => $q->where('campana_id', $reporte->campana_id)
        );
        $this->aplicarFiltrosFecha($query, $reporte->filtros, 'fecha_envio');

        $total = (clone $query)->count();
        $porCanal = (clone $query)->select('canal', DB::raw('count(*) as total'))->groupBy('canal')->pluck('total', 'canal');
        // 'estado' en mensajes solo llega hasta 'entregado'/'fallido'/'rebotado'
        // (ver migración de comunicacion_tables); apertura se registra en
        // fecha_apertura, no como un valor de estado adicional como 'abierto'.
        $entregados = (clone $query)->whereNotNull('fecha_entrega')->count();
        $abiertos = (clone $query)->whereNotNull('fecha_apertura')->count();

        return [
            'resumen' => [
                'Total mensajes enviados' => number_format($total, 0, ',', '.'),
                'Entregados' => number_format($entregados, 0, ',', '.'),
                'Tasa de entrega' => $total > 0 ? round($entregados / $total * 100, 1) . '%' : '0%',
                'Tasa de apertura' => $total > 0 ? round($abiertos / $total * 100, 1) . '%' : '0%',
            ],
            'graficos' => [
                'Mensajes por canal' => $porCanal->toArray(),
            ],
            'detalle_titulo' => 'Mensajes por canal',
            'detalle_columnas' => ['Canal', 'Total'],
            'detalle' => collect($porCanal)->map(fn ($v, $k) => [$k, $v])->values()->toArray(),
        ];
    }

    protected function datosEventos(Reporte $reporte): array
    {
        $query = Evento::where('campana_id', $reporte->campana_id);
        $this->aplicarFiltrosFecha($query, $reporte->filtros, 'fecha_inicio');

        $total = (clone $query)->count();
        $totalAsistentes = (int) (clone $query)->sum('total_asistentes');
        $porTipo = (clone $query)->select('tipo', DB::raw('count(*) as total'))->groupBy('tipo')->pluck('total', 'tipo');

        return [
            'resumen' => [
                'Total de eventos' => number_format($total, 0, ',', '.'),
                'Total asistentes' => number_format($totalAsistentes, 0, ',', '.'),
            ],
            'graficos' => [
                'Eventos por tipo' => $porTipo->toArray(),
            ],
            'detalle_titulo' => 'Eventos por tipo',
            'detalle_columnas' => ['Tipo', 'Cantidad'],
            'detalle' => collect($porTipo)->map(fn ($v, $k) => [$k, $v])->values()->toArray(),
        ];
    }

    protected function datosGeneral(Reporte $reporte): array
    {
        $modulos = [
            'Votantes' => $this->datosVotantes($reporte),
            'Financiero' => $this->datosFinanciero($reporte),
            'Comunicación' => $this->datosComunicacion($reporte),
            'Eventos' => $this->datosEventos($reporte),
        ];

        $resumen = [];
        $graficos = [];
        $detalle = [];

        foreach ($modulos as $nombreModulo => $datos) {
            foreach ($datos['resumen'] as $indicador => $valor) {
                $resumen["{$nombreModulo}: {$indicador}"] = $valor;
                $detalle[] = [$nombreModulo, $indicador, $valor];
            }
            foreach ($datos['graficos'] as $titulo => $serie) {
                $graficos["{$nombreModulo}: {$titulo}"] = $serie;
            }
        }

        return [
            'resumen' => $resumen,
            'graficos' => $graficos,
            'detalle_titulo' => 'Resumen por módulo',
            'detalle_columnas' => ['Módulo', 'Indicador', 'Valor'],
            'detalle' => $detalle,
        ];
    }

    protected function nombreArchivo(Reporte $reporte, string $extension): string
    {
        $slug = \Illuminate\Support\Str::slug($reporte->nombre) ?: 'reporte';
        return "reportes/{$reporte->campana_id}/{$reporte->id}-{$slug}.{$extension}";
    }

    protected function generarPdf(array $datos, Reporte $reporte): string
    {
        $pdf = Pdf::loadView('reportes.pdf', [
            'reporte' => $reporte,
            'datos' => $datos,
        ]);

        $path = $this->nombreArchivo($reporte, 'pdf');
        Storage::disk('local')->put($path, $pdf->output());

        return $path;
    }

    protected function generarCsv(array $datos, Reporte $reporte): string
    {
        $path = $this->nombreArchivo($reporte, 'csv');
        $handle = fopen('php://temp', 'w+');

        // BOM UTF-8: sin esto, Excel en Windows muestra tildes/ñ corruptas
        // al abrir el CSV directamente (problema real reportado con
        // exportaciones en español).
        fwrite($handle, "\xEF\xBB\xBF");

        fputcsv($handle, [$reporte->nombre]);
        fputcsv($handle, []);
        foreach ($datos['resumen'] as $indicador => $valor) {
            fputcsv($handle, [$indicador, $valor]);
        }
        fputcsv($handle, []);
        fputcsv($handle, [$datos['detalle_titulo'] ?? 'Detalle']);
        fputcsv($handle, $datos['detalle_columnas'] ?? []);
        foreach ($datos['detalle'] as $fila) {
            fputcsv($handle, $fila);
        }

        rewind($handle);
        $contenido = stream_get_contents($handle);
        fclose($handle);

        Storage::disk('local')->put($path, $contenido);

        return $path;
    }

    protected function generarExcel(array $datos, Reporte $reporte): string
    {
        $path = $this->nombreArchivo($reporte, 'xlsx');

        \Maatwebsite\Excel\Facades\Excel::store(
            new \App\Exports\ReporteExport($datos),
            $path,
            'local'
        );

        return $path;
    }
}
