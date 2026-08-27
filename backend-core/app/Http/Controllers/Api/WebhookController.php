<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ActualizarEstadoMensajeJob;
use App\Models\Mensaje;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Twilio\Security\RequestValidator;

class WebhookController extends Controller
{
    /**
     * Webhook de Twilio para estados de SMS
     * POST /api/webhooks/twilio/sms
     */
    public function twilioSMS(Request $request): JsonResponse
    {
        if (!$this->isValidTwilioSignature($request)) {
            Log::warning('Firma de Twilio inválida en webhook SMS', ['ip' => $request->ip()]);

            return response()->json(['error' => 'Invalid signature'], 403);
        }

        Log::info('Twilio SMS Webhook received', $request->all());

        try {
            $messageSid = $request->input('MessageSid');
            $status = $request->input('MessageStatus');

            if (!$messageSid || !$status) {
                return response()->json(['error' => 'Invalid webhook data'], 400);
            }

            // Buscar mensaje por SID externo
            $mensaje = Mensaje::where('mensaje_id_externo', $messageSid)
                ->where('proveedor', 'twilio')
                ->first();

            if (!$mensaje) {
                Log::warning('Mensaje no encontrado para SID Twilio', ['sid' => $messageSid]);
                return response()->json(['status' => 'not_found'], 404);
            }

            // Mapear estado de Twilio a nuestro sistema
            $nuevoEstado = $this->mapTwilioStatus($status);

            // Metadata adicional
            $metadata = [
                'twilio_status' => $status,
                'error_code' => $request->input('ErrorCode'),
                'error_message' => $request->input('ErrorMessage'),
                'price' => $request->input('Price'),
                'price_unit' => $request->input('PriceUnit'),
            ];

            // Despachar Job para actualizar
            ActualizarEstadoMensajeJob::dispatch($mensaje->id, $nuevoEstado, $metadata);

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Error procesando webhook Twilio', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Webhook de AWS SES para eventos de email
     * POST /api/webhooks/ses/events
     */
    public function sesEvents(Request $request): JsonResponse
    {
        Log::info('AWS SES Webhook received', $request->all());

        if (!$this->isValidSnsSignature($request)) {
            Log::warning('Firma SNS inválida en webhook SES', ['ip' => $request->ip()]);

            return response()->json(['error' => 'Invalid signature'], 403);
        }

        try {
            // AWS SES envía notificaciones en formato SNS
            // Primero verificar si es una notificación de suscripción
            if ($request->header('x-amz-sns-message-type') === 'SubscriptionConfirmation') {
                return $this->confirmSNSSubscription($request);
            }

            // Parsear mensaje SNS
            $message = json_decode($request->input('Message'), true);

            if (!$message) {
                return response()->json(['error' => 'Invalid SNS message'], 400);
            }

            $eventType = $message['eventType'] ?? null;

            if (!$eventType) {
                return response()->json(['error' => 'Missing event type'], 400);
            }

            // Procesar según tipo de evento
            switch ($eventType) {
                case 'Delivery':
                    $this->processSESDelivery($message);
                    break;

                case 'Bounce':
                    $this->processSESBounce($message);
                    break;

                case 'Complaint':
                    $this->processSESComplaint($message);
                    break;

                case 'Open':
                    $this->processSESOpen($message);
                    break;

                case 'Click':
                    $this->processSESClick($message);
                    break;

                default:
                    Log::info('Evento SES no manejado', ['type' => $eventType]);
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Error procesando webhook SES', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Webhook de WhatsApp Business API
     * POST /api/webhooks/whatsapp/events
     */
    public function whatsappEvents(Request $request): JsonResponse
    {
        // Verificar webhook (GET)
        if ($request->isMethod('get')) {
            $mode = $request->query('hub_mode');
            $token = $request->query('hub_verify_token');
            $challenge = $request->query('hub_challenge');

            $verifiedChallenge = WhatsAppService::verifyWebhook($mode, $token, $challenge);

            if ($verifiedChallenge) {
                return response($verifiedChallenge, 200);
            }

            return response('Forbidden', 403);
        }

        if (!$this->isValidWhatsAppSignature($request)) {
            Log::warning('Firma de WhatsApp inválida en webhook', ['ip' => $request->ip()]);

            return response()->json(['error' => 'Invalid signature'], 403);
        }

        Log::info('WhatsApp Webhook received', $request->all());

        try {
            $entry = $request->input('entry.0');

            if (!$entry) {
                return response()->json(['error' => 'Invalid webhook data'], 400);
            }

            $changes = $entry['changes'] ?? [];

            foreach ($changes as $change) {
                $value = $change['value'] ?? null;

                if (!$value) {
                    continue;
                }

                // Procesar mensajes de estado
                if (isset($value['statuses'])) {
                    foreach ($value['statuses'] as $status) {
                        $this->processWhatsAppStatus($status);
                    }
                }

                // Procesar mensajes entrantes (opcional)
                if (isset($value['messages'])) {
                    foreach ($value['messages'] as $message) {
                        $this->processWhatsAppIncomingMessage($message);
                    }
                }
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\Exception $e) {
            Log::error('Error procesando webhook WhatsApp', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }

    /**
     * Valida la firma X-Twilio-Signature del request contra TWILIO_TOKEN.
     * Sin token configurado o firma ausente/incorrecta, se rechaza (fail closed).
     */
    protected function isValidTwilioSignature(Request $request): bool
    {
        $token = config('services.twilio.token');
        $signature = $request->header('X-Twilio-Signature');

        if (!$token || !$signature) {
            return false;
        }

        return (new RequestValidator($token))->validate(
            $signature,
            $request->fullUrl(),
            $request->post()
        );
    }

    /**
     * Valida X-Hub-Signature-256 (HMAC-SHA256 del body crudo con el App
     * Secret de Meta) para el webhook de eventos de WhatsApp. Sin
     * WHATSAPP_APP_SECRET configurado, se rechaza (fail closed) -antes no
     * había ninguna verificación y cualquiera podía forjar mensajes/estados.
     */
    protected function isValidWhatsAppSignature(Request $request): bool
    {
        $appSecret = config('services.whatsapp.app_secret');
        $signatureHeader = $request->header('X-Hub-Signature-256');

        if (!$appSecret || !$signatureHeader || !str_starts_with($signatureHeader, 'sha256=')) {
            return false;
        }

        $expected = hash_hmac('sha256', $request->getContent(), $appSecret);
        $provided = substr($signatureHeader, 7);

        return hash_equals($expected, $provided);
    }

    /**
     * Mapear estado de Twilio a nuestro sistema
     */
    protected function mapTwilioStatus(string $status): string
    {
        return match($status) {
            'delivered' => 'entregado',
            'sent' => 'enviado',
            'failed', 'undelivered' => 'fallido',
            default => 'enviado',
        };
    }

    /**
     * Confirmar suscripción SNS de AWS
     */
    protected function confirmSNSSubscription(Request $request): JsonResponse
    {
        $subscribeURL = $request->input('SubscribeURL');

        if (!$subscribeURL || !$this->isValidSnsUrl($subscribeURL)) {
            Log::warning('SNS SubscribeURL rechazada por no ser una URL válida de AWS SNS', [
                'url' => $subscribeURL,
            ]);

            return response()->json(['error' => 'Invalid subscribe URL'], 400);
        }

        try {
            // Confirmar suscripción visitando la URL (solo hosts *.amazonaws.com validados arriba)
            \Illuminate\Support\Facades\Http::timeout(5)->get($subscribeURL);

            Log::info('SNS Subscription confirmed', ['url' => $subscribeURL]);

            return response()->json(['status' => 'subscribed'], 200);
        } catch (\Exception $e) {
            Log::error('Error confirmando suscripción SNS', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Could not confirm subscription'], 502);
        }
    }

    /**
     * Restringe la confirmación de suscripción a hosts oficiales de AWS SNS
     * para evitar SSRF a través de una SubscribeURL falsificada.
     */
    protected function isValidSnsUrl(string $url): bool
    {
        $parts = parse_url($url);

        if (!$parts || ($parts['scheme'] ?? '') !== 'https' || empty($parts['host'])) {
            return false;
        }

        return (bool) preg_match('/^sns\.[a-z0-9-]+\.amazonaws\.com$/', $parts['host']);
    }

    /**
     * Verifica la firma criptográfica del sobre SNS (no solo el SubscribeURL):
     * descarga el certificado X.509 indicado en SigningCertURL (restringido a
     * hosts *.amazonaws.com para evitar SSRF) y valida Signature contra el
     * string-to-sign canónico de AWS. Sin esto, cualquiera podía forjar
     * eventos de entrega/rebote/queja de SES sin ninguna autenticación.
     */
    protected function isValidSnsSignature(Request $request): bool
    {
        $type = $request->input('Type');
        $certUrl = $request->input('SigningCertURL');
        $signature = $request->input('Signature');
        $signatureVersion = $request->input('SignatureVersion', '1');

        if (!$type || !$certUrl || !$signature) {
            return false;
        }

        if (!$this->isValidSnsUrl($certUrl)) {
            return false;
        }

        $stringToSign = $this->buildSnsStringToSign($request, $type);

        if (!$stringToSign) {
            return false;
        }

        try {
            $response = Http::timeout(5)->get($certUrl);

            if (!$response->successful()) {
                return false;
            }

            $publicKey = openssl_pkey_get_public($response->body());
        } catch (\Exception $e) {
            Log::error('Error descargando certificado SNS', ['error' => $e->getMessage()]);
            return false;
        }

        if (!$publicKey) {
            return false;
        }

        $algo = $signatureVersion === '2' ? OPENSSL_ALGO_SHA256 : OPENSSL_ALGO_SHA1;
        $decodedSignature = base64_decode($signature, true);

        if ($decodedSignature === false) {
            return false;
        }

        return openssl_verify($stringToSign, $decodedSignature, $publicKey, $algo) === 1;
    }

    /**
     * Construye el string-to-sign canónico según el tipo de mensaje SNS,
     * siguiendo el orden de campos exacto que exige la especificación de AWS.
     */
    protected function buildSnsStringToSign(Request $request, string $type): ?string
    {
        if ($type === 'Notification') {
            $fields = ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'];
        } elseif (in_array($type, ['SubscriptionConfirmation', 'UnsubscribeConfirmation'], true)) {
            $fields = ['Message', 'MessageId', 'SubscribeURL', 'Timestamp', 'Token', 'TopicArn', 'Type'];
        } else {
            return null;
        }

        $stringToSign = '';

        foreach ($fields as $field) {
            if (!$request->has($field)) {
                if ($field === 'Subject') {
                    continue; // Subject es opcional y se omite de la firma si no viene
                }
                return null;
            }

            $stringToSign .= $field . "\n" . $request->input($field) . "\n";
        }

        return $stringToSign;
    }

    /**
     * Procesar evento de entrega de SES
     */
    protected function processSESDelivery(array $message)
    {
        $mail = $message['mail'] ?? null;
        $delivery = $message['delivery'] ?? null;

        if (!$mail || !$delivery) {
            return;
        }

        $messageId = $mail['messageId'] ?? null;
        $recipients = $delivery['recipients'] ?? [];

        if (!$messageId) {
            return;
        }

        // Buscar mensaje
        $mensaje = Mensaje::where('mensaje_id_externo', $messageId)
            ->where('proveedor', 'ses')
            ->first();

        if ($mensaje) {
            ActualizarEstadoMensajeJob::dispatch($mensaje->id, 'entregado', [
                'ses_delivery' => $delivery,
                'recipients' => $recipients,
            ]);
        }
    }

    /**
     * Procesar bounce de SES
     */
    protected function processSESBounce(array $message)
    {
        $mail = $message['mail'] ?? null;
        $bounce = $message['bounce'] ?? null;

        if (!$mail || !$bounce) {
            return;
        }

        $messageId = $mail['messageId'] ?? null;
        $bounceType = $bounce['bounceType'] ?? 'Unknown';

        if (!$messageId) {
            return;
        }

        $mensaje = Mensaje::where('mensaje_id_externo', $messageId)
            ->where('proveedor', 'ses')
            ->first();

        if ($mensaje) {
            ActualizarEstadoMensajeJob::dispatch($mensaje->id, 'rebotado', [
                'bounce_type' => $bounceType,
                'bounce_subtype' => $bounce['bounceSubType'] ?? null,
                'error' => "Email bounce: {$bounceType}",
            ]);
        }
    }

    /**
     * Procesar queja de SES
     */
    protected function processSESComplaint(array $message)
    {
        $mail = $message['mail'] ?? null;

        if (!$mail) {
            return;
        }

        $messageId = $mail['messageId'] ?? null;

        if (!$messageId) {
            return;
        }

        $mensaje = Mensaje::where('mensaje_id_externo', $messageId)
            ->where('proveedor', 'ses')
            ->first();

        if ($mensaje) {
            ActualizarEstadoMensajeJob::dispatch($mensaje->id, 'queja', [
                'complaint' => $message['complaint'] ?? null,
            ]);

            Log::warning('SES Complaint received', [
                'mensaje_id' => $mensaje->id,
                'destinatario' => $mensaje->destinatario,
            ]);
        }
    }

    /**
     * Procesar apertura de email SES
     */
    protected function processSESOpen(array $message)
    {
        $mail = $message['mail'] ?? null;

        if (!$mail) {
            return;
        }

        $messageId = $mail['messageId'] ?? null;

        if (!$messageId) {
            return;
        }

        $mensaje = Mensaje::where('mensaje_id_externo', $messageId)
            ->where('proveedor', 'ses')
            ->first();

        if ($mensaje && !$mensaje->fecha_apertura) {
            ActualizarEstadoMensajeJob::dispatch($mensaje->id, 'abierto', [
                'open_data' => $message['open'] ?? null,
            ]);
        }
    }

    /**
     * Procesar click en email SES
     */
    protected function processSESClick(array $message)
    {
        $mail = $message['mail'] ?? null;
        $click = $message['click'] ?? null;

        if (!$mail || !$click) {
            return;
        }

        $messageId = $mail['messageId'] ?? null;

        if (!$messageId) {
            return;
        }

        $mensaje = Mensaje::where('mensaje_id_externo', $messageId)
            ->where('proveedor', 'ses')
            ->first();

        if ($mensaje) {
            ActualizarEstadoMensajeJob::dispatch($mensaje->id, 'click', [
                'click_data' => $click,
                'link' => $click['link'] ?? null,
            ]);
        }
    }

    /**
     * Procesar estado de mensaje WhatsApp
     */
    protected function processWhatsAppStatus(array $status)
    {
        $messageId = $status['id'] ?? null;
        $statusType = $status['status'] ?? null;

        if (!$messageId || !$statusType) {
            return;
        }

        // Buscar mensaje
        $mensaje = Mensaje::where('mensaje_id_externo', $messageId)
            ->where('proveedor', 'whatsapp')
            ->first();

        if (!$mensaje) {
            return;
        }

        // Mapear estado de WhatsApp
        $nuevoEstado = match($statusType) {
            'sent' => 'enviado',
            'delivered' => 'entregado',
            'read' => 'abierto',
            'failed' => 'fallido',
            default => 'enviado',
        };

        ActualizarEstadoMensajeJob::dispatch($mensaje->id, $nuevoEstado, [
            'whatsapp_status' => $statusType,
            'timestamp' => $status['timestamp'] ?? null,
            'error' => $status['errors'][0] ?? null,
        ]);
    }

    /**
     * Procesar mensaje entrante de WhatsApp (opcional)
     */
    protected function processWhatsAppIncomingMessage(array $message)
    {
        // Aquí se puede implementar lógica para manejar respuestas
        Log::info('WhatsApp incoming message', $message);

        // Ejemplo: marcar mensaje como leído automáticamente
        $messageId = $message['id'] ?? null;

        if ($messageId) {
            $whatsappService = new WhatsAppService();
            $whatsappService->markAsRead($messageId);
        }
    }
}
