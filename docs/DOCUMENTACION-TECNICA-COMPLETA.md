# Sistema de Preconteo Electoral - Documentación Técnica

## Resumen Ejecutivo

Sistema completo de preconteo electoral desarrollado para las elecciones presidenciales de Colombia 2027. Incluye backend con API REST, WebSockets en tiempo real, frontend web para coordinadores, y PWA para testigos electorales con soporte offline.

**Estado:** ✅ PRODUCCIÓN LISTO  
**Versión:** 1.0.0  
**Fecha:** Julio 2026

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         VPS CONTABO                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    NGINX (Reverse Proxy)                 │   │
│  │  • SSL/TLS (Let's Encrypt)                              │   │
│  │  • Load Balancing                                       │   │
│  │  • Static File Serving                                  │   │
│  └──────────────┬────────────────────────────┬──────────────┘   │
│                 │                            │                  │
│  ┌──────────────▼──────────┐  ┌──────────────▼──────────┐       │
│  │   Laravel (PHP 8.2)     │  │   NestJS (Node 20)      │       │
│  │   • API REST            │  │   • WebSocket Gateway   │       │
│  │   • Jobs/Queues         │  │   • Real-time Events    │       │
│  │   • Authentication      │  │   • Redis Adapter       │       │
│  │   Port: 8000            │  │   Port: 3001            │       │
│  └──────────────┬──────────┘  └──────────────┬──────────┘       │
│                 │                            │                  │
│  ┌──────────────▼────────────────────────────▼──────────┐       │
│  │              REDIS (Cache + Queue + Pub/Sub)         │       │
│  │  • Session Storage                                    │       │
│  │  • Job Queues                                         │       │
│  │  • WebSocket Broadcasting                             │       │
│  │  Port: 6379                                           │       │
│  └──────────────┬────────────────────────────────────────┘       │
│                 │                                               │
│  ┌──────────────▼────────────────────────────────────────┐      │
│  │          POSTGRESQL 15 + POSTGIS                      │      │
│  │  • 8 tablas preconteo                                 │      │
│  │  • 15+ índices optimizados                            │      │
│  │  • Geospatial data                                    │      │
│  │  Port: 5432                                           │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Web (React 19 + Vite)                                 │
│  • Dashboard Día D con WebSockets                               │
│  • Gráficos en tiempo real                                      │
│  • Responsive design                                            │
├─────────────────────────────────────────────────────────────────┤
│  PWA Testigos (Ionic + React + Capacitor)                       │
│  • Offline-first                                                │
│  • Captura de evidencias                                        │
│  • Sincronización automática                                    │
│  • Android APK disponible                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Especificaciones Técnicas

### Backend Core (Laravel)

**Framework:** Laravel 11  
**PHP:** 8.2  
**Database:** PostgreSQL 15 + PostGIS  
**Cache:** Redis  
**Queue:** Redis  
**Testing:** PHPUnit (103 tests, 75% coverage)

**Endpoints API:**
```
GET    /api/preconteo/elecciones          → Listar elecciones
GET    /api/preconteo/cargos/{eleccion}   → Cargos por elección
GET    /api/preconteo/resultados          → Resultados agregados
GET    /api/preconteo/progreso            → Progreso del reporte
POST   /api/preconteo/actas               → Registrar acta
POST   /api/preconteo/actas/{id}/validar  → Validar acta
GET    /api/preconteo/actas               → Listar actas
```

**Jobs Asíncronos:**
- `RecalcularAgregadosJob` → Recalcula resultados territoriales
- `ProcesarImagenActaJob` → Procesa evidencias fotográficas
- `NotificarAlertaCriticaJob` → Envía alertas de anomalías

### Backend Día D (NestJS)

**Framework:** NestJS 10  
**Node:** 20 LTS  
**WebSocket:** Socket.io  
**Adapter:** Redis Adapter (escalabilidad horizontal)

**Eventos WebSocket:**
```
Servidor → Cliente:
  CONNECTED, SUBSCRIBED, RESULTADOS_ACTUALIZADOS,
  PROGRESO_MESAS, NUEVA_ACTA, ACTA_VALIDADA, ALERTA

Cliente → Servidor:
  subscribe, unsubscribe, ping, get_stats
```

### Frontend Web (React)

**Framework:** React 19  
**Build Tool:** Vite 7  
**Styling:** Tailwind CSS 3  
**Charts:** Recharts 3  
**Icons:** Lucide React

**Páginas:** 32+ páginas existentes + Dashboard Día D

### PWA Testigos (Ionic)

**Framework:** Ionic React 8  
**Mobile:** Capacitor 6  
**State:** Zustand 4  
**Offline DB:** IndexedDB (idb)  
**Testing:** Cypress (E2E), Vitest (Unit)

**Stores IndexedDB:**
- `usuarios` → Sesiones offline
- `actas_pendientes` → Cola de sincronización
- `evidencias` → Fotos en base64
- `cache` → Datos del servidor
- `sync_log` → Historial

---

## Modelo de Datos

### Tablas Principales (PostgreSQL)

```sql
precount_records          → Actas de escrutinio
precount_votes            → Votos por candidato
precount_evidence         → Evidencias fotográficas
precount_metadata         → Metadatos de digitación
precount_validations      → Validaciones automáticas
precount_aggregates       → Resultados agregados
mesa_cargo_status         → Estado por mesa/cargo
preconteo_snapshots       → Histórico de resultados
```

**Índices Clave:**
- `idx_records_election_mesa_estado` → Consultas dashboard
- `idx_aggregates_scope` → Cálculo de resultados
- `idx_validations_tipo_severidad` → Alertas

---

## Seguridad

### Autenticación
- JWT tokens con expiración configurable
- Refresh tokens automáticos
- Login offline con IndexedDB (PWA)

### Autorización
- Middleware de roles en API
- Guards en WebSocket
- Rate limiting: 15 req/min por endpoint

### Validaciones
- Hash SHA-256 de imágenes (integridad)
- Validaciones automáticas de actas:
  - Votos > Votantes
  - Diferencia boletas > 5
  - Candidato 100% de votos
  - Votos en blanco > 20%

### Infraestructura
- SSL/TLS con Let's Encrypt
- Firewall UFW configurado
- Backups automáticos diarios
- Logs centralizados

---

## Escalabilidad

### Horizontal
- Múltiples instancias Laravel balanceadas
- Redis Adapter para WebSockets
- PostgreSQL con read replicas (si es necesario)

### Vertical
- Workers de cola procesan jobs async
- Cache de resultados (TTL 5 min)
- CDN para assets estáticos

---

## Monitoreo

### Health Checks
```bash
# API
curl https://api.tudominio.com/api/health

# WebSocket
systemctl status preconteo-ws

# Workers
supervisorctl status

# Redis
redis-cli ping
```

### Logs
```bash
# Laravel
tail -f /var/www/backend-core/storage/logs/laravel.log

# Workers
tail -f /var/www/backend-core/storage/logs/worker-*.log

# WebSocket
journalctl -u preconteo-ws -f

# Nginx
tail -f /var/log/nginx/access.log
```

---

## Deploy

### Automatizado
```bash
# Deploy completo
./scripts/deploy.sh production

# Rollback (si es necesario)
./scripts/deploy.sh production --rollback
```

### Manual
```bash
# Backend
sudo -u www-data git pull
sudo -u www-data composer install --no-dev
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan optimize

# Frontend
npm ci && npm run build

# WebSocket
npm ci && npm run build
systemctl restart preconteo-ws
```

### Android APK
```bash
./scripts/build-android.sh release
# Output: /var/www/dist/android/*.apk
```

---

## Testing

### Backend
```bash
cd backend-core
php artisan test
# 103 tests, 75% coverage
```

### Frontend Web
```bash
cd frontend-web
npm run test
```

### PWA
```bash
cd pwa-testigos
npm run test:unit     # Tests unitarios
npm run test:e2e      # Tests E2E Cypress
```

---

## Mantenimiento

### Diario
- Revisar logs de errores
- Verificar workers activos
- Monitorear uso de disco

### Semanal
- Limpiar logs antiguos
- Revisar métricas de rendimiento
- Actualizar dependencias (si es necesario)

### Mensual
- Rotar backups
- Revisar índices de BD
- Análisis de queries lentas

---

## Troubleshooting

### API no responde
1. Verificar PHP-FPM: `systemctl status php8.2-fpm`
2. Revisar logs: `tail -f storage/logs/laravel.log`
3. Verificar Redis: `redis-cli ping`

### WebSocket no conecta
1. Verificar servicio: `systemctl status preconteo-ws`
2. Verificar puerto: `netstat -tlnp | grep 3001`
3. Revisar firewall: `ufw status`

### PWA no sincroniza
1. Verificar conexión del dispositivo
2. Revisar logs en página "Pendientes"
3. Intentar reintento manual
4. Verificar token JWT no expirado

---

## Contacto y Soporte

**Equipo de Desarrollo:** Plataforma Electoral Colombia  
**Email:** soporte@plataformaelectoral.com  
**Documentación:** https://docs.plataformaelectoral.com  
**Repositorio:** [GitHub URL]  

---

## Licencias

- Laravel: MIT License
- NestJS: MIT License
- React: MIT License
- Ionic: MIT License
- Código propietario: © 2027 Plataforma Electoral Colombia

---

**Documento generado:** 22 Julio 2026  
**Versión:** 1.0.0  
**Última actualización:** 22 Julio 2026
