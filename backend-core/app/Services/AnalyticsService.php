<?php

namespace App\Services;

use App\Models\CampanaComunicacion;
use App\Models\Donacion;
use App\Models\Donante;
use App\Models\Evento;
use App\Models\Gasto;
use App\Models\Mensaje;
use App\Models\Segmento;
use App\Models\Votante;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Calcula los datos reales de /api/analytics/*. Antes de este servicio,
 * AnalyticsDashboard.tsx/AnalyticsFinanciero.tsx/AnalyticsVotantes.tsx
 * (frontend-web) llamaban a estos endpoints desde su lanzamiento, pero
 * ninguno existía en backend-core -toda la sección de Analytics estaba
 * permanentemente en el spinner de carga (mismo patrón que Reportes).
 */
class AnalyticsService
{
    public function general(int $campanaId, array $filtros): array
    {
        $votantes = $this->votantes($campanaId, $filtros);
        $financiero = $this->financiero($campanaId, $filtros);
        $comunicacion = $this->comunicacion($campanaId, $filtros);
        $eventos = $this->eventos($campanaId, $filtros);

        return [
            'votantes' => $votantes,
            'financiero' => $financiero,
            'comunicacion' => $comunicacion,
            'eventos' => $eventos,
            'resumen_ejecutivo' => [
                'base_votantes' => $this->comparativa(
                    fn (Carbon $d, Carbon $h) => Votante::where('campana_id', $campanaId)
                        ->whereBetween('created_at', [$d, $h])->count(),
                    $filtros
                ),
                'recaudacion' => $this->comparativa(
                    fn (Carbon $d, Carbon $h) => (float) Donacion::where('campana_id', $campanaId)
                        ->confirmadas()
                        ->whereBetween('fecha_donacion', [$d, $h])
                        ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)')),
                    $filtros
                ),
                'alcance_comunicacion' => $this->comparativa(
                    fn (Carbon $d, Carbon $h) => Mensaje::whereHas(
                        'campanaComunicacion',
                        fn (Builder $q) => $q->where('campana_id', $campanaId)
                    )->whereBetween('fecha_envio', [$d, $h])->distinct('destinatario')->count('destinatario'),
                    $filtros
                ),
                'participacion_eventos' => $this->comparativa(
                    fn (Carbon $d, Carbon $h) => (float) (Evento::where('campana_id', $campanaId)
                        ->where('meta_asistentes', '>', 0)
                        ->whereBetween('fecha_inicio', [$d, $h])
                        ->avg(DB::raw('total_asistentes::float / NULLIF(meta_asistentes, 0) * 100')) ?? 0),
                    $filtros
                ),
            ],
        ];
    }

    public function votantes(int $campanaId, array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);
        // 'votantes.created_at' calificado: distribucion_por_departamento hace
        // JOIN con municipios/departamentos, que también tienen created_at
        // -sin calificar, Postgres rechaza la columna por ambigua.
        $query = Votante::where('campana_id', $campanaId)->whereBetween('votantes.created_at', [$desde, $hasta]);

        $total = (clone $query)->count();

        $nuevosMesActual = Votante::where('campana_id', $campanaId)
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        $tasaCrecimiento = $this->comparativa(
            fn (Carbon $d, Carbon $h) => Votante::where('campana_id', $campanaId)
                ->whereBetween('created_at', [$d, $h])->count(),
            ['fecha_inicio' => now()->startOfMonth()->toDateString(), 'fecha_fin' => now()->toDateString()]
        );

        $porDepartamento = (clone $query)
            ->join('municipios', 'votantes.municipio_id', '=', 'municipios.id')
            ->join('departamentos', 'municipios.departamento_id', '=', 'departamentos.id')
            ->select('departamentos.nombre', DB::raw('count(*) as total'))
            ->groupBy('departamentos.nombre')
            ->orderByDesc('total')
            ->get();

        $porGenero = (clone $query)
            ->select('genero', DB::raw('count(*) as total'))
            ->groupBy('genero')
            ->get();

        $rangosEdad = ['18-25' => [18, 25], '26-35' => [26, 35], '36-45' => [36, 45], '46-60' => [46, 60], '60+' => [61, 130]];
        $distribucionEdad = [];
        foreach ($rangosEdad as $etiqueta => [$min, $max]) {
            $cantidad = (clone $query)->whereBetween('edad', [$min, $max])->count();
            $distribucionEdad[] = $this->itemDistribucion($etiqueta, $cantidad, $total);
        }

        $segmentos = Segmento::where('campana_id', $campanaId)
            ->orderByDesc('total_votantes')
            ->limit(8)
            ->get();
        $totalParaSegmentos = max($total, 1);

        return [
            'total_votantes' => $total,
            'nuevos_mes_actual' => $nuevosMesActual,
            'tasa_crecimiento' => $tasaCrecimiento,
            'distribucion_por_departamento' => $porDepartamento
                ->map(fn ($d) => $this->itemDistribucion($d->nombre, $d->total, $porDepartamento->sum('total')))
                ->toArray(),
            'distribucion_por_genero' => $porGenero
                ->map(fn ($g) => $this->itemDistribucion($this->etiquetaGenero($g->genero), $g->total, $total))
                ->toArray(),
            'distribucion_por_rango_edad' => $distribucionEdad,
            'evolucion_mensual' => $this->serieMensual(
                fn (Carbon $d, Carbon $h) => Votante::where('campana_id', $campanaId)
                    ->whereBetween('created_at', [$d, $h])->count(),
                $desde,
                $hasta
            ),
            'segmentos_mas_grandes' => $segmentos->map(fn (Segmento $s) => [
                'segmento_id' => $s->id,
                'nombre' => $s->nombre,
                'total_votantes' => $s->total_votantes,
                'porcentaje' => round($s->total_votantes / $totalParaSegmentos * 100, 1),
            ])->toArray(),
        ];
    }

    public function financiero(int $campanaId, array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);

        // 'aprobado','pagado','reportado_cne' representan dinero ya comprometido
        // por la campaña -a diferencia de Gasto::scopeAprobados() (solo
        // 'aprobado'), usado para el tope legal, aquí interesa el total real
        // gastado sin importar si ya se registró el pago o el reporte al CNE.
        $estadosGastoComprometido = ['aprobado', 'pagado', 'reportado_cne'];

        $totalIngresos = (float) Donacion::where('campana_id', $campanaId)->confirmadas()
            ->whereBetween('fecha_donacion', [$desde, $hasta])
            ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)'));

        $totalEgresos = (float) Gasto::where('campana_id', $campanaId)
            ->whereIn('estado', $estadosGastoComprometido)
            ->whereBetween('fecha_gasto', [$desde, $hasta])
            ->sum('monto');

        $ingresosPorMes = $this->serieMensual(
            fn (Carbon $d, Carbon $h) => (float) Donacion::where('campana_id', $campanaId)->confirmadas()
                ->whereBetween('fecha_donacion', [$d, $h])
                ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)')),
            $desde,
            $hasta
        );
        $egresosPorMes = $this->serieMensual(
            fn (Carbon $d, Carbon $h) => (float) Gasto::where('campana_id', $campanaId)
                ->whereIn('estado', $estadosGastoComprometido)
                ->whereBetween('fecha_gasto', [$d, $h])
                ->sum('monto'),
            $desde,
            $hasta
        );

        $balanceAcumulado = [];
        $acumulado = 0.0;
        foreach ($ingresosPorMes as $i => $mes) {
            $acumulado += $mes['valor'] - ($egresosPorMes[$i]['valor'] ?? 0);
            $balanceAcumulado[] = ['fecha' => $mes['fecha'], 'valor' => round($acumulado, 2)];
        }

        // Burn rate: promedio de egresos de los últimos 3 meses de la serie.
        $ultimosMeses = array_slice($egresosPorMes, -3);
        $tasaQuemado = count($ultimosMeses) > 0
            ? array_sum(array_column($ultimosMeses, 'valor')) / count($ultimosMeses)
            : 0.0;

        $balanceActual = $totalIngresos - $totalEgresos;
        $proyeccionAgotamiento = ($tasaQuemado > 0 && $balanceActual > 0)
            ? now()->addMonths((int) ceil($balanceActual / $tasaQuemado))->toDateString()
            : null;

        $donacionesPorTipo = Donacion::where('campana_id', $campanaId)->confirmadas()
            ->whereBetween('fecha_donacion', [$desde, $hasta])
            ->select('tipo', DB::raw('sum(COALESCE(valor_estimado_especie, monto)) as total'))
            ->groupBy('tipo')
            ->get();

        $gastosPorCategoria = Gasto::where('campana_id', $campanaId)
            ->whereIn('estado', $estadosGastoComprometido)
            ->whereBetween('fecha_gasto', [$desde, $hasta])
            ->select('categoria', DB::raw('sum(monto) as total'))
            ->groupBy('categoria')
            ->orderByDesc('total')
            ->get();

        $topDonantes = Donante::where('campana_id', $campanaId)
            ->where('total_donado', '>', 0)
            ->orderByDesc('total_donado')
            ->limit(10)
            ->get();

        return [
            'total_ingresos' => $totalIngresos,
            'total_egresos' => $totalEgresos,
            'balance_actual' => $balanceActual,
            'tasa_quemado' => round($tasaQuemado, 2),
            'proyeccion_agotamiento' => $proyeccionAgotamiento,
            'ingresos_por_mes' => $ingresosPorMes,
            'egresos_por_mes' => $egresosPorMes,
            'balance_acumulado' => $balanceAcumulado,
            'donaciones_por_tipo' => $donacionesPorTipo
                ->map(fn ($d) => $this->itemDistribucion(ucfirst($d->tipo), (float) $d->total, $donacionesPorTipo->sum('total')))
                ->toArray(),
            'gastos_por_categoria' => $gastosPorCategoria
                ->map(fn ($g) => $this->itemDistribucion(ucfirst($g->categoria), (float) $g->total, $gastosPorCategoria->sum('total')))
                ->toArray(),
            'top_donantes' => $topDonantes->map(fn (Donante $d) => [
                'donante_id' => $d->id,
                'nombre' => $d->tipo === 'persona_natural' ? trim("{$d->nombres} {$d->apellidos}") : $d->razon_social,
                'total_donado' => (float) $d->total_donado,
                'numero_donaciones' => $d->numero_donaciones,
            ])->toArray(),
            'gastos_pendientes_pago' => Gasto::where('campana_id', $campanaId)->where('estado', 'aprobado')->count(),
            'donaciones_por_confirmar' => Donacion::where('campana_id', $campanaId)->where('estado', 'pendiente')->count(),
        ];
    }

    public function comunicacion(int $campanaId, array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);
        $query = Mensaje::whereHas('campanaComunicacion', fn (Builder $q) => $q->where('campana_id', $campanaId))
            ->whereBetween('fecha_envio', [$desde, $hasta]);

        $total = (clone $query)->count();
        // 'estado' en mensajes solo llega hasta 'entregado'/'fallido'/'rebotado'
        // (ver migración); apertura/click se registran en fecha_apertura/
        // fecha_click, no como valores de estado adicionales.
        $entregados = (clone $query)->whereNotNull('fecha_entrega')->count();
        $abiertos = (clone $query)->whereNotNull('fecha_apertura')->count();

        $porCanal = (clone $query)->select('canal', DB::raw('count(*) as total'))->groupBy('canal')->get();

        return [
            'total_mensajes_enviados' => $total,
            'total_destinatarios_unicos' => (clone $query)->distinct('destinatario')->count('destinatario'),
            'tasa_entrega_promedio' => $total > 0 ? round($entregados / $total * 100, 1) : 0,
            'tasa_apertura_promedio' => $total > 0 ? round($abiertos / $total * 100, 1) : 0,
            'mensajes_por_canal' => $porCanal
                ->map(fn ($c) => $this->itemDistribucion(ucfirst($c->canal), $c->total, $porCanal->sum('total')))
                ->toArray(),
            'mensajes_por_mes' => $this->serieMensual(
                fn (Carbon $d, Carbon $h) => Mensaje::whereHas(
                    'campanaComunicacion',
                    fn (Builder $q) => $q->where('campana_id', $campanaId)
                )->whereBetween('fecha_envio', [$d, $h])->count(),
                $desde,
                $hasta
            ),
            'campanas_activas' => CampanaComunicacion::where('campana_id', $campanaId)->where('estado', 'enviando')->count(),
            'campanas_completadas' => CampanaComunicacion::where('campana_id', $campanaId)->where('estado', 'completada')->count(),
            // Requiere vincular segmento_id -> votante -> mensaje, relación que
            // no existe hoy (CampanaComunicacion apunta a un segmento, pero
            // Mensaje no guarda de qué campaña de comunicación salió cada
            // envío agrupado por ese segmento de forma consultable). Se deja
            // vacío en vez de simular cifras.
            'rendimiento_por_segmento' => [],
        ];
    }

    public function eventos(int $campanaId, array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);
        $query = Evento::where('campana_id', $campanaId)->whereBetween('fecha_inicio', [$desde, $hasta]);

        $total = (clone $query)->count();

        $conMeta = (clone $query)->where('meta_asistentes', '>', 0)->get(['total_asistentes', 'meta_asistentes']);
        $tasaAsistenciaPromedio = $conMeta->count() > 0
            ? round($conMeta->avg(fn ($e) => $e->total_asistentes / $e->meta_asistentes * 100), 1)
            : 0.0;

        $porTipo = (clone $query)->select('tipo', DB::raw('count(*) as total'))->groupBy('tipo')->get();

        $asistenciaPorTipo = (clone $query)
            ->select('tipo', DB::raw('avg(total_asistentes) as promedio'), DB::raw('count(*) as total'))
            ->groupBy('tipo')
            ->get()
            ->map(fn ($t) => [
                'tipo' => $t->tipo,
                'promedio_asistentes' => round((float) $t->promedio, 1),
                'total_eventos' => $t->total,
            ])->toArray();

        $mayorAsistencia = (clone $query)
            ->orderByDesc('total_asistentes')
            ->limit(10)
            ->get()
            ->map(fn (Evento $e) => [
                'evento_id' => $e->id,
                'nombre' => $e->nombre,
                'fecha' => optional($e->fecha_inicio)->toDateString(),
                'total_asistentes' => $e->total_asistentes,
                'tasa_asistencia' => $e->meta_asistentes > 0 ? round($e->total_asistentes / $e->meta_asistentes * 100, 1) : 0,
            ])->toArray();

        return [
            'total_eventos' => $total,
            'eventos_proximos' => Evento::where('campana_id', $campanaId)->where('fecha_inicio', '>', now())->count(),
            'eventos_completados' => (clone $query)->where('estado', 'finalizado')->count(),
            'tasa_asistencia_promedio' => $tasaAsistenciaPromedio,
            'eventos_por_tipo' => $porTipo
                ->map(fn ($t) => $this->itemDistribucion(ucfirst($t->tipo), $t->total, $porTipo->sum('total')))
                ->toArray(),
            'eventos_por_mes' => $this->serieMensual(
                fn (Carbon $d, Carbon $h) => Evento::where('campana_id', $campanaId)
                    ->whereBetween('fecha_inicio', [$d, $h])->count(),
                $desde,
                $hasta
            ),
            'asistencia_promedio_por_tipo' => $asistenciaPorTipo,
            'eventos_mayor_asistencia' => $mayorAsistencia,
        ];
    }

    protected function rangoFechas(array $filtros): array
    {
        $hasta = !empty($filtros['fecha_fin']) ? Carbon::parse($filtros['fecha_fin'])->endOfDay() : now();
        $desde = !empty($filtros['fecha_inicio'])
            ? Carbon::parse($filtros['fecha_inicio'])->startOfDay()
            : $hasta->copy()->subMonths(3)->startOfDay();

        return [$desde, $hasta];
    }

    /**
     * Compara el resultado de $calcular() en el rango de $filtros contra un
     * período previo de la misma duración inmediatamente anterior.
     */
    protected function comparativa(callable $calcular, array $filtros): array
    {
        [$desde, $hasta] = $this->rangoFechas($filtros);
        $dias = $desde->diffInDays($hasta) + 1;
        $desdeAnterior = $desde->copy()->subDays($dias);
        $hastaAnterior = $desde->copy()->subSecond();

        $actual = (float) $calcular($desde, $hasta);
        $anterior = (float) $calcular($desdeAnterior, $hastaAnterior);

        $cambioAbsoluto = $actual - $anterior;
        $cambioPorcentual = $anterior > 0
            ? round($cambioAbsoluto / $anterior * 100, 1)
            : ($actual > 0 ? 100.0 : 0.0);

        return [
            'periodo_actual' => $actual,
            'periodo_anterior' => $anterior,
            'cambio_absoluto' => $cambioAbsoluto,
            'cambio_porcentual' => $cambioPorcentual,
            'tendencia' => $cambioAbsoluto > 0 ? 'subiendo' : ($cambioAbsoluto < 0 ? 'bajando' : 'estable'),
        ];
    }

    protected function serieMensual(callable $calcular, Carbon $desde, Carbon $hasta): array
    {
        $serie = [];
        $cursor = $desde->copy()->startOfMonth();
        $fin = $hasta->copy()->startOfMonth();

        while ($cursor <= $fin) {
            $serie[] = [
                'fecha' => $cursor->format('Y-m'),
                'valor' => (float) $calcular($cursor->copy()->startOfMonth(), $cursor->copy()->endOfMonth()),
            ];
            $cursor->addMonth();
        }

        return $serie;
    }

    protected function itemDistribucion(string $nombre, float $valor, float $total): array
    {
        return [
            'nombre' => $nombre,
            'valor' => $valor,
            'porcentaje' => $total > 0 ? round($valor / $total * 100, 1) : 0,
        ];
    }

    protected function etiquetaGenero(?string $genero): string
    {
        return match ($genero) {
            'M' => 'Masculino',
            'F' => 'Femenino',
            default => 'Otro',
        };
    }
}
