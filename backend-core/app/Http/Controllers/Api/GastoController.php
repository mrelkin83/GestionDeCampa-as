<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gasto;
use App\Models\TopeLegal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class GastoController extends Controller
{
    /**
     * Listar gastos de una campaña
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

        $query = Gasto::with(['responsable', 'aprobadoPor'])
            ->where('campana_id', $campanaId);

        // Filtros
        if ($request->has('categoria')) {
            $query->porCategoria($request->categoria);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('pendientes_aprobacion')) {
            $query->pendientesAprobacion();
        }

        if ($request->has('pendientes_reporte')) {
            $query->pendientesReporte();
        }

        if ($request->has('desde')) {
            $query->where('fecha_gasto', '>=', $request->desde);
        }

        if ($request->has('hasta')) {
            $query->where('fecha_gasto', '<=', $request->hasta);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_gasto');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 20);
        $gastos = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $gastos->items(),
            'pagination' => [
                'total' => $gastos->total(),
                'per_page' => $gastos->perPage(),
                'current_page' => $gastos->currentPage(),
                'last_page' => $gastos->lastPage(),
            ],
        ], 200);
    }

    /**
     * Registrar nuevo gasto
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'categoria' => 'required|in:publicidad,logistica,personal,eventos,materiales,servicios_profesionales,transporte,otro',
            'subcategoria' => 'nullable|string|max:100',
            'descripcion' => 'required|string|max:500',
            'monto' => 'required|numeric|min:0',
            'moneda' => 'required|in:COP,USD',
            'fecha_gasto' => 'required|date',
            'proveedor' => 'nullable|string|max:200',
            'nit_proveedor' => 'nullable|string|max:20',
            'numero_factura' => 'nullable|string|max:100',
            'metodo_pago' => 'nullable|in:efectivo,transferencia,cheque,tarjeta',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validar tope de gastos
        $topeLegal = TopeLegal::where('campana_id', $request->campana_id)->first();

        $totalGastos = Gasto::where('campana_id', $request->campana_id)
            ->aprobados()
            ->sum('monto');

        $nuevoTotal = $totalGastos + $request->monto;
        $requiereValidacion = false;

        if ($topeLegal && $nuevoTotal > $topeLegal->tope_gastos) {
            $requiereValidacion = true;
        }

        $gasto = Gasto::create(array_merge($request->all(), [
            'responsable_id' => $request->user()->id,
            'fecha_registro' => now(),
            'estado' => 'pendiente',
            'requiere_validacion' => $requiereValidacion,
            'observaciones_validacion' => $requiereValidacion
                ? "El gasto excedería el tope legal de gastos"
                : null,
        ]));

        $gasto->load(['responsable', 'aprobadoPor']);

        return response()->json([
            'success' => true,
            'message' => $requiereValidacion
                ? 'Gasto registrado pero requiere validación por exceder tope legal'
                : 'Gasto registrado exitosamente',
            'data' => $gasto,
            'warnings' => $requiereValidacion ? ['excede_tope_legal' => true] : [],
        ], 201);
    }

    /**
     * Ver gasto específico
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $gasto = Gasto::with([
            'responsable',
            'aprobadoPor',
            'campana',
        ])->find($id);

        if (!$gasto) {
            return response()->json([
                'success' => false,
                'message' => 'Gasto no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($gasto->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este gasto',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $gasto,
        ], 200);
    }

    /**
     * Actualizar gasto
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $gasto = Gasto::find($id);

        if (!$gasto) {
            return response()->json([
                'success' => false,
                'message' => 'Gasto no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($gasto->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este gasto',
            ], 403);
        }

        if ($gasto->estado === 'aprobado') {
            return response()->json([
                'success' => false,
                'message' => 'No se puede editar un gasto ya aprobado',
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'categoria' => 'sometimes|in:publicidad,logistica,personal,eventos,materiales,servicios_profesionales,transporte,otro',
            'subcategoria' => 'nullable|string|max:100',
            'descripcion' => 'sometimes|string|max:500',
            'monto' => 'sometimes|numeric|min:0',
            'moneda' => 'sometimes|in:COP,USD',
            'fecha_gasto' => 'sometimes|date',
            'proveedor' => 'nullable|string|max:200',
            'nit_proveedor' => 'nullable|string|max:20',
            'numero_factura' => 'nullable|string|max:100',
            'metodo_pago' => 'nullable|in:efectivo,transferencia,cheque,tarjeta',
            'cuenta_bancaria' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // update() solo debe aceptar los campos validados arriba -pasar
        // $request->all() permitía sobrescribir estado/campana_id/
        // responsable_id/aprobado_por_id/reportado_cne/etc. (todos
        // fillable en el modelo), dejando auto-aprobar o auto-reportar
        // al CNE un gasto propio sin pasar por aprobar()/reportarCNE().
        $gasto->update($validator->validated());
        $gasto->load(['responsable', 'aprobadoPor']);

        return response()->json([
            'success' => true,
            'message' => 'Gasto actualizado exitosamente',
            'data' => $gasto,
        ], 200);
    }

    /**
     * Aprobar gasto
     */
    public function aprobar(Request $request, int $id): JsonResponse
    {
        $gasto = Gasto::find($id);

        if (!$gasto) {
            return response()->json([
                'success' => false,
                'message' => 'Gasto no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($gasto->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este gasto',
            ], 403);
        }

        if ($gasto->estado === 'aprobado') {
            return response()->json([
                'success' => false,
                'message' => 'El gasto ya está aprobado',
            ], 409);
        }

        $gasto->update([
            'estado' => 'aprobado',
            'aprobado_por_id' => $request->user()->id,
            'fecha_aprobacion' => now(),
        ]);

        // Actualizar alertas de topes legales
        $this->actualizarAlertas($gasto->campana_id);

        return response()->json([
            'success' => true,
            'message' => 'Gasto aprobado exitosamente',
            'data' => $gasto->load(['responsable', 'aprobadoPor']),
        ], 200);
    }

    /**
     * Rechazar gasto
     */
    public function rechazar(Request $request, int $id): JsonResponse
    {
        $gasto = Gasto::find($id);

        if (!$gasto) {
            return response()->json([
                'success' => false,
                'message' => 'Gasto no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($gasto->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este gasto',
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

        $gasto->update([
            'estado' => 'rechazado',
            'notas_aprobacion' => $request->motivo,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gasto rechazado',
            'data' => $gasto,
        ], 200);
    }

    /**
     * Marcar gasto aprobado como pagado. El estado 'pagado' existe en el
     * esquema desde el inicio pero no tenía ninguna acción que lo alcanzara
     * -update() bloquea cualquier edición una vez aprobado ("No se puede
     * editar un gasto ya aprobado"), así que un gasto nunca podía llegar a
     * 'pagado' por ningún camino.
     */
    public function pagar(Request $request, int $id): JsonResponse
    {
        $gasto = Gasto::find($id);

        if (!$gasto) {
            return response()->json([
                'success' => false,
                'message' => 'Gasto no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($gasto->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este gasto',
            ], 403);
        }

        if ($gasto->estado !== 'aprobado') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden marcar como pagados los gastos aprobados',
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'numero_comprobante' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $gasto->update(array_filter([
            'estado' => 'pagado',
            'numero_comprobante' => $request->numero_comprobante,
        ], fn ($v) => $v !== null));

        return response()->json([
            'success' => true,
            'message' => 'Gasto marcado como pagado',
            'data' => $gasto,
        ], 200);
    }

    /**
     * Marcar como reportado al CNE
     */
    public function reportarCNE(Request $request, int $id): JsonResponse
    {
        $gasto = Gasto::find($id);

        if (!$gasto) {
            return response()->json([
                'success' => false,
                'message' => 'Gasto no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($gasto->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este gasto',
            ], 403);
        }

        if ($gasto->estado !== 'aprobado') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden reportar gastos aprobados',
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

        $gasto->update([
            'reportado_cne' => true,
            'fecha_reporte_cne' => now(),
            'numero_reporte_cne' => $request->numero_reporte_cne,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Gasto marcado como reportado al CNE',
            'data' => $gasto,
        ], 200);
    }

    /**
     * Estadísticas de gastos
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

        $totalGastos = Gasto::where('campana_id', $campanaId)
            ->aprobados()
            ->sum('monto');

        $numeroGastos = Gasto::where('campana_id', $campanaId)
            ->aprobados()
            ->count();

        $pendientesAprobacion = Gasto::where('campana_id', $campanaId)
            ->pendientesAprobacion()
            ->count();

        $pendientesReporte = Gasto::where('campana_id', $campanaId)
            ->pendientesReporte()
            ->count();

        $stats = [
            'resumen' => [
                'total_gastado' => $totalGastos,
                'numero_gastos' => $numeroGastos,
                'promedio_gasto' => $numeroGastos > 0 ? round($totalGastos / $numeroGastos, 2) : 0,
                'pendientes_aprobacion' => $pendientesAprobacion,
            ],
            'topes_legales' => $topeLegal ? [
                'limite_total' => $topeLegal->tope_gastos,
                'gastado' => $totalGastos,
                'disponible' => $topeLegal->tope_gastos - $totalGastos,
                'porcentaje_usado' => round(($totalGastos / $topeLegal->tope_gastos) * 100, 2),
                'alerta_80' => $topeLegal->alerta_80_porciento,
                'alerta_90' => $topeLegal->alerta_90_porciento,
                'limite_excedido' => $topeLegal->alerta_excedido,
            ] : null,
            'cumplimiento' => [
                'pendientes_reporte_cne' => $pendientesReporte,
                'reportados_cne' => Gasto::where('campana_id', $campanaId)
                    ->where('reportado_cne', true)
                    ->count(),
            ],
            'por_categoria' => Gasto::where('campana_id', $campanaId)
                ->aprobados()
                ->selectRaw('categoria, COUNT(*) as cantidad, SUM(monto) as total')
                ->groupBy('categoria')
                ->get(),
            'por_mes' => Gasto::where('campana_id', $campanaId)
                ->aprobados()
                ->selectRaw("DATE_TRUNC('month', fecha_gasto) as mes, SUM(monto) as total")
                ->groupBy('mes')
                ->orderBy('mes')
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
    private function actualizarAlertas(int $campanaId): void
    {
        $topeLegal = TopeLegal::where('campana_id', $campanaId)->first();

        if (!$topeLegal) {
            return;
        }

        $totalGastos = Gasto::where('campana_id', $campanaId)
            ->aprobados()
            ->sum('monto');

        $porcentaje = ($totalGastos / $topeLegal->tope_gastos) * 100;

        $topeLegal->update([
            'total_gastos_actual' => $totalGastos,
            'porcentaje_tope_gastos' => round($porcentaje, 2),
            'alerta_80_porciento' => $porcentaje >= 80,
            'alerta_90_porciento' => $porcentaje >= 90,
            'alerta_excedido' => $totalGastos > $topeLegal->tope_gastos,
            'ultima_actualizacion' => now(),
        ]);
    }
}
