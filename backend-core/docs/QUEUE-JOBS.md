# Queue Jobs - Guía de Uso

## Resumen

El sistema de **Jobs** procesa tareas asíncronas en segundo plano para no bloquear las respuestas HTTP. Esto mejora drásticamente la experiencia del usuario.

## Jobs Implementados

### 1. RecalcularAgregadosJob
**Cola:** `agregados`

Recalcula los resultados territoriales cuando un coordinador valida un acta.

**Flujo:**
1. Validador aprueba acta
2. Job se encola (async)
3. Job calcula agregados: MESA → PUESTO → MUNICIPIO → DEPARTAMENTO
4. Invalida cache Redis
5. Emite evento WebSocket

**Uso:**
```php
use App\Jobs\RecalcularAgregadosJob;

RecalcularAgregadosJob::dispatch($record)
    ->onQueue('agregados')
    ->delay(now()->addSeconds(2));
```

### 2. ProcesarImagenActaJob
**Cola:** `imagenes`

Procesa la imagen del acta: decode base64, sube a storage, genera thumbnail.

**Flujo:**
1. Testigo sube imagen base64
2. Job se encola (async)
3. Job decode base64, valida formato
4. Guarda en `storage/app/public/actas/`
5. Genera thumbnail en `storage/app/public/actas/thumbnails/`
6. Actualiza registro con URLs

**Uso:**
```php
use App\Jobs\ProcesarImagenActaJob;

ProcesarImagenActaJob::dispatch($evidenceId, $base64Image)
    ->onQueue('imagenes');
```

### 3. NotificarAlertaCriticaJob
**Cola:** `notificaciones`

Envía alertas cuando hay anomalías críticas (boletas > votantes, 100% un candidato, etc.)

**Uso:**
```php
use App\Jobs\NotificarAlertaCriticaJob;

if ($alerta->severidad === 'CRITICAL') {
    NotificarAlertaCriticaJob::dispatch($alerta->id)
        ->onQueue('notificaciones');
}
```

## Configuración de Queue Driver

Editar `.env`:
```env
# Usar Redis para queues
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1
REDIS_QUEUE_DB=2
```

## Configuración de Supervisor

Para mantener los workers corriendo automáticamente:

### 1. Instalar Supervisor
```bash
sudo apt-get install supervisor
```

### 2. Crear archivo de configuración
```bash
sudo nano /etc/supervisor/conf.d/laravel-workers.conf
```

### 3. Copiar configuración
Ver archivo: `docs/supervisor-workers.conf`

### 4. Activar configuración
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-workers:*
```

### 5. Verificar estado
```bash
sudo supervisorctl status
```

## Comandos de Gestión

### Ver colas pendientes
```bash
php artisan queue:monitor redis:agregados,redis:imagenes,redis:notificaciones
```

### Limpiar cola
```bash
php artisan queue:clear redis --queue=agregados
```

### Procesar job manualmente (para debug)
```bash
php artisan queue:work redis --queue=agregados --once --verbose
```

### Ver failed jobs
```bash
php artisan queue:failed
```

### Reintentar failed job
```bash
php artisan queue:retry {id}
```

### Reintentar todos los failed
```bash
php artisan queue:retry all
```

## Workers por Cola

| Cola | Workers | Tareas |
|------|---------|--------|
| `agregados` | 2 | Recalcular agregados |
| `imagenes` | 3 | Procesar imágenes (lento) |
| `notificaciones` | 1 | Alertas críticas |

## Monitoreo

### Logs de Workers
```bash
tail -f storage/logs/worker-agregados.log
tail -f storage/logs/worker-imagenes.log
tail -f storage/logs/worker-notificaciones.log
```

### Métricas Redis
```bash
redis-cli
MONITOR
```

## Troubleshooting

### Jobs no se ejecutan
1. Verificar Redis está corriendo: `redis-cli ping`
2. Verificar QUEUE_CONNECTION en .env
3. Verificar supervisor: `sudo supervisorctl status`
4. Ver logs: `storage/logs/worker-*.log`

### Jobs fallan permanentemente
```bash
php artisan queue:failed
php artisan queue:retry {id}
```

### Reiniciar workers
```bash
sudo supervisorctl restart laravel-workers:*
```

## Test Local (sin Redis)

Para desarrollo local sin Redis, usar driver `sync`:
```env
QUEUE_CONNECTION=sync
```

Los jobs se ejecutarán síncronamente (útil para debug).

## Rendimiento Esperado

| Métrica | Valor |
|---------|-------|
| Jobs agregados/min | ~500 |
| Imágenes procesadas/min | ~30-50 |
| Latencia job agregados | <2s |
| Latencia procesar imagen | 3-10s |
