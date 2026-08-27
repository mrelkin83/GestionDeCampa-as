<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;
use Twilio\Exceptions\TwilioException;

class TwilioService
{
    protected ?Client $client = null;
    protected ?string $fromNumber = null;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->fromNumber = config('services.twilio.from');

        if ($sid && $token) {
            try {
                $this->client = new Client($sid, $token);
            } catch (Exception $e) {
                Log::error('Twilio initialization failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * Verificar si Twilio está configurado
     */
    public function isConfigured(): bool
    {
        return $this->client !== null && $this->fromNumber !== null;
    }

    /**
     * Enviar SMS individual
     *
     * @param string $to Número de teléfono destino (formato E.164: +573001234567)
     * @param string $message Contenido del mensaje (max 1600 caracteres)
     * @return array ['success' => bool, 'sid' => string|null, 'error' => string|null]
     */
    public function sendSMS(string $to, string $message): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'sid' => null,
                'error' => 'Twilio no está configurado',
            ];
        }

        try {
            // Validar formato de número (debe empezar con +)
            if (!str_starts_with($to, '+')) {
                $to = '+57' . ltrim($to, '0'); // Asumir Colombia por defecto
            }

            // Truncar mensaje si excede límite
            if (strlen($message) > 1600) {
                $message = substr($message, 0, 1597) . '...';
            }

            $twilioMessage = $this->client->messages->create(
                $to,
                [
                    'from' => $this->fromNumber,
                    'body' => $message,
                ]
            );

            Log::info('SMS enviado exitosamente', [
                'to' => $to,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
            ]);

            return [
                'success' => true,
                'sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status,
                'error' => null,
            ];

        } catch (TwilioException $e) {
            Log::error('Error enviando SMS con Twilio', [
                'to' => $to,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);

            return [
                'success' => false,
                'sid' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verificar estado de un mensaje
     *
     * @param string $messageSid SID del mensaje
     * @return array|null
     */
    public function getMessageStatus(string $messageSid): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $message = $this->client->messages($messageSid)->fetch();

            return [
                'sid' => $message->sid,
                'status' => $message->status,
                'to' => $message->to,
                'from' => $message->from,
                'date_sent' => $message->dateSent?->format('Y-m-d H:i:s'),
                'date_updated' => $message->dateUpdated?->format('Y-m-d H:i:s'),
                'price' => $message->price,
                'error_code' => $message->errorCode,
                'error_message' => $message->errorMessage,
            ];

        } catch (TwilioException $e) {
            Log::error('Error obteniendo estado de mensaje Twilio', [
                'sid' => $messageSid,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Enviar SMS masivo (batch)
     *
     * @param array $recipients Array de ['to' => string, 'message' => string]
     * @return array ['total' => int, 'success' => int, 'failed' => int, 'results' => array]
     */
    public function sendBatch(array $recipients): array
    {
        $results = [
            'total' => count($recipients),
            'success' => 0,
            'failed' => 0,
            'results' => [],
        ];

        foreach ($recipients as $recipient) {
            $result = $this->sendSMS($recipient['to'], $recipient['message']);

            if ($result['success']) {
                $results['success']++;
            } else {
                $results['failed']++;
            }

            $results['results'][] = array_merge($result, [
                'to' => $recipient['to'],
            ]);
        }

        return $results;
    }

    /**
     * Obtener balance de la cuenta Twilio
     */
    public function getAccountBalance(): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $account = $this->client->api->v2010->accounts(config('services.twilio.sid'))->fetch();

            return [
                'status' => $account->status,
                'type' => $account->type,
                'friendly_name' => $account->friendlyName,
            ];

        } catch (TwilioException $e) {
            Log::error('Error obteniendo balance Twilio: ' . $e->getMessage());
            return null;
        }
    }
}
