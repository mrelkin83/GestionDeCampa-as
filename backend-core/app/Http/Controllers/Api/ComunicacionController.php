<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ComunicacionTemplate;
use App\Models\CampanaComunicacion;
use App\Models\Mensaje;
use App\Models\Votante;
use App\Jobs\EnviarCampanaMasivaJob;
use App\Jobs\EnviarMensajeJob;
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

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $template = ComunicacionTemplate::create(array_merge($request->all(), [
            'created_by_id' => $user->id,
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

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($template->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este template',
            ], 403);
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

        // Solo campos validados arriba -pasar $request->all() permitía
        // reescribir campana_id/created_by_id/veces_usado/ultima_vez_usado
        // (todos fillable).
        $template->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Template actualizado exitosamente',
            'data' => $template,
        ], 200);
    }

    /**
     * Ver template de comunicación
     */
    public function showTemplate(Request $request, int $id): JsonResponse
    {
        $template = ComunicacionTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($template->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este template',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $template,
        ], 200);
    }

    /**
     * Eliminar template de comunicación
     */
    public function destroyTemplate(Request $request, int $id): JsonResponse
    {
        $template = ComunicacionTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($template->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este template',
            ], 403);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template eliminado exitosamente',
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
            // 'multiple' se quitó: el canal siempre se deriva del template
            // seleccionado en el frontend (nunca puede ser 'multiple', ya
            // que la creación de templates tampoco lo permite), y
            // EnviarCampanaMasivaJob no tiene ningún caso para ese valor en
            // su match() -una campaña con canal='multiple' terminaría
            // "enviada" con total_destinatarios > 0 pero cero mensajes
            // reales creados, sin ningún error visible.
            'canal' => 'required|in:sms,email,whatsapp',
            'template_id' => 'nullable|exists:templates_comunicacion,id',
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

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
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

        // No se usa array_merge($request->all(), [...]): la columna real es
        // fecha_programada, no fecha_envio_programada (el nombre que usa el
        // request/frontend). Antes esto pasaba fecha_envio_programada tal
        // cual a create(), Eloquent lo descartaba por no estar en
        // $fillable, y fecha_programada quedaba siempre null aunque
        // 'estado' sí se ponía en 'programada'.
        $campana = CampanaComunicacion::create([
            'campana_id' => $request->campana_id,
            'template_id' => $request->template_id,
            'segmento_id' => $request->segmento_id,
            'created_by_id' => $user->id,
            'nombre' => $request->nombre,
            'canal' => $request->canal,
            'asunto' => $asunto,
            'contenido' => $contenido,
            'fecha_programada' => $request->fecha_envio_programada,
            'estado' => $request->fecha_envio_programada ? 'programada' : 'borrador',
            'total_destinatarios' => $totalDestinatarios,
        ]);

        $campana->load(['template', 'segmento']);

        return response()->json([
            'success' => true,
            'message' => 'Campaña de comunicación creada exitosamente',
            'data' => $campana,
        ], 201);
    }

    /**
     * Ver campaña de comunicación
     */
    public function showCampana(Request $request, int $id): JsonResponse
    {
        $campana = CampanaComunicacion::with(['template', 'segmento'])->find($id);

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

        return response()->json([
            'success' => true,
            'data' => $campana,
        ], 200);
    }

    /**
     * Actualizar campaña de comunicación (solo mientras esté en borrador/programada)
     */
    public function updateCampana(Request $request, int $id): JsonResponse
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

        if (!in_array($campana->estado, ['borrador', 'programada'])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden editar campañas en borrador o programadas',
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:200',
            'asunto_personalizado' => 'nullable|string|max:200',
            'contenido_personalizado' => 'nullable|string',
            'fecha_envio_programada' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Igual que en storeCampana: las columnas reales son asunto/
        // contenido/fecha_programada, no *_personalizado/fecha_envio_
        // programada (esos son solo los nombres que manda el request). El
        // $request->only([...]) anterior con los nombres del request no
        // actualizaba nada real salvo 'nombre'.
        $updateData = ['nombre' => $request->nombre ?? $campana->nombre];

        if ($request->has('asunto_personalizado')) {
            $updateData['asunto'] = $request->asunto_personalizado;
        }
        if ($request->has('contenido_personalizado')) {
            $updateData['contenido'] = $request->contenido_personalizado;
        }
        if ($request->has('fecha_envio_programada')) {
            $updateData['fecha_programada'] = $request->fecha_envio_programada;
            $updateData['estado'] = $request->fecha_envio_programada ? 'programada' : 'borrador';
        }

        $campana->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Campaña actualizada exitosamente',
            'data' => $campana->load(['template', 'segmento']),
        ], 200);
    }

    /**
     * Eliminar campaña de comunicación (solo mientras esté en borrador/programada)
     */
    public function destroyCampana(Request $request, int $id): JsonResponse
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

        if (!in_array($campana->estado, ['borrador', 'programada'])) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar una campaña ya enviada o en proceso de envío',
            ], 409);
        }

        $campana->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campaña eliminada exitosamente',
        ], 200);
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

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campana->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        if ($campana->estado === 'enviada' || $campana->estado === 'enviando') {
            return response()->json([
                'success' => false,
                'message' => 'La campaña ya fue enviada o está en proceso de envío',
            ], 409);
        }

        // Actualizar estado (columna real: fecha_inicio_envio)
        $campana->update([
            'estado' => 'enviando',
            'fecha_inicio_envio' => now(),
        ]);

        // Despachar Job para envío masivo en segundo plano
        EnviarCampanaMasivaJob::dispatch($campana->id);

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

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a esta campaña',
            ], 403);
        }

        $votante = Votante::find($request->votante_id);

        // Validar que el votante tenga el canal disponible
        if ($request->canal === 'email' && !$votante->email) {
            return response()->json([
                'success' => false,
                'message' => 'El votante no tiene email registrado',
            ], 422);
        }

        if (in_array($request->canal, ['sms', 'whatsapp']) && !$votante->telefono) {
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

        // Despachar Job para envío en segundo plano
        EnviarMensajeJob::dispatch($mensaje->id);

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
                'programada' => $campana->fecha_programada,
                'real' => $campana->fecha_inicio_envio,
                'completada' => $campana->fecha_fin_envio,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ], 200);
    }

    /**
     * Preview de un template con los datos reales de un votante
     */
    public function previewTemplate(Request $request, int $id, int $votanteId): JsonResponse
    {
        $template = ComunicacionTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($template->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este template',
            ], 403);
        }

        $votante = Votante::with('municipio.departamento')->find($votanteId);

        if (!$votante) {
            return response()->json([
                'success' => false,
                'message' => 'Votante no encontrado',
            ], 404);
        }

        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($votante->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este votante',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'asunto' => $template->asunto ? $this->reemplazarVariables($template->asunto, $votante) : null,
                'contenido' => $this->reemplazarVariables($template->contenido, $votante),
            ],
        ], 200);
    }

    /**
     * Programar el envío de una campaña de comunicación
     */
    public function programarCampana(Request $request, int $id): JsonResponse
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

        if (!in_array($campana->estado, ['borrador', 'programada'])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden programar campañas en borrador',
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'fecha_programada' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de validación incorrectos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $campana->update([
            'fecha_programada' => $request->fecha_programada,
            'estado' => 'programada',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Campaña programada exitosamente',
            'data' => $campana,
        ], 200);
    }

    /**
     * Cancelar una campaña de comunicación programada
     */
    public function cancelarCampana(Request $request, int $id): JsonResponse
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

        if (!in_array($campana->estado, ['borrador', 'programada'])) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede cancelar una campaña ya enviada o en proceso de envío',
            ], 409);
        }

        $campana->update(['estado' => 'cancelada']);

        return response()->json([
            'success' => true,
            'message' => 'Campaña cancelada',
            'data' => $campana,
        ], 200);
    }

    /**
     * Listar mensajes individuales. Acepta campana_comunicacion_id (una
     * campaña de comunicación puntual) o campana_id (todos los mensajes de
     * la campaña electoral, cruzando todas sus campañas de comunicación) -
     * el frontend tiene una vista de "historial de mensajes" general que
     * necesita esto último y no tenía ningún endpoint real que la sirviera.
     */
    public function indexMensajes(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campana_comunicacion_id' => 'required_without:campana_id|integer|exists:campanas_comunicacion,id',
            'campana_id' => 'required_without:campana_comunicacion_id|integer|exists:campanas,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        if ($request->campana_comunicacion_id) {
            $campanaComunicacion = CampanaComunicacion::find($request->campana_comunicacion_id);

            if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($campanaComunicacion->campana_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene acceso a esta campaña',
                ], 403);
            }

            $query = Mensaje::where('campana_comunicacion_id', $campanaComunicacion->id);
        } else {
            if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($request->campana_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene acceso a esta campaña',
                ], 403);
            }

            $query = Mensaje::whereHas('campanaComunicacion', function ($q) use ($request) {
                $q->where('campana_id', $request->campana_id);
            });
        }

        $query->with('votante');

        if ($request->has('canal')) {
            $query->where('canal', $request->canal);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $mensajes = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $mensajes,
        ], 200);
    }

    /**
     * Ver mensaje individual
     */
    public function showMensaje(Request $request, int $id): JsonResponse
    {
        $mensaje = Mensaje::with(['votante', 'campanaComunicacion'])->find($id);

        if (!$mensaje) {
            return response()->json([
                'success' => false,
                'message' => 'Mensaje no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($mensaje->campanaComunicacion->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este mensaje',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $mensaje,
        ], 200);
    }

    /**
     * Reenviar un mensaje individual fallido
     */
    public function reenviarMensaje(Request $request, int $id): JsonResponse
    {
        $mensaje = Mensaje::with('campanaComunicacion')->find($id);

        if (!$mensaje) {
            return response()->json([
                'success' => false,
                'message' => 'Mensaje no encontrado',
            ], 404);
        }

        $user = $request->user();
        if ($user->role->name !== 'super_admin' && !$user->hasAccessToCampana($mensaje->campanaComunicacion->campana_id)) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene acceso a este mensaje',
            ], 403);
        }

        if (!in_array($mensaje->estado, ['fallido', 'rebotado'])) {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden reenviar mensajes fallidos o rebotados',
            ], 409);
        }

        $mensaje->update([
            'estado' => 'pendiente',
            'error_mensaje' => null,
        ]);

        EnviarMensajeJob::dispatch($mensaje->id);

        return response()->json([
            'success' => true,
            'message' => 'Mensaje encolado para reenvío',
            'data' => $mensaje,
        ], 200);
    }

    /**
     * Reemplazar variables en contenido
     */
    private function reemplazarVariables(string $contenido, Votante $votante): string
    {
        $variables = [
            '{{nombre}}' => $votante->primer_nombre,
            '{{apellido}}' => $votante->primer_apellido,
            '{{nombre_completo}}' => $votante->nombre_completo,
            '{{documento}}' => $votante->documento,
            '{{municipio}}' => $votante->municipio->nombre ?? '',
            '{{departamento}}' => $votante->municipio->departamento->nombre ?? '',
        ];

        return str_replace(array_keys($variables), array_values($variables), $contenido);
    }
}
