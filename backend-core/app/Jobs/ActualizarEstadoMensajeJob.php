<?php

namespace App\Jobs;

use App\Models\Mensaje;
use App\Models\CampanaComunicacion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ActualizarEstadoMensajeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $mensajeId;
    public string $nuevoEstado;
    public ?array $metadata;

    /**
     * Número de intentos permitidos
     */
    public int $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(int $mensajeId, string $nuevoEstado, ?array $metadata = null)
    {
        $this->mensajeId = $mensajeId;
        $this->nuevoEstado = $nuevoEstado;
        $this->metadata = $metadata;
        $this->onQueue('webhooks'); // Cola específica para webhooks
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $mensaje = Mensaje::find($this->mensajeId);

        if (!$mensaje) {
            Log::warning('Mensaje no encontrado para actualizar estado', [
                'id' => $this->mensajeId,
            ]);
            return;
        }

        try {
            $datosActualizacion = [
                'estado' => $this->nuevoEstado,
            ];

            // Actualizar según el nuevo estado
            switch ($this->nuevoEstado) {
                case 'entregado':
                    $datosActualizacion['fecha_entrega'] = now();
                    break;

                case 'abierto':
                    $datosActualizacion['fecha_apertura'] = now();
                    break;

                case 'click':
                    $datosActualizacion['fecha_click'] = now();
                    break;

                case 'fallido':
                case 'rebotado':
                    if (isset($this->metadata['error'])) {
                        $datosActualizacion['error_mensaje'] = $this->metadata['error'];
                    }
                    break;
            }

            // Agregar metadata si existe. La columna real en `mensajes` es
            // metadata_proveedor (ver migración); 'metadata' no es fillable
            // ni existe como columna, así que esto se descartaba en
            // silencio en cada update() -el error_code/price de Twilio, los
            // detalles de bounce/complaint de SES y el timestamp/error de
            // WhatsApp nunca se guardaban.
            if ($this->metadata) {
                $metadataActual = $mensaje->metadata_proveedor ?? [];
                $datosActualizacion['metadata_proveedor'] = array_merge($metadataActual, $this->metadata);
            }

            // Actualizar mensaje
            $mensaje->update($datosActualizacion);

            Log::info('Estado de mensaje actualizado', [
                'mensaje_id' => $mensaje->id,
                'estado_anterior' => $mensaje->estado,
                'estado_nuevo' => $this->nuevoEstado,
            ]);

            // Actualizar estadísticas de campaña si existe
            if ($mensaje->campana_comunicacion_id) {
                $this->actualizarEstadisticasCampana($mensaje->campana_comunicacion_id);
            }

        } catch (\Exception $e) {
            Log::error('Error actualizando estado de mensaje', [
                'mensaje_id' => $this->mensajeId,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Actualizar estadísticas de la campaña
     */
    protected function actualizarEstadisticasCampana(int $campanaId): void
    {
        $campana = CampanaComunicacion::find($campanaId);

        if (!$campana) {
            return;
        }

        // Calcular estadísticas agregadas.
        // Las comillas dobles ("enviado") son identificadores en PostgreSQL
        // (este proyecto usa pgsql), no literales de cadena -esto lanzaba
        // siempre "column \"enviado\" does not exist" y hacía fallar el job
        // entero (con reintentos) cada vez que un mensaje de una campaña
        // con campana_comunicacion_id cambiaba de estado.
        $stats = DB::table('mensajes')
            ->where('campana_comunicacion_id', $campanaId)
            ->select([
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados"),
                DB::raw("SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregados"),
                DB::raw("SUM(CASE WHEN estado = 'fallido' THEN 1 ELSE 0 END) as fallidos"),
                DB::raw("SUM(CASE WHEN estado = 'abierto' OR fecha_apertura IS NOT NULL THEN 1 ELSE 0 END) as abiertos"),
                DB::raw('SUM(CASE WHEN fecha_click IS NOT NULL THEN 1 ELSE 0 END) as clicks'),
            ])
            ->first();

        // Calcular tasas
        $totalEnviados = $stats->enviados + $stats->entregados;
        $tasaEntrega = $totalEnviados > 0 ? round(($stats->entregados / $totalEnviados) * 100, 2) : 0;
        $tasaApertura = $stats->entregados > 0 ? round(($stats->abiertos / $stats->entregados) * 100, 2) : 0;
        $tasaClicks = $stats->abiertos > 0 ? round(($stats->clicks / $stats->abiertos) * 100, 2) : 0;

        // Actualizar campaña
        $campana->update([
            'total_enviados' => $totalEnviados,
            'total_entregados' => $stats->entregados,
            'total_fallidos' => $stats->fallidos,
            'total_abiertos' => $stats->abiertos,
            'total_clicks' => $stats->clicks,
            'tasa_entrega' => $tasaEntrega,
            'tasa_apertura' => $tasaApertura,
            'tasa_clicks' => $tasaClicks,
        ]);

        // Marcar como completada si todos los mensajes fueron procesados
        if ($stats->total == ($stats->enviados + $stats->entregados + $stats->fallidos)) {
            $campana->update([
                'estado' => 'completada',
                'fecha_completada' => now(),
            ]);

            Log::info('Campaña marcada como completada', [
                'campana_id' => $campanaId,
                'total_mensajes' => $stats->total,
            ]);
        }
    }
}
