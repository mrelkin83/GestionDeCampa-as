<?php

namespace App\Jobs;

use App\Models\CampanaComunicacion;
use App\Models\Mensaje;
use App\Models\Votante;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class EnviarCampanaMasivaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $campanaId;

    /**
     * Número de intentos permitidos
     */
    public int $tries = 1;

    /**
     * Timeout del job (30 minutos)
     */
    public int $timeout = 1800;

    /**
     * Create a new job instance.
     */
    public function __construct(int $campanaId)
    {
        $this->campanaId = $campanaId;
        $this->onQueue('campanas'); // Cola específica para campañas masivas
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $campana = CampanaComunicacion::with('segmento')->find($this->campanaId);

        if (!$campana) {
            Log::error('Campaña no encontrada', ['id' => $this->campanaId]);
            return;
        }

        // Validar estado
        if (!in_array($campana->estado, ['enviando', 'programada'])) {
            Log::warning('Campaña no está en estado válido para envío', [
                'id' => $campana->id,
                'estado' => $campana->estado,
            ]);
            return;
        }

        try {
            Log::info('Iniciando envío de campaña masiva', [
                'campana_id' => $campana->id,
                'nombre' => $campana->nombre,
                'canal' => $campana->canal,
            ]);

            // Obtener votantes del segmento
            $votantes = $this->obtenerVotantes($campana);

            if ($votantes->isEmpty()) {
                Log::warning('No hay votantes para enviar', ['campana_id' => $campana->id]);

                $campana->update([
                    'estado' => 'completada',
                    'fecha_fin_envio' => now(),
                    'total_destinatarios' => 0,
                ]);

                return;
            }

            // Actualizar total de destinatarios
            $campana->update([
                'total_destinatarios' => $votantes->count(),
            ]);

            // Crear mensajes en batch
            $mensajes = $this->crearMensajes($campana, $votantes);

            Log::info('Mensajes creados para campaña', [
                'campana_id' => $campana->id,
                'total_mensajes' => count($mensajes),
            ]);

            // Despachar jobs individuales para cada mensaje
            $this->despacharMensajes($mensajes);

            // Actualizar estado de campaña
            $campana->update([
                'estado' => 'enviando',
                'fecha_inicio_envio' => now(),
            ]);

            Log::info('Campaña masiva despachada exitosamente', [
                'campana_id' => $campana->id,
                'total_despachados' => count($mensajes),
            ]);

        } catch (Exception $e) {
            Log::error('Error procesando campaña masiva', [
                'campana_id' => $campana->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $campana->update([
                'estado' => 'fallida',
            ]);

            throw $e;
        }
    }

    /**
     * Obtener votantes según configuración de campaña
     */
    protected function obtenerVotantes(CampanaComunicacion $campana)
    {
        $query = Votante::query();

        // Si hay segmento, filtrar por segmento
        if ($campana->segmento_id) {
            $query->whereHas('segmentos', function ($q) use ($campana) {
                $q->where('segmentos.id', $campana->segmento_id);
            });
        } else {
            // Si no hay segmento, usar todos los votantes de la campaña
            $query->where('campana_id', $campana->campana_id);
        }

        // Filtrar por disponibilidad de canal
        switch ($campana->canal) {
            case 'email':
                $query->whereNotNull('email')->where('email', '!=', '');
                break;
            case 'sms':
            case 'whatsapp':
                $query->whereNotNull('telefono')->where('telefono', '!=', '');
                break;
        }

        // Ordenar y limitar (opcional: configurar límite en la campaña)
        return $query->orderBy('id')->get();
    }

    /**
     * Crear mensajes para todos los votantes
     */
    protected function crearMensajes(CampanaComunicacion $campana, $votantes): array
    {
        $mensajes = [];
        $batchSize = 1000; // Insertar en lotes de 1000

        foreach ($votantes->chunk($batchSize) as $chunk) {
            $mensajesBatch = [];

            foreach ($chunk as $votante) {
                // Reemplazar variables en contenido
                $contenido = $this->reemplazarVariables($campana->contenido, $votante);
                $asunto = $campana->asunto ? $this->reemplazarVariables($campana->asunto, $votante) : null;

                // Determinar destinatario según canal
                $destinatario = match($campana->canal) {
                    'email' => $votante->email,
                    'sms', 'whatsapp' => $votante->telefono,
                    default => null,
                };

                if (!$destinatario) {
                    continue;
                }

                $mensajesBatch[] = [
                    'campana_comunicacion_id' => $campana->id,
                    'votante_id' => $votante->id,
                    'canal' => $campana->canal,
                    'destinatario' => $destinatario,
                    'asunto' => $asunto,
                    'contenido' => $contenido,
                    'estado' => 'pendiente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Insertar batch en la base de datos
            if (!empty($mensajesBatch)) {
                DB::table('mensajes')->insert($mensajesBatch);
                $mensajes = array_merge($mensajes, $mensajesBatch);
            }
        }

        return $mensajes;
    }

    /**
     * Despachar jobs individuales para cada mensaje
     */
    protected function despacharMensajes(array $mensajes): void
    {
        // Obtener IDs de los mensajes recién creados
        $mensajeIds = DB::table('mensajes')
            ->where('campana_comunicacion_id', $this->campanaId)
            ->where('estado', 'pendiente')
            ->pluck('id');

        // Despachar jobs con delay escalonado para evitar sobrecarga
        $delay = 0;
        $mensajesPorSegundo = 10; // Configurar según límites del proveedor
        $delayIncrement = 1 / $mensajesPorSegundo;

        foreach ($mensajeIds as $mensajeId) {
            EnviarMensajeJob::dispatch($mensajeId)
                ->delay(now()->addSeconds($delay));

            $delay += $delayIncrement;
        }

        Log::info('Jobs de mensajes despachados', [
            'campana_id' => $this->campanaId,
            'total_jobs' => $mensajeIds->count(),
            'delay_total' => $delay . 's',
        ]);
    }

    /**
     * Reemplazar variables en contenido
     */
    protected function reemplazarVariables(string $contenido, Votante $votante): string
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

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        $campana = CampanaComunicacion::find($this->campanaId);

        if ($campana) {
            $campana->update([
                'estado' => 'fallida',
            ]);

            Log::error('Job de campaña masiva falló', [
                'campana_id' => $this->campanaId,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
