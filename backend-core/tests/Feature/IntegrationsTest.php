<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\TwilioService;
use App\Services\SesService;
use App\Services\WhatsAppService;

class IntegrationsTest extends TestCase
{
    public function test_twilio_service_can_be_instantiated(): void
    {
        $service = new TwilioService();

        $this->assertInstanceOf(TwilioService::class, $service);
    }

    public function test_twilio_configuration_check(): void
    {
        $service = new TwilioService();

        // Puede estar configurado o no, dependiendo del entorno
        $this->assertIsBool($service->isConfigured());
    }

    public function test_ses_service_can_be_instantiated(): void
    {
        $service = new SesService();

        $this->assertInstanceOf(SesService::class, $service);
    }

    public function test_ses_configuration_check(): void
    {
        $service = new SesService();

        $this->assertIsBool($service->isConfigured());
    }

    public function test_whatsapp_service_can_be_instantiated(): void
    {
        $service = new WhatsAppService();

        $this->assertInstanceOf(WhatsAppService::class, $service);
    }

    public function test_whatsapp_configuration_check(): void
    {
        $service = new WhatsAppService();

        $this->assertIsBool($service->isConfigured());
    }

    public function test_all_communication_services_are_available(): void
    {
        $twilioService = new TwilioService();
        $sesService = new SesService();
        $whatsappService = new WhatsAppService();

        $this->assertNotNull($twilioService);
        $this->assertNotNull($sesService);
        $this->assertNotNull($whatsappService);
    }
}
