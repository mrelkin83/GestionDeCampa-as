# Integraciones de Comunicación
## Plataforma Electoral Colombia

**Fecha:** 28 Diciembre 2025
**Versión:** 1.0.0
**Estado:** ✅ Implementado y Funcional

---

## 📋 Tabla de Contenidos

1. [Resumen](#resumen)
2. [Servicios Implementados](#servicios-implementados)
3. [Configuración](#configuración)
4. [Uso de Servicios](#uso-de-servicios)
5. [Jobs Asíncronos](#jobs-asíncronos)
6. [Webhooks](#webhooks)
7. [Testing](#testing)
8. [Comandos Artisan](#comandos-artisan)
9. [Troubleshooting](#troubleshooting)

---

## Resumen

Se han implementado **3 servicios de comunicación** para envío masivo de mensajes:

| Servicio | Canal | Proveedor | Estado |
|----------|-------|-----------|--------|
| **Twilio SMS** | SMS | Twilio | ✅ Completo |
| **AWS SES** | Email | Amazon Web Services | ✅ Completo |
| **WhatsApp Business** | WhatsApp | Meta/Facebook | ✅ Completo |

### Características

- ✅ Envío individual y masivo
- ✅ Procesamiento asíncrono con Laravel Queues
- ✅ Webhooks para actualización de estados
- ✅ Reemplazo de variables personalizadas
- ✅ Estadísticas y métricas en tiempo real
- ✅ Manejo de errores y reintentos automáticos
- ✅ Logs detallados para auditoría

---

## Servicios Implementados

### 1. TwilioService

**Ubicación:** `app/Services/TwilioService.php`

#### Métodos Principales

```php
// Verificar configuración
$twilioService = new TwilioService();
$isConfigured = $twilioService->isConfigured(); // bool

// Enviar SMS individual
$result = $twilioService->sendSMS(
    '+573001234567',
    'Hola {{nombre}}, te invitamos al evento'
);

// Resultado
[
    'success' => true,
    'sid' => 'SM1234567890abcdef',
    'status' => 'sent',
    'error' => null
]

// Enviar SMS masivo (batch)
$recipients = [
    ['to' => '+573001234567', 'message' => 'Mensaje 1'],
    ['to' => '+573007654321', 'message' => 'Mensaje 2'],
];
$results = $twilioService->sendBatch($recipients);

// Obtener estado de mensaje
$status = $twilioService->getMessageStatus('SM1234567890abcdef');

// Obtener balance de cuenta
$account = $twilioService->getAccountBalance();
```

#### Límites y Consideraciones

- **Límite por defecto:** ~10 mensajes/segundo
- **Longitud máxima:** 1600 caracteres (se trunca automáticamente)
- **Formato números:** E.164 (+573001234567)
- **Costo:** Variable por país (~$0.0075 USD por SMS en Colombia)

---

### 2. SesService

**Ubicación:** `app/Services/SesService.php`

#### Métodos Principales

```php
// Verificar configuración
$sesService = new SesService();
$isConfigured = $sesService->isConfigured(); // bool

// Enviar email individual
$result = $sesService->sendEmail(
    'votante@example.com',
    'Invitación al Evento',
    '<h1>Hola {{nombre}}</h1><p>Te invitamos...</p>',
    'Texto plano alternativo'  // opcional
);

// Resultado
[
    'success' => true,
    'message_id' => '0100018d1234abcd-...',
    'error' => null
]

// Enviar con template de SES
$result = $sesService->sendTemplatedEmail(
    'votante@example.com',
    'InvitacionEvento',  // nombre del template en AWS
    ['nombre' => 'Juan', 'evento' => 'Reunion']  // datos del template
);

// Enviar masivo (batch)
$recipients = [
    ['to' => 'user1@example.com', 'subject' => 'Test', 'body' => 'Mensaje 1'],
    ['to' => 'user2@example.com', 'subject' => 'Test', 'body' => 'Mensaje 2'],
];
$results = $sesService->sendBatch($recipients);

// Obtener quota de envío
$quota = $sesService->getSendQuota();
// ['max_24_hour_send' => 50000, 'max_send_rate' => 14, 'sent_last_24_hours' => 120]

// Obtener estadísticas
$stats = $sesService->getSendStatistics();
```

#### Límites y Consideraciones

- **Sandbox mode:** 200 emails/día, solo emails verificados
- **Production mode:** Hasta 50,000/día (ampliable)
- **Send rate:** 14 emails/segundo (por defecto)
- **Tamaño máximo:** 10 MB por email
- **Costo:** ~$0.10 USD por 1,000 emails

---

### 3. WhatsAppService

**Ubicación:** `app/Services/WhatsAppService.php`

#### Métodos Principales

```php
// Verificar configuración
$whatsappService = new WhatsAppService();
$isConfigured = $whatsappService->isConfigured(); // bool

// Enviar mensaje de texto simple
$result = $whatsappService->sendTextMessage(
    '573001234567',  // sin el +
    'Hola {{nombre}}, te invitamos al evento'
);

// Resultado
[
    'success' => true,
    'message_id' => 'wamid.HBgNNTczMDA...',
    'error' => null
]

// Enviar con template aprobado
$result = $whatsappService->sendTemplateMessage(
    '573001234567',
    'evento_invitacion',  // nombre del template
    'es',  // código de idioma
    [  // componentes del template
        [
            'type' => 'body',
            'parameters' => [
                ['type' => 'text', 'text' => 'Juan'],
                ['type' => 'text', 'text' => 'Reunion'],
            ]
        ]
    ]
);

// Enviar masivo con rate limiting
$recipients = [
    ['to' => '573001234567', 'message' => 'Mensaje 1'],
    ['to' => '573007654321', 'message' => 'Mensaje 2'],
];
$results = $whatsappService->sendBatch($recipients);  // Incluye delay automático

// Marcar mensaje como leído
$whatsappService->markAsRead('wamid.HBgNNTczMDA...');

// Obtener info del número de WhatsApp Business
$phoneInfo = $whatsappService->getPhoneNumberInfo();

// Obtener templates aprobados
$templates = $whatsappService->getTemplates();
```

#### Límites y Consideraciones

- **Rate limit:** 10 mensajes/segundo (aplicado automáticamente)
- **Templates:** Solo se pueden enviar templates pre-aprobados por Meta
- **Conversaciones:** Se cobran por conversación de 24 horas
- **Formato números:** Sin + ni espacios (573001234567)
- **Costo:** Variable, ~$0.005-0.04 USD por conversación

---

## Configuración

### 1. Variables de Entorno

Agregar al archivo `.env`:

```bash
# Twilio SMS
TWILIO_SID=AC1234567890abcdef...
TWILIO_TOKEN=your_auth_token_here
TWILIO_FROM=+15551234567

# AWS SES
AWS_SES_KEY=AKIAIOSFODNN7EXAMPLE
AWS_SES_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_SES_REGION=us-east-1
AWS_SES_CONFIGURATION_SET=electoral-platform  # opcional

# WhatsApp Business API
WHATSAPP_TOKEN=EAAxxxxxxxxxxxx
WHATSAPP_PHONE_ID=123456789012345
WHATSAPP_BUSINESS_ID=987654321098765
WHATSAPP_VERIFY_TOKEN=mi_token_seguro_webhook  # para verificación webhook
```

### 2. Instalación de Dependencias

```bash
composer require twilio/sdk
composer require aws/aws-sdk-php
composer require guzzlehttp/guzzle
```

### 3. Configurar Queues

Asegurarse de que Redis esté configurado:

```bash
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### 4. Iniciar Queue Workers

```bash
# Worker para campañas masivas
php artisan queue:work redis --queue=campanas --tries=1 --timeout=1800

# Worker para mensajes individuales
php artisan queue:work redis --queue=mensajes --tries=3 --timeout=120

# Worker para webhooks
php artisan queue:work redis --queue=webhooks --tries=3
```

---

## Uso de Servicios

### Desde el Controlador

```php
use App\Jobs\EnviarMensajeJob;
use App\Jobs\EnviarCampanaMasivaJob;

// Enviar mensaje individual
$mensaje = Mensaje::create([
    'votante_id' => 123,
    'canal' => 'sms',  // o 'email', 'whatsapp'
    'destinatario' => '+573001234567',
    'contenido' => 'Hola {{nombre}}, bienvenido',
    'estado' => 'pendiente',
]);

// Despachar job
EnviarMensajeJob::dispatch($mensaje->id);

// Enviar campaña masiva
$campana = CampanaComunicacion::find(456);
EnviarCampanaMasivaJob::dispatch($campana->id);
```

### Desde la API

```bash
# Enviar mensaje individual
POST /api/comunicacion/mensajes/individual
{
  "campana_id": 1,
  "votante_id": 123,
  "canal": "sms",
  "contenido": "Hola {{nombre}}, te invitamos al evento del {{fecha}}"
}

# Enviar campaña masiva
POST /api/comunicacion/campanas/{id}/enviar
```

---

## Jobs Asíncronos

### 1. EnviarMensajeJob

**Ubicación:** `app/Jobs/EnviarMensajeJob.php`

- **Queue:** `mensajes`
- **Intentos:** 3
- **Timeout:** 120 segundos
- **Backoff:** 60 segundos

Procesa el envío de un mensaje individual según su canal (SMS/Email/WhatsApp).

### 2. EnviarCampanaMasivaJob

**Ubicación:** `app/Jobs/EnviarCampanaMasivaJob.php`

- **Queue:** `campanas`
- **Intentos:** 1
- **Timeout:** 1800 segundos (30 min)

Procesa campaña masiva:
1. Obtiene votantes del segmento
2. Crea mensajes en batch (1000 por vez)
3. Despacha `EnviarMensajeJob` para cada mensaje con delay escalonado
4. Actualiza estadísticas de campaña

### 3. ActualizarEstadoMensajeJob

**Ubicación:** `app/Jobs/ActualizarEstadoMensajeJob.php`

- **Queue:** `webhooks`
- **Intentos:** 3

Actualiza estado de mensajes desde webhooks y recalcula estadísticas de campaña.

---

## Webhooks

### Configuración de URLs

Configurar en los paneles de cada servicio:

| Servicio | URL Webhook | Método |
|----------|-------------|--------|
| **Twilio SMS** | `https://tudominio.com/api/webhooks/twilio/sms` | POST |
| **AWS SES** | `https://tudominio.com/api/webhooks/ses/events` | POST |
| **WhatsApp** | `https://tudominio.com/api/webhooks/whatsapp/events` | GET/POST |

### Eventos Soportados

#### Twilio
- `sent` → enviado
- `delivered` → entregado
- `failed` / `undelivered` → fallido

#### AWS SES
- `Delivery` → entregado
- `Bounce` → rebotado
- `Complaint` → queja
- `Open` → abierto
- `Click` → click

#### WhatsApp
- `sent` → enviado
- `delivered` → entregado
- `read` → abierto (leído)
- `failed` → fallido

### Testing Webhooks Localmente

Usar ngrok para exponer localhost:

```bash
ngrok http 8000

# Usar URL generada: https://abc123.ngrok.io/api/webhooks/twilio/sms
```

---

## Testing

### Comando de Testing

```bash
# Probar todas las integraciones
php artisan test:integrations

# Probar solo Twilio
php artisan test:integrations --service=twilio

# Probar con envío real
php artisan test:integrations --service=twilio --to=+573001234567
php artisan test:integrations --service=ses --to=test@example.com
php artisan test:integrations --service=whatsapp --to=573001234567
```

### Output Esperado

```
🧪 Probando Integraciones de Comunicación
==========================================

📱 Probando Twilio SMS...
✅ Configuración OK
✅ Conexión OK - Account: Electoral Platform
✅ SMS enviado - SID: SM1234567890abcdef

📧 Probando AWS SES Email...
✅ Configuración OK
✅ Conexión OK
   Max 24h: 50,000
   Sent 24h: 120
   Send rate: 14 emails/sec
✅ Email enviado - Message ID: 0100018d1234abcd

💬 Probando WhatsApp Business API...
✅ Configuración OK
✅ Conexión OK
   Phone: +15551234567
   Quality: GREEN
   Templates disponibles: 5
✅ Mensaje enviado - ID: wamid.HBgNNTczMDA...

📊 Resumen de Pruebas
====================

| Servicio            | Configurado | Conexión | Envío Prueba |
|---------------------|-------------|----------|--------------|
| Twilio SMS          | ✅          | ✅       | ✅           |
| AWS SES             | ✅          | ✅       | ✅           |
| WhatsApp Business   | ✅          | ✅       | ✅           |

🎉 ¡Todas las integraciones están listas! (3/3)
```

---

## Comandos Artisan

### 1. Importar Municipios

```bash
# Desde API (datos hardcoded)
php artisan import:municipios --source=api

# Desde archivo CSV
php artisan import:municipios --file=database/seeders/data/municipios.csv
```

### 2. Importar Censo Electoral

```bash
# Importar censo desde Excel/CSV
php artisan import:censo censo_2027.xlsx --campana_id=1 --version="2027-Territoriales"

# Con opciones adicionales
php artisan import:censo censo.csv \
  --campana_id=1 \
  --version="Actualización-Dic2025" \
  --chunk=2000 \
  --skip-duplicates
```

### 3. Testing de Integraciones

```bash
# Ver sección Testing arriba
php artisan test:integrations
```

---

## Troubleshooting

### Problema: SMS no se envían

**Solución:**
```bash
# 1. Verificar configuración
php artisan test:integrations --service=twilio

# 2. Verificar queue worker está corriendo
ps aux | grep "queue:work"

# 3. Ver logs
tail -f storage/logs/laravel.log

# 4. Verificar balance en Twilio Console
```

### Problema: Emails van a SPAM

**Solución:**
- Verificar dominio en AWS SES
- Configurar registros SPF, DKIM, DMARC
- Usar Configuration Set con reputación tracking
- Evitar palabras spam en asunto

### Problema: WhatsApp rechaza mensajes

**Solución:**
- Solo se pueden enviar templates aprobados por Meta
- Verificar Quality Rating del número
- No exceder rate limits (10 msg/sec)
- Números deben estar en formato correcto (sin +)

### Problema: Webhooks no llegan

**Solución:**
```bash
# 1. Verificar URL es pública y accesible
curl https://tudominio.com/api/webhooks/twilio/sms

# 2. Ver logs del servidor
tail -f /var/log/nginx/access.log

# 3. Usar ngrok para desarrollo local
ngrok http 8000

# 4. Verificar configuración en panel del proveedor
```

### Problema: Queue worker muere

**Solución:**
```bash
# Usar supervisor para auto-restart
sudo apt install supervisor

# Crear config en /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/var/log/laravel-worker.log

# Recargar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

---

## Métricas y Monitoreo

### Estadísticas de Campaña

```php
GET /api/comunicacion/campanas/{id}/estadisticas

{
  "campana": "Invitación Evento",
  "estado": "completada",
  "canal": "sms",
  "envio": {
    "total_destinatarios": 10000,
    "total_enviados": 9850,
    "total_entregados": 9720,
    "total_fallidos": 150,
    "tasa_entrega": 98.68
  },
  "engagement": {
    "total_abiertos": 0,  // N/A para SMS
    "total_clicks": 0,
    "tasa_apertura": 0,
    "tasa_clicks": 0
  },
  "fechas": {
    "programada": "2025-12-25 14:00:00",
    "real": "2025-12-25 14:00:15",
    "completada": "2025-12-25 14:45:23"
  }
}
```

---

## Costos Estimados

### Escenario: Campaña con 100,000 votantes

| Canal | Cantidad | Costo Unitario | Total |
|-------|----------|----------------|-------|
| SMS (Twilio) | 50,000 | $0.0075 | $375 |
| Email (SES) | 40,000 | $0.0001 | $4 |
| WhatsApp | 10,000 | $0.01 | $100 |
| **TOTAL** | **100,000** | - | **$479** |

---

## Próximos Pasos

- [ ] Implementar reintentos inteligentes según error
- [ ] Dashboard en tiempo real con WebSockets
- [ ] A/B testing de campañas
- [ ] Integración con Google Analytics
- [ ] Reportes automáticos CNE
- [ ] Optimización de costos (routing inteligente)
- [ ] Multi-canal (SMS + Email + WhatsApp en una campaña)

---

**Documentación actualizada:** 28 Diciembre 2025
**Autor:** Claude Code & Equipo de Desarrollo
**Versión:** 1.0.0
