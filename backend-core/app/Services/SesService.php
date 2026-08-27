<?php

namespace App\Services;

use Aws\Ses\SesClient;
use Aws\Exception\AwsException;
use Exception;
use Illuminate\Support\Facades\Log;

class SesService
{
    protected ?SesClient $client = null;
    protected ?string $fromEmail = null;
    protected ?string $fromName = null;

    public function __construct()
    {
        $key = config('services.ses.key');
        $secret = config('services.ses.secret');
        $region = config('services.ses.region', 'us-east-1');

        $this->fromEmail = config('mail.from.address');
        $this->fromName = config('mail.from.name');

        if ($key && $secret) {
            try {
                $this->client = new SesClient([
                    'version' => 'latest',
                    'region' => $region,
                    'credentials' => [
                        'key' => $key,
                        'secret' => $secret,
                    ],
                ]);
            } catch (Exception $e) {
                Log::error('AWS SES initialization failed: ' . $e->getMessage());
            }
        }
    }

    /**
     * Verificar si AWS SES está configurado
     */
    public function isConfigured(): bool
    {
        return $this->client !== null && $this->fromEmail !== null;
    }

    /**
     * Enviar email individual
     *
     * @param string $to Email destino
     * @param string $subject Asunto del email
     * @param string $htmlBody Contenido HTML
     * @param string|null $textBody Contenido texto plano (opcional)
     * @return array ['success' => bool, 'message_id' => string|null, 'error' => string|null]
     */
    public function sendEmail(
        string $to,
        string $subject,
        string $htmlBody,
        ?string $textBody = null
    ): array {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'AWS SES no está configurado',
            ];
        }

        try {
            // Validar email
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                return [
                    'success' => false,
                    'message_id' => null,
                    'error' => 'Email inválido: ' . $to,
                ];
            }

            // Si no hay texto plano, generar desde HTML
            if (!$textBody) {
                $textBody = strip_tags($htmlBody);
            }

            $result = $this->client->sendEmail([
                'Source' => "{$this->fromName} <{$this->fromEmail}>",
                'Destination' => [
                    'ToAddresses' => [$to],
                ],
                'Message' => [
                    'Subject' => [
                        'Data' => $subject,
                        'Charset' => 'UTF-8',
                    ],
                    'Body' => [
                        'Html' => [
                            'Data' => $htmlBody,
                            'Charset' => 'UTF-8',
                        ],
                        'Text' => [
                            'Data' => $textBody,
                            'Charset' => 'UTF-8',
                        ],
                    ],
                ],
                'ConfigurationSetName' => config('services.ses.configuration_set'),
            ]);

            $messageId = $result->get('MessageId');

            Log::info('Email enviado exitosamente', [
                'to' => $to,
                'subject' => $subject,
                'message_id' => $messageId,
            ]);

            return [
                'success' => true,
                'message_id' => $messageId,
                'error' => null,
            ];

        } catch (AwsException $e) {
            Log::error('Error enviando email con AWS SES', [
                'to' => $to,
                'error' => $e->getAwsErrorMessage(),
                'code' => $e->getAwsErrorCode(),
            ]);

            return [
                'success' => false,
                'message_id' => null,
                'error' => $e->getAwsErrorMessage(),
            ];
        }
    }

    /**
     * Enviar email con template
     *
     * @param string $to Email destino
     * @param string $templateName Nombre del template en SES
     * @param array $templateData Datos para el template
     * @return array
     */
    public function sendTemplatedEmail(
        string $to,
        string $templateName,
        array $templateData
    ): array {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'message_id' => null,
                'error' => 'AWS SES no está configurado',
            ];
        }

        try {
            $result = $this->client->sendTemplatedEmail([
                'Source' => "{$this->fromName} <{$this->fromEmail}>",
                'Destination' => [
                    'ToAddresses' => [$to],
                ],
                'Template' => $templateName,
                'TemplateData' => json_encode($templateData),
                'ConfigurationSetName' => config('services.ses.configuration_set'),
            ]);

            $messageId = $result->get('MessageId');

            Log::info('Email con template enviado exitosamente', [
                'to' => $to,
                'template' => $templateName,
                'message_id' => $messageId,
            ]);

            return [
                'success' => true,
                'message_id' => $messageId,
                'error' => null,
            ];

        } catch (AwsException $e) {
            Log::error('Error enviando email templado con AWS SES', [
                'to' => $to,
                'template' => $templateName,
                'error' => $e->getAwsErrorMessage(),
            ]);

            return [
                'success' => false,
                'message_id' => null,
                'error' => $e->getAwsErrorMessage(),
            ];
        }
    }

    /**
     * Enviar emails masivos (batch)
     *
     * @param array $recipients Array de ['to' => string, 'subject' => string, 'body' => string]
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
            $result = $this->sendEmail(
                $recipient['to'],
                $recipient['subject'],
                $recipient['body'],
                $recipient['text'] ?? null
            );

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
     * Verificar si un email está verificado en SES
     */
    public function isEmailVerified(string $email): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        try {
            $result = $this->client->getIdentityVerificationAttributes([
                'Identities' => [$email],
            ]);

            $attributes = $result->get('VerificationAttributes');

            return isset($attributes[$email]) &&
                   $attributes[$email]['VerificationStatus'] === 'Success';

        } catch (AwsException $e) {
            Log::error('Error verificando email en SES: ' . $e->getAwsErrorMessage());
            return false;
        }
    }

    /**
     * Obtener estadísticas de envío de las últimas 24 horas
     */
    public function getSendStatistics(): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $result = $this->client->getSendStatistics();
            $dataPoints = $result->get('SendDataPoints');

            if (empty($dataPoints)) {
                return [
                    'delivery_attempts' => 0,
                    'bounces' => 0,
                    'complaints' => 0,
                    'rejects' => 0,
                ];
            }

            // Sumar estadísticas
            $stats = array_reduce($dataPoints, function ($carry, $point) {
                $carry['delivery_attempts'] += $point['DeliveryAttempts'] ?? 0;
                $carry['bounces'] += $point['Bounces'] ?? 0;
                $carry['complaints'] += $point['Complaints'] ?? 0;
                $carry['rejects'] += $point['Rejects'] ?? 0;
                return $carry;
            }, [
                'delivery_attempts' => 0,
                'bounces' => 0,
                'complaints' => 0,
                'rejects' => 0,
            ]);

            return $stats;

        } catch (AwsException $e) {
            Log::error('Error obteniendo estadísticas SES: ' . $e->getAwsErrorMessage());
            return null;
        }
    }

    /**
     * Obtener quota de envío
     */
    public function getSendQuota(): ?array
    {
        if (!$this->isConfigured()) {
            return null;
        }

        try {
            $result = $this->client->getSendQuota();

            return [
                'max_24_hour_send' => $result->get('Max24HourSend'),
                'max_send_rate' => $result->get('MaxSendRate'),
                'sent_last_24_hours' => $result->get('SentLast24Hours'),
            ];

        } catch (AwsException $e) {
            Log::error('Error obteniendo quota SES: ' . $e->getAwsErrorMessage());
            return null;
        }
    }
}
