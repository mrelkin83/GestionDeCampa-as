<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Twilio, AWS SES, WhatsApp Business API, etc.
    |
    */

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'), // Formato: +573001234567
    ],

    'ses' => [
        'key' => env('AWS_SES_KEY', env('AWS_ACCESS_KEY_ID')),
        'secret' => env('AWS_SES_SECRET', env('AWS_SECRET_ACCESS_KEY')),
        'region' => env('AWS_SES_REGION', 'us-east-1'),
        'configuration_set' => env('AWS_SES_CONFIGURATION_SET'),
    ],

    'whatsapp' => [
        'token' => env('WHATSAPP_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_ID'),
        'business_account_id' => env('WHATSAPP_BUSINESS_ID'),
        'verify_token' => env('WHATSAPP_VERIFY_TOKEN', 'plataforma_electoral_webhook'),
        'app_secret' => env('WHATSAPP_APP_SECRET'),
    ],

    // JWT firmado para que el frontend se autentique contra backend-diad
    // (REST/WebSocket, tiempo real de Día D). No usar env() directo en el
    // controlador: con `php artisan config:cache` (ver scripts/deploy.sh)
    // env() fuera de un archivo de config devuelve null en producción.
    'jwt_ws' => [
        'secret' => env('JWT_SECRET'),
        'ttl' => env('JWT_WS_TTL_HOURS', 24),
    ],

    'wompi' => [
        'public_key' => env('WOMPI_PUBLIC_KEY'),
        'private_key' => env('WOMPI_PRIVATE_KEY'),
        'events_secret' => env('WOMPI_EVENTS_SECRET'),
        'environment' => env('WOMPI_ENVIRONMENT', 'test'), // test o production
    ],

];
