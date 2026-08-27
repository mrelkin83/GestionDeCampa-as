<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donacion;
use App\Models\Donante;
use App\Models\TopeLegal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class DonacionController extends Controller
{
    /**
     * Listar donaciones de una campaña
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $campanaId = $request->get('campana_id');

        if (!$campanaId) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar campana_id',
            ], 400);
        }

        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campanaId)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $query = Donacion::with(['donante.municipio', 'registradoPor'])
            ->where('campana_id', $campanaId);

        // Filtros
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('pendientes_reporte')) {
            $query->pendientesReporte();
        }

        if ($request->has('desde')) {
            $query->where('fecha_donacion', '>=', $request->desde);
        }

        if ($request->has('hasta')) {
            $query->where('fecha_donacion', '<=', $request->hasta);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_donacion');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $donaciones = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $donaciones->items(),
            'pagination' => [
                'total' => $donaciones->total(),
                'per_page' => $donaciones->perPage(),
                'current_page' => $donaciones->currentPage(),
                'last_page' => $donaciones->lastPage(),
            ],
        ], 200);
    }

    /**
     * Registrar nueva donación
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'donante_id' => 'required|exists:donantes,id',
            'monto' => 'required|numeric|min:0',
            'moneda' => 'required|in:COP,USD',
            'tipo' => 'required|in:efectivo,transferencia,cheque,especie,servicio',
            'fecha_donacion' => 'required|date',
            'concepto' => 'nullable|string|max:255',
            'numero_comprobante' => 'nullable|string|max:100',
            'descripcion_especie' => 'required_if:tipo,especie,servicio|string|max:500',
            'valor_estimado_especie' => 'required_if:tipo,especie,servicio|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        // Sin este chequeo, cualquier usuario con acceso a UNA campaña podía
        // registrar donaciones en CUALQUIER otra solo enviando su campana_id.
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $donante = Donante::find($request->donante_id);

        // 'exists:donantes,id' solo comprueba que el donante exista en
        // alguna campaña, no en ESTA -sin este chequeo se podía registrar
        // una donación en la campaña A citando un donante de la campaña B,
        // mezclando historiales y topes legales entre campañas distintas.
        if (!$donante || (int) $donante->campana_id !== (int) $request->campana_id) {
            return response()->json([
                'success' => false,
                'message' => 'El donante no pertenece a esta campaña',
            ], 422);
        }

        // Validar tope individual
        $topeLegal = TopeLegal::where('campana_id', $request->campana_id)->first();

        $montoActual = $request->tipo === 'especie' || $request->tipo === 'servicio'
            ? $request->valor_estimado_especie
            : $request->monto;

        $totalDonante = Donacion::where('donante_id', $request->donante_id)
            ->where('campana_id', $request->campana_id)
            ->confirmadas()
            ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)'));

        $nuevoTotal = $totalDonante + $montoActual;
        $excedeTopeIndividual = false;
        $requiereValidacion = false;

        if ($topeLegal) {
            $limiteIndividual = $topeLegal->tope_donaciones_individuales;
            if ($nuevoTotal > $limiteIndividual) {
                $excedeTopeIndividual = true;
                $requiereValidacion = true;
            }
        }

        DB::beginTransaction();

        try {
            // Solo los campos validados arriba -pasar $request->all() permitía
            // fijar directamente reportada_cne/fecha_reporte_cne/
            // numero_reporte_cne (todos fillable, sin cubrir por la
            // validación), dejando crear una donación ya marcada como
            // "reportada al CNE" sin pasar nunca por reportarCNE() (que
            // exige que esté 'confirmada' primero) -una vía de falsificar
            // cumplimiento legal.
            $donacion = Donacion::create(array_merge($validator->validated(), [
                'registrado_por_id' => $request->user()->id,
                'fecha_registro' => now(),
                'estado' => 'pendiente',
                'excede_tope_individual' => $excedeTopeIndividual,
                'requiere_validacion' => $requiereValidacion,
                'observaciones_validacion' => $excedeTopeIndividual
                    ? "La donación excede el tope individual de $" . number_format($topeLegal->tope_donaciones_individuales ?? 0, 0)
                    : null,
            ]));

            // Actualizar totales del donante
            $donante->numero_donaciones = $donante->donaciones()->confirmadas()->count();
            $donante->total_donado = $donante->donaciones()->confirmadas()
                ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)'));

            if (!$donante->fecha_primera_donacion) {
                $donante->fecha_primera_donacion = $request->fecha_donacion;
            }
            $donante->fecha_ultima_donacion = $request->fecha_donacion;
            $donante->save();

            // No se recalculan aquí las alertas de topes legales: la donación
            // queda 'pendiente' y Donacion::confirmadas() no la cuenta todavía,
            // así que hacerlo en este punto solo repetía el total previo sin
            // reflejar nada nuevo. El recálculo real ocurre en confirmar(),
            // que es cuando la donación empieza a contar de verdad.

            DB::commit();

            $donacion->load(['donante.municipio', 'registradoPor']);

            return response()->json([
                'success' => true,
                'message' => $requiereValidacion
                    ? 'Donación registrada pero requiere validación por exceder tope individual'
                    : 'Donación registrada exitosamente',
                'data' => $donacion,
                'warnings' => $excedeTopeIndividual ? ['excede_tope_individual' => true] : [],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar donación: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ver donación específica
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $donacion = Donacion::with([
            'donante.municipio.departamento',
            'registradoPor',
            'campana',
        ])->find($id);

        if (!$donacion) {
            return response()->json([
                'success' => false,
                'message' => 'Donación no encontrada',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donacion->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta donación',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $donacion,
        ], 200);
    }

    /**
     * Confirmar donación (cambiar estado a confirmada)
     */
    public function confirmar(Request $request, int $id): JsonResponse
    {
        $donacion = Donacion::find($id);

        if (!$donacion) {
            return response()->json([
                'success' => false,
                'message' => 'Donación no encontrada',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donacion->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta donación',
            ], 403);
        }

        if ($donacion->estado === 'confirmada') {
            return response()->json([
                'success' => false,
                'message' => 'La donación ya está confirmada',
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'numero_comprobante' => 'required|string|max:100',
            'recibo_url' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $donacion->update([
            'estado' => 'confirmada',
            'numero_comprobante' => $request->numero_comprobante,
            'recibo_url' => $request->recibo_url,
        ]);

        // Antes solo se recalculaba en store(), cuando la donación seguía
        // 'pendiente' y por tanto Donacion::confirmadas() ni siquiera la
        // contaba -era un recálculo del mismo total viejo, sin efecto real.
        // El total/porcentaje de topes legales solo debe cambiar cuando la
        // donación empieza a contar de verdad: al confirmarse (mismo punto
        // del ciclo de vida que GastoController::aprobar()).
        $topeLegal = TopeLegal::where('campana_id', $donacion->campana_id)->first();
        if ($topeLegal) {
            $this->actualizarAlertas($topeLegal, $donacion->campana_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donación confirmada exitosamente',
            'data' => $donacion->load(['donante', 'registradoPor']),
        ], 200);
    }

    /**
     * Rechazar donación
     */
    public function rechazar(Request $request, int $id): JsonResponse
    {
        $donacion = Donacion::find($id);

        if (!$donacion) {
            return response()->json([
                'success' => false,
                'message' => 'Donación no encontrada',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donacion->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta donación',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'motivo' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar el motivo del rechazo',
                'errors' => $validator->errors(),
            ], 422);
        }

        $donacion->update([
            'estado' => 'rechazada',
            'notas' => $request->motivo,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donación rechazada',
            'data' => $donacion,
        ], 200);
    }

    /**
     * Marcar como reportada al CNE
     */
    public function reportarCNE(Request $request, int $id): JsonResponse
    {
        $donacion = Donacion::find($id);

        if (!$donacion) {
            return response()->json([
                'success' => false,
                'message' => 'Donación no encontrada',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($donacion->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta donación',
            ], 403);
        }

        if ($donacion->estado !== 'confirmada') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden reportar donaciones confirmadas',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'numero_reporte_cne' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $donacion->update([
            'reportada_cne' => true,
            'fecha_reporte_cne' => now(),
            'numero_reporte_cne' => $request->numero_reporte_cne,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Donación marcada como reportada al CNE',
            'data' => $donacion,
        ], 200);
    }

    /**
     * Estadísticas de donaciones
     */
    public function estadisticas(Request $request): JsonResponse
    {
        $campanaId = $request->get('campana_id');

        if (!$campanaId) {
            return response()->json([
                'success' => false,
                'message' => 'Debe especificar campana_id',
            ], 400);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campanaId)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $topeLegal = TopeLegal::where('campana_id', $campanaId)->first();

        $totalDonaciones = Donacion::where('campana_id', $campanaId)
            ->confirmadas()
            ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)'));

        $numeroDonaciones = Donacion::where('campana_id', $campanaId)
            ->confirmadas()
            ->count();

        $donacionesEfectivo = Donacion::where('campana_id', $campanaId)
            ->confirmadas()
            ->where('tipo', 'efectivo')
            ->sum('monto');

        $donacionesEspecie = Donacion::where('campana_id', $campanaId)
            ->confirmadas()
            ->whereIn('tipo', ['especie', 'servicio'])
            ->sum('valor_estimado_especie');

        $pendientesReporte = Donacion::where('campana_id', $campanaId)
            ->pendientesReporte()
            ->count();

        $stats = [
            'resumen' => [
                'total_recaudado' => $totalDonaciones,
                'numero_donaciones' => $numeroDonaciones,
                'promedio_donacion' => $numeroDonaciones > 0 ? round($totalDonaciones / $numeroDonaciones, 2) : 0,
                'efectivo' => $donacionesEfectivo,
                'especie' => $donacionesEspecie,
            ],
            'topes_legales' => $topeLegal ? [
                'limite_total' => $topeLegal->tope_donaciones_individuales,
                'recaudado' => $totalDonaciones,
                'disponible' => $topeLegal->tope_donaciones_individuales - $totalDonaciones,
                'porcentaje_usado' => round(($totalDonaciones / $topeLegal->tope_donaciones_individuales) * 100, 2),
                'alerta_80' => $topeLegal->alerta_80_porciento,
                'alerta_90' => $topeLegal->alerta_90_porciento,
                'limite_excedido' => $topeLegal->alerta_excedido,
            ] : null,
            'cumplimiento' => [
                'pendientes_reporte_cne' => $pendientesReporte,
                'reportadas_cne' => Donacion::where('campana_id', $campanaId)
                    ->where('reportada_cne', true)
                    ->count(),
            ],
            'por_tipo' => Donacion::where('campana_id', $campanaId)
                ->confirmadas()
                ->selectRaw('tipo, COUNT(*) as cantidad, SUM(COALESCE(valor_estimado_especie, monto)) as total')
                ->groupBy('tipo')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }

    /**
     * Actualizar alertas de topes legales
     */
    private function actualizarAlertas(TopeLegal $topeLegal, int $campanaId): void
    {
        $totalDonaciones = Donacion::where('campana_id', $campanaId)
            ->confirmadas()
            ->sum(DB::raw('COALESCE(valor_estimado_especie, monto)'));

        $porcentaje = ($totalDonaciones / $topeLegal->tope_donaciones_individuales) * 100;

        $topeLegal->update([
            'total_donaciones_actual' => $totalDonaciones,
            'porcentaje_tope_donaciones' => round($porcentaje, 2),
            'alerta_80_porciento' => $porcentaje >= 80,
            'alerta_90_porciento' => $porcentaje >= 90,
            'alerta_excedido' => $totalDonaciones > $topeLegal->tope_donaciones_individuales,
            'ultima_actualizacion' => now(),
        ]);
    }
}
