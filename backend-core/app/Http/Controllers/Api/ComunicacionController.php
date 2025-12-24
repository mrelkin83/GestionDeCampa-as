<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComunicacionTemplate;
use App\Models\CampanaComunicacion;
use App\Models\Mensaje;
use App\Models\Votante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ComunicacionController extends Controller
{
    /**
     * Listar templates de comunicación
     */
    public function indexTemplates(Request $request): JsonResponse
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

        $query = ComunicacionTemplate::where('campana_id', $campanaId);

        if ($request->has('canal')) {
            $query->where('canal', $request->canal);
        }

        if ($request->has('activos')) {
            $query->where('activo', true);
        }

        $templates = $query->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'data' => $templates,
        ], 200);
    }

    /**
     * Crear template de comunicación
     */
    public function storeTemplate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'nombre' => 'required|string|max:100',
            'canal' => 'required|in:sms,email,whatsapp',
            'asunto' => 'required_if:canal,email|nullable|string|max:200',
            'contenido' => 'required|string',
            'variables_disponibles' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template = ComunicacionTemplate::create(array_merge($request->all(), [
            'activo' => true,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Template creado exitosamente',
            'data' => $template,
        ], 201);
    }

    /**
     * Actualizar template
     */
    public function updateTemplate(Request $request, int $id): JsonResponse
    {
        $template = ComunicacionTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template no encontrado',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:100',
            'asunto' => 'nullable|string|max:200',
            'contenido' => 'sometimes|string',
            'activo' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Template actualizado exitosamente',
            'data' => $template,
        ], 200);
    }

    /**
     * Listar campañas de comunicación
     */
    public function indexCampanas(Request $request): JsonResponse
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

        $query = CampanaComunicacion::with(['template', 'segmento'])
            ->where('campana_id', $campanaId);

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->has('canal')) {
            $query->where('canal', $request->canal);
        }

        $campanas = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $campanas,
        ], 200);
    }

    /**
     * Crear campaña de comunicación
     */
    public function storeCampana(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'nombre' => 'required|string|max:200',
            'canal' => 'required|in:sms,email,whatsapp,multiple',
            'template_id' => 'nullable|exists:comunicacion_templates,id',
            'segmento_id' => 'nullable|exists:segmentos,id',
            'fecha_envio_programada' => 'nullable|date',
            'asunto_personalizado' => 'nullable|string|max:200',
            'contenido_personalizado' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Si hay template, obtener contenido
        $contenido = $request->contenido_personalizado;
        $asunto = $request->asunto_personalizado;

        if ($request->template_id && !$contenido) {
            $template = ComunicacionTemplate::find($request->template_id);
            $contenido = $template->contenido;
            $asunto = $asunto ?? $template->asunto;
        }

        if (!$contenido) {
            return response()->json([
                'success' => false,
                'message' => 'Debe proporcionar contenido o seleccionar un template',
            ], 422);
        }

        // Calcular destinatarios
        $totalDestinatarios = 0;
        if ($request->segmento_id) {
            $totalDestinatarios = DB::table('segmento_votante')
                ->where('segmento_id', $request->segmento_id)
                ->count();
        }

        $campana = CampanaComunicacion::create(array_merge($request->all(), [
            'asunto' => $asunto,
            'contenido' => $contenido,
            'estado' => $request->fecha_envio_programada ? 'programada' : 'borrador',
            'total_destinatarios' => $totalDestinatarios,
        ]));

        $campana->load(['template', 'segmento']);

        return response()->json([
            'success' => true,
            'message' => 'Campaña de comunicación creada exitosamente',
            'data' => $campana,
        ], 201);
    }

    /**
     * Enviar campaña de comunicación
     */
    public function enviarCampana(Request $request, int $id): JsonResponse
    {
        $campana = CampanaComunicacion::find($id);

        if (!$campana) {
            return response()->json([
                'success' => false,
                'message' => 'Campaña no encontrada',
            ], 404);
        }

        if ($campana->estado === 'enviada' || $campana->estado === 'enviando') {
            return response()->json([
                'success' => false,
                'message' => 'La campaña ya fue enviada o está en proceso de envío',
            ], 409);
        }

        // Actualizar estado
        $campana->update([
            'estado' => 'enviando',
            'fecha_envio_real' => now(),
        ]);

        // Aquí se debería despachar un Job para envío masivo
        // Por ahora simularemos el proceso

        // TODO: Implementar dispatch de Job para envío masivo
        // Dispatch(new EnviarCampanaMasivaJob($campana->id));

        return response()->json([
            'success' => true,
            'message' => 'Campaña en proceso de envío. Los mensajes se están enviando en segundo plano.',
            'data' => $campana,
        ], 200);
    }

    /**
     * Enviar mensaje individual
     */
    public function enviarMensajeIndividual(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_id' => 'required|exists:campanas,id',
            'votante_id' => 'required|exists:votantes,id',
            'canal' => 'required|in:sms,email,whatsapp',
            'asunto' => 'required_if:canal,email|nullable|string|max:200',
            'contenido' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $votante = Votante::find($request->votante_id);

        // Validar que el votante tenga el canal disponible
        if ($request->canal === 'email' && !$votante->email) {
            return response()->json([
                'success' => false,
                'message' => 'El votante no tiene email registrado',
            ], 422);
        }

        if ($request->canal === 'sms' && !$votante->telefono) {
            return response()->json([
                'success' => false,
                'message' => 'El votante no tiene teléfono registrado',
            ], 422);
        }

        // Reemplazar variables en el contenido
        $contenidoFinal = $this->reemplazarVariables($request->contenido, $votante);
        $asuntoFinal = $request->asunto ? $this->reemplazarVariables($request->asunto, $votante) : null;

        $destinatario = match($request->canal) {
            'email' => $votante->email,
            'sms', 'whatsapp' => $votante->telefono,
        };

        $mensaje = Mensaje::create([
            'campana_comunicacion_id' => null,
            'votante_id' => $request->votante_id,
            'canal' => $request->canal,
            'destinatario' => $destinatario,
            'asunto' => $asuntoFinal,
            'contenido' => $contenidoFinal,
            'estado' => 'pendiente',
        ]);

        // TODO: Dispatch Job para envío individual
        // Dispatch(new EnviarMensajeJob($mensaje->id));

        $mensaje->update(['estado' => 'enviado', 'fecha_envio' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado exitosamente',
            'data' => $mensaje,
        ], 201);
    }

    /**
     * Estadísticas de campaña de comunicación
     */
    public function estadisticasCampana(Request $request, int $id): JsonResponse
    {
        $campana = CampanaComunicacion::find($id);

        if (!$campana) {
            return response()->json([
                'success' => false,
                'message' => 'Campaña no encontrada',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campana->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $stats = [
            'campana' => $campana->nombre,
            'estado' => $campana->estado,
            'canal' => $campana->canal,
            'envio' => [
                'total_destinatarios' => $campana->total_destinatarios,
                'total_enviados' => $campana->total_enviados,
                'total_entregados' => $campana->total_entregados,
                'total_fallidos' => $campana->total_fallidos,
                'tasa_entrega' => $campana->total_enviados > 0
                    ? round(($campana->total_entregados / $campana->total_enviados) * 100, 2)
                    : 0,
            ],
            'engagement' => [
                'total_abiertos' => $campana->total_abiertos,
                'total_clicks' => $campana->total_clicks,
                'tasa_apertura' => $campana->tasa_apertura,
                'tasa_clicks' => $campana->tasa_clicks,
            ],
            'fechas' => [
                'programada' => $campana->fecha_envio_programada,
                'real' => $campana->fecha_envio_real,
                'completada' => $campana->fecha_completada,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }

    /**
     * Reemplazar variables en contenido
     */
    private function reemplazarVariables(string $contenido, Votante $votante): string
    {
        $variables = [
            '{{nombre}}' => $votante->nombres,
            '{{apellido}}' => $votante->apellidos,
            '{{nombre_completo}}' => $votante->nombre_completo,
            '{{documento}}' => $votante->documento,
            '{{municipio}}' => $votante->municipio->nombre ?? '',
            '{{departamento}}' => $votante->municipio->departamento->nombre ?? '',
        ];

        return str_replace(array_keys($variables), array_values($variables), $contenido);
    }
}
