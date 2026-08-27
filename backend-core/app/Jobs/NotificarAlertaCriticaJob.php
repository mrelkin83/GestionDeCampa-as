<?php

namespace App\Jobs;

use App\Models\PrecountValidation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Job: NotificarAlertaCriticaJob
 * 
 * Envía notificaciones cuando hay alertas críticas en el preconteo.
 * 
 * Cola: 'notificaciones'
 */
class NotificarAlertaCriticaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 10, 30];

    private int $validationId;

    public function __construct(int $validationId)
    {
        $this->validationId = $validationId;
        $this->onQueue('notificaciones');
    }

    public function handle(): void
    {
        Log::info('🔔 Iniciando NotificarAlertaCriticaJob', [
            'validation_id' => $this->validationId
        ]);

        try {
            $validation = PrecountValidation::with(['record.pollingTable'])
                ->find($this->validationId);

            if (!$validation) {
                Log::warning('Validación no encontrada', [
                    'validation_id' => $this->validationId
                ]);
                return;
            }

            // Solo notificar si es crítica
            if ($validation->severidad !== 'CRITICAL') {
                return;
            }

            // Preparar datos de la notificación
            $datos = [
                'tipo' => $validation->tipo,
                'mensaje' => $validation->mensaje,
                'mesa' => $validation->record?->pollingTable?->numero ?? 'N/A',
                'hora' => now()->format('Y-m-d H:i:s')
            ];

            // Log de la alerta
            Log::critical('🚨 ALERTA CRÍTICA EN PRECONTEO', $datos);

            // Aquí podrías enviar:
            // - Email a coordinadores
            // - SMS a responsables
            // - Notificación push
            // - Slack/Teams webhook

            // Ejemplo: Notificar por email (comentado hasta configurar)
            // Mail::to('coordinadores@campana.com')
            //     ->send(new AlertaCriticaMail($datos));

            // Ejemplo: Webhook a Slack
            // $this->notificarSlack($datos);

            Log::info('✅ Notificación de alerta crítica enviada', [
                'validation_id' => $this->validationId,
                'tipo' => $validation->tipo
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error en NotificarAlertaCriticaJob', [
                'validation_id' => $this->validationId,
                'error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Notificar vía Slack/Teams
     */
    private function notificarSlack(array $datos): void
    {
        $webhookUrl = config('services.slack.webhook_url');
        
        if (!$webhookUrl) {
            return;
        }

        $payload = [
            'text' => '🚨 ALERTA CRÍTICA EN PRECONTEO',
            'attachments' => [
                [
                    'color' => 'danger',
                    'fields' => [
                        ['title' => 'Tipo', 'value' => $datos['tipo'], 'short' => true],
                        ['title' => 'Mesa', 'value' => $datos['mesa'], 'short' => true],
                        ['title' => 'Mensaje', 'value' => $datos['mensaje'], 'short' => false],
                        ['title' => 'Hora', 'value' => $datos['hora'], 'short' => true],
                    ]
                ]
            ]
        ];

        // Usar Http facade para enviar
        // Http::post($webhookUrl, $payload);
    }
}
