<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    protected ?string $token = null;
    protected ?string $phoneNumberId = null;
    protected ?string $businessAccountId = null;
    protected string $apiVersion = 'v18.0';
    protected string $baseUrl;

    public function __construct()
    {
        $this->token = config('services.whatsapp.token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->businessAccountId = config('services.whatsapp.business_account_id');
        $this->baseUrl = "https://graph.facebook.com/{$this->apiVersion}";
    }

    /**
     * Verificar si WhatsApp Business API está configurado
     */
    public function isConfigured(): bool
    {
        return $this->token !== null && $this->phoneNumberId !== null;
    }

    /**
     * Enviar mensaje de texto simple
     *
     * @param string $to Número de teléfono destino (formato: 573001234567, sin +)
     * @param string $message Contenido del mensaje
     * @return array ['success' => bool, 'message_id' => string|null, 'error' => string|null]
     */
    public function sendTextMessage(string $to, string $message): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'WhatsApp Business API no está configurado',
            ];
        }

        try {
            // Limpiar número (remover + y espacios)
            $to = preg_replace('/[^0-9]/', '', $to);

            $response = Http::withToken($this->token)
                ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'recipient_type' => 'individual',
                    'to' => $to,
                    'type' => 'text',
                    'text' => [
                        'preview_url' => false,
                        'body' => $message,
                    ],
                ]);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('Mensaje WhatsApp enviado exitosamente', [
                    'to' => $to,
                    'message_id' => $data['messages'][0]['id'] ?? null,
                ]);

                return [
                    'success' => true,
                    'message_id' => $data['messages'][0]['id'] ?? null,
                    'error' => null,
                ];
            }

            $error = $response->json('error.message') ?? 'Error desconocido';

            Log::error('Error enviando mensaje WhatsApp', [
                'to' => $to,
                'error' => $error,
                'response' => $response->body(),
            ]);

            return [
                'success' => false,
                'message_id' => null,
                'error' => $error,
            ];

        } catch (Exception $e) {
            Log::error('Exception enviando mensaje WhatsApp', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message_id' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enviar mensaje con template aprobado
     *
     * @param string $to Número destino
     * @param string $templateName Nombre del template aprobado en Meta
     * @param string $languageCode Código de idioma (ej: 'es', 'es_CO')
     * @param array $components Parámetros del template
     * @return array
     */
    public function sendTemplateMessage(
        string $to,
        string $templateName,
        string $languageCode = 'es',
        array $components = []
    ): array {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'WhatsApp Business API no está configurado',
            ];
        }

        try {
            $to = preg_replace('/[^0-9]/', '', $to);

            $payload = [
                'messaging_product' => 'whatsapp',
                'recipient_type' => 'individual',
                'to' => $to,
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => [
                        'code' => $languageCode,
                    ],
                ],
            ];

            if (!empty($components)) {
                $payload['template']['components'] = $components;
            }

            $response = Http::withToken($this->token)
                ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", $payload);

            if ($response->successful()) {
                $data = $response->json();

                Log::info('Template WhatsApp enviado exitosamente', [
                    'to' => $to,
                    'template' => $templateName,
                    'message_id' => $data['messages'][0]['id'] ?? null,
                ]);

                return [
                    'success' => true,
                    'message_id' => $data['messages'][0]['id'] ?? null,
                    'error' => null,
                ];
            }

            $error = $response->json('error.message') ?? 'Error desconocido';

            Log::error('Error enviando template WhatsApp', [
                'to' => $to,
                'template' => $templateName,
                'error' => $error,
            ]);

            return [
                'success' => false,
                'message_id' => null,
                'error' => $error,
            ];

        } catch (Exception $e) {
            Log::error('Exception enviando template WhatsApp', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message_id' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Enviar mensajes masivos (batch)
     *
     * @param array $recipients Array de ['to' => string, 'message' => string]
     * @return array
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
            $result = $this->sendTextMessage($recipient['to'], $recipient['message']);

            if ($result['success']) {
                $results['success']++;
            } else {
                $results['failed']++;
            }

            $results['results'][] = array_merge($result, [
                'to' => $recipient['to'],
            ]);

            // Rate limiting: WhatsApp tiene límites de mensajes por segundo
            // Esperar 100ms entre mensajes (máx 10 mensajes/segundo)
            usleep(100000);
        }

        return $results;
    }

    /**
     * Marcar mensaje como leído
     *
     * @param string $messageId ID del mensaje recibido
     * @return bool
     */
    public function markAsRead(string $messageId): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        try {
            $response = Http::withToken($this->token)
                ->post("{$this->baseUrl}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'status' => 'read',
                    'message_id' => $messageId,
                ]);

            return $response->successful();

        } catch (Exception $e) {
            Log::error('Error marcando mensaje WhatsApp como leído: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener información del número de teléfono de WhatsApp Business
     */
    public function getPhoneNumberInfo(): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $response = Http::withToken($this->token)
                ->get("{$this->baseUrl}/{$this->phoneNumberId}");

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (Exception $e) {
            Log::error('Error obteniendo info del número WhatsApp: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener templates aprobados
     */
    public function getTemplates(): ?array
    {
        if (!$this->isConfigured() || !$this->businessAccountId) {
            return null;
        }

        try {
            $response = Http::withToken($this->token)
                ->get("{$this->baseUrl}/{$this->businessAccountId}/message_templates");

            if ($response->successful()) {
                return $response->json('data', []);
            }

            return null;

        } catch (Exception $e) {
            Log::error('Error obteniendo templates WhatsApp: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Webhook de verificación (para configurar el webhook en Meta)
     *
     * @param string $mode
     * @param string $token
     * @param string $challenge
     * @return string|null
     */
    public static function verifyWebhook(string $mode, string $token, string $challenge): ?string
    {
        $verifyToken = config('services.whatsapp.verify_token', 'plataforma_electoral_webhook');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            return $challenge;
        }

        return null;
    }
}
