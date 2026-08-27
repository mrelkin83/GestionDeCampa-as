<?php

namespace App\Jobs;

use App\Models\Mensaje;
use App\Services\TwilioService;
use App\Services\SesService;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Exception;

class EnviarMensajeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $mensajeId;

    /**
     * Número de intentos permitidos
     */
    public int $tries = 3;

    /**
     * Tiempo de espera entre intentos (en segundos)
     */
    public int $backoff = 60;

    /**
     * Timeout del job (en segundos)
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(int $mensajeId)
    {
        $this->mensajeId = $mensajeId;
        $this->onQueue('mensajes'); // Cola específica para mensajes
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $mensaje = Mensaje::find($this->mensajeId);

        if (!$mensaje) {
            Log::error('Mensaje no encontrado para envío', ['id' => $this->mensajeId]);
            return;
        }

        // Si el mensaje ya fue enviado, no hacer nada
        if (in_array($mensaje->estado, ['enviado', 'entregado'])) {
            Log::info('Mensaje ya fue enviado, saltando', ['id' => $this->mensajeId]);
            return;
        }

        try {
            $resultado = match($mensaje->canal) {
                'sms' => $this->enviarSMS($mensaje),
                'email' => $this->enviarEmail($mensaje),
                'whatsapp' => $this->enviarWhatsApp($mensaje),
                default => throw new Exception('Canal no soportado: ' . $mensaje->canal),
            };

            if ($resultado['success']) {
                $mensaje->update([
                    'estado' => 'enviado',
                    'fecha_envio' => now(),
                    'proveedor' => $this->getProveedor($mensaje->canal),
                    'mensaje_id_externo' => $resultado['message_id'] ?? $resultado['sid'] ?? null,
                ]);

                Log::info('Mensaje enviado exitosamente', [
                    'id' => $mensaje->id,
                    'canal' => $mensaje->canal,
                    'destinatario' => $mensaje->destinatario,
                ]);
            } else {
                $this->fail(new Exception($resultado['error'] ?? 'Error desconocido'));
            }

        } catch (Exception $e) {
            Log::error('Error enviando mensaje', [
                'id' => $mensaje->id,
                'canal' => $mensaje->canal,
                'error' => $e->getMessage(),
            ]);

            $mensaje->update([
                'estado' => 'fallido',
                'error_mensaje' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Enviar SMS usando Twilio
     */
    protected function enviarSMS(Mensaje $mensaje): array
    {
        $twilioService = new TwilioService();

        if (!$twilioService->isConfigured()) {
            return [
                'success' => false,
                'error' => 'Twilio no está configurado',
            ];
        }

        return $twilioService->sendSMS($mensaje->destinatario, $mensaje->contenido);
    }

    /**
     * Enviar Email usando AWS SES
     */
    protected function enviarEmail(Mensaje $mensaje): array
    {
        $sesService = new SesService();

        if (!$sesService->isConfigured()) {
            return [
                'success' => false,
                'error' => 'AWS SES no está configurado',
            ];
        }

        return $sesService->sendEmail(
            $mensaje->destinatario,
            $mensaje->asunto ?? 'Mensaje de la campaña',
            $mensaje->contenido
        );
    }

    /**
     * Enviar WhatsApp usando WhatsApp Business API
     */
    protected function enviarWhatsApp(Mensaje $mensaje): array
    {
        $whatsappService = new WhatsAppService();

        if (!$whatsappService->isConfigured()) {
            return [
                'success' => false,
                'error' => 'WhatsApp Business API no está configurado',
            ];
        }

        return $whatsappService->sendTextMessage($mensaje->destinatario, $mensaje->contenido);
    }

    /**
     * Obtener nombre del proveedor según canal
     */
    protected function getProveedor(string $canal): string
    {
        return match($canal) {
            'sms' => 'twilio',
            'email' => 'ses',
            'whatsapp' => 'whatsapp',
            default => 'unknown',
        };
    }

    /**
     * Handle a job failure.
     */
    public function failed(Exception $exception): void
    {
        $mensaje = Mensaje::find($this->mensajeId);

        if ($mensaje) {
            $mensaje->update([
                'estado' => 'fallido',
                'error_mensaje' => $exception->getMessage(),
            ]);

            Log::error('Job de envío de mensaje falló definitivamente', [
                'mensaje_id' => $this->mensajeId,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
