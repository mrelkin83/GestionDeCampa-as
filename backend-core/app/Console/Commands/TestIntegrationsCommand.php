<?php

namespace App\Console\Commands;

use App\Services\TwilioService;
use App\Services\SesService;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestIntegrationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:integrations
                            {--service= : Specific service to test (twilio|ses|whatsapp|all)}
                            {--to= : Test recipient (phone/email)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prueba las integraciones de comunicación (Twilio, AWS SES, WhatsApp)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $service = $this->option('service') ?? 'all';
        $testRecipient = $this->option('to');

        $this->info('🧪 Probando Integraciones de Comunicación');
        $this->info('==========================================');
        $this->newLine();

        $results = [];

        if ($service === 'all' || $service === 'twilio') {
            $results['twilio'] = $this->testTwilio($testRecipient);
        }

        if ($service === 'all' || $service === 'ses') {
            $results['ses'] = $this->testSES($testRecipient);
        }

        if ($service === 'all' || $service === 'whatsapp') {
            $results['whatsapp'] = $this->testWhatsApp($testRecipient);
        }

        $this->newLine(2);
        $this->displayResults($results);

        return 0;
    }

    /**
     * Probar integración Twilio SMS
     */
    protected function testTwilio(?string $recipient): array
    {
        $this->info('📱 Probando Twilio SMS...');

        $twilioService = new TwilioService();

        $result = [
            'service' => 'Twilio SMS',
            'configured' => false,
            'connection' => false,
            'send_test' => false,
            'details' => [],
        ];

        // Verificar configuración
        if (!$twilioService->isConfigured()) {
            $this->warn('⚠️  Twilio no está configurado');
            $result['details']['error'] = 'Missing configuration';
            return $result;
        }

        $result['configured'] = true;
        $this->line('✅ Configuración OK');

        // Probar conexión (obtener balance)
        $account = $twilioService->getAccountBalance();

        if ($account) {
            $result['connection'] = true;
            $this->line('✅ Conexión OK - Account: ' . ($account['friendly_name'] ?? 'N/A'));
            $result['details']['account'] = $account;
        } else {
            $this->warn('⚠️  No se pudo conectar a Twilio');
            return $result;
        }

        // Enviar SMS de prueba
        if ($recipient) {
            $this->info("Enviando SMS de prueba a: {$recipient}");

            $testResult = $twilioService->sendSMS(
                $recipient,
                '🧪 Mensaje de prueba desde Plataforma Electoral Colombia'
            );

            if ($testResult['success']) {
                $result['send_test'] = true;
                $this->line('✅ SMS enviado - SID: ' . $testResult['sid']);
                $result['details']['test_send'] = $testResult;
            } else {
                $this->error('❌ Error enviando SMS: ' . $testResult['error']);
                $result['details']['test_error'] = $testResult['error'];
            }
        }

        return $result;
    }

    /**
     * Probar integración AWS SES
     */
    protected function testSES(?string $recipient): array
    {
        $this->newLine();
        $this->info('📧 Probando AWS SES Email...');

        $sesService = new SesService();

        $result = [
            'service' => 'AWS SES',
            'configured' => false,
            'connection' => false,
            'send_test' => false,
            'details' => [],
        ];

        // Verificar configuración
        if (!$sesService->isConfigured()) {
            $this->warn('⚠️  AWS SES no está configurado');
            $result['details']['error'] = 'Missing configuration';
            return $result;
        }

        $result['configured'] = true;
        $this->line('✅ Configuración OK');

        // Probar conexión (obtener quota)
        $quota = $sesService->getSendQuota();

        if ($quota) {
            $result['connection'] = true;
            $this->line('✅ Conexión OK');
            $this->line('   Max 24h: ' . number_format($quota['max_24_hour_send']));
            $this->line('   Sent 24h: ' . number_format($quota['sent_last_24_hours']));
            $this->line('   Send rate: ' . $quota['max_send_rate'] . ' emails/sec');
            $result['details']['quota'] = $quota;
        } else {
            $this->warn('⚠️  No se pudo conectar a AWS SES');
            return $result;
        }

        // Obtener estadísticas
        $stats = $sesService->getSendStatistics();
        if ($stats) {
            $result['details']['stats'] = $stats;
        }

        // Enviar email de prueba
        if ($recipient) {
            $this->info("Enviando email de prueba a: {$recipient}");

            $testResult = $sesService->sendEmail(
                $recipient,
                '🧪 Prueba de Plataforma Electoral Colombia',
                '<h1>Prueba de Email</h1><p>Este es un email de prueba desde la Plataforma Electoral Colombia.</p>',
                'Prueba de Email - Este es un email de prueba desde la Plataforma Electoral Colombia.'
            );

            if ($testResult['success']) {
                $result['send_test'] = true;
                $this->line('✅ Email enviado - Message ID: ' . $testResult['message_id']);
                $result['details']['test_send'] = $testResult;
            } else {
                $this->error('❌ Error enviando email: ' . $testResult['error']);
                $result['details']['test_error'] = $testResult['error'];
            }
        }

        return $result;
    }

    /**
     * Probar integración WhatsApp
     */
    protected function testWhatsApp(?string $recipient): array
    {
        $this->newLine();
        $this->info('💬 Probando WhatsApp Business API...');

        $whatsappService = new WhatsAppService();

        $result = [
            'service' => 'WhatsApp Business',
            'configured' => false,
            'connection' => false,
            'send_test' => false,
            'details' => [],
        ];

        // Verificar configuración
        if (!$whatsappService->isConfigured()) {
            $this->warn('⚠️  WhatsApp Business API no está configurado');
            $result['details']['error'] = 'Missing configuration';
            return $result;
        }

        $result['configured'] = true;
        $this->line('✅ Configuración OK');

        // Probar conexión (obtener info del número)
        $phoneInfo = $whatsappService->getPhoneNumberInfo();

        if ($phoneInfo) {
            $result['connection'] = true;
            $this->line('✅ Conexión OK');
            $this->line('   Phone: ' . ($phoneInfo['display_phone_number'] ?? 'N/A'));
            $this->line('   Quality: ' . ($phoneInfo['quality_rating'] ?? 'N/A'));
            $result['details']['phone_info'] = $phoneInfo;
        } else {
            $this->warn('⚠️  No se pudo conectar a WhatsApp Business API');
            return $result;
        }

        // Obtener templates
        $templates = $whatsappService->getTemplates();
        if ($templates) {
            $this->line('   Templates disponibles: ' . count($templates));
            $result['details']['templates_count'] = count($templates);
        }

        // Enviar mensaje de prueba
        if ($recipient) {
            $this->info("Enviando mensaje de WhatsApp a: {$recipient}");

            $testResult = $whatsappService->sendTextMessage(
                $recipient,
                '🧪 Mensaje de prueba desde Plataforma Electoral Colombia'
            );

            if ($testResult['success']) {
                $result['send_test'] = true;
                $this->line('✅ Mensaje enviado - ID: ' . $testResult['message_id']);
                $result['details']['test_send'] = $testResult;
            } else {
                $this->error('❌ Error enviando mensaje: ' . $testResult['error']);
                $result['details']['test_error'] = $testResult['error'];
            }
        }

        return $result;
    }

    /**
     * Mostrar resumen de resultados
     */
    protected function displayResults(array $results)
    {
        $this->info('📊 Resumen de Pruebas');
        $this->info('====================');
        $this->newLine();

        $tableData = [];

        foreach ($results as $result) {
            $tableData[] = [
                $result['service'],
                $result['configured'] ? '✅' : '❌',
                $result['connection'] ? '✅' : '❌',
                $result['send_test'] ? '✅' : ($result['configured'] && $result['connection'] ? 'N/A' : '❌'),
            ];
        }

        $this->table(
            ['Servicio', 'Configurado', 'Conexión', 'Envío Prueba'],
            $tableData
        );

        $this->newLine();

        // Contar servicios listos
        $ready = array_filter($results, function($r) {
            return $r['configured'] && $r['connection'];
        });

        $total = count($results);
        $readyCount = count($ready);

        if ($readyCount === $total) {
            $this->info("🎉 ¡Todas las integraciones están listas! ({$readyCount}/{$total})");
        } elseif ($readyCount > 0) {
            $this->warn("⚠️  Algunas integraciones requieren configuración ({$readyCount}/{$total} listas)");
        } else {
            $this->error("❌ Ninguna integración está configurada");
        }

        $this->newLine();
        $this->info('💡 Tip: Usa --to=numero o --to=email para probar envío de mensajes');
        $this->info('   Ejemplo: php artisan test:integrations --service=twilio --to=+573001234567');
    }
}
