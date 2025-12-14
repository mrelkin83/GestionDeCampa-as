# ARQUITECTURA GENERAL DEL SISTEMA

## 🎯 Visión Arquitectónica

Arquitectura **híbrida desacoplada** con separación estricta de responsabilidades entre:
- **Backend Core:** Gestión, CRM, Compliance (Laravel)
- **Backend Día D:** Tiempo real, conteo paralelo (NestJS)
- **Frontend:** Administrativo (Web) + Operativo (PWA)

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CAPA DE USUARIO                               │
├────────────────────────────┬────────────────────────────────────────────┤
│   Web Administrativa       │         PWA Móvil (Offline-First)          │
│   (Tailwind + Alpine.js)   │      (Testigos, Brigadistas, Campo)        │
│                            │                                            │
│   Roles:                   │   Características:                         │
│   • Director Campaña       │   • Offline-first (IndexedDB)              │
│   • Coordinador            │   • Captura foto + GPS                     │
│   • Administrador          │   • Sin Play Store                         │
│                            │   • Service Worker                         │
└─────────────┬──────────────┴─────────────────┬──────────────────────────┘
              │                                │
              │         API Gateway / Load Balancer
              │              (NGINX + SSL)
              │                                │
┌─────────────▼────────────────────────────────▼──────────────────────────┐
│                         CAPA DE APLICACIÓN                               │
├──────────────────────────────────┬───────────────────────────────────────┤
│   BACKEND CORE (Laravel 11)      │   BACKEND DÍA D (NestJS)             │
│   Puerto: 8000                   │   Puerto: 3000                       │
│                                  │                                       │
│   Responsabilidades:             │   Responsabilidades:                  │
│   ├─ CRM Político                │   ├─ WebSockets (Socket.io)          │
│   ├─ Gestión Campañas            │   ├─ Conteo Paralelo Real-Time       │
│   ├─ Censo Electoral             │   ├─ Recepción Actas                 │
│   ├─ Estructura Electoral        │   ├─ Validación Automática           │
│   ├─ Donaciones                  │   ├─ Sincronización Offline→Online   │
│   ├─ Eventos                     │   ├─ Alertas e Inconsistencias       │
│   ├─ Comunicación Multicanal     │   ├─ Agregación Conteo               │
│   ├─ Reportes Regulatorios       │   └─ Auditoría Inmutable             │
│   ├─ Georreferenciación          │                                       │
│   └─ Inteligencia Artificial     │                                       │
│                                  │                                       │
│   Stack:                         │   Stack:                              │
│   • PHP 8.2                      │   • Node.js 20 LTS                    │
│   • Laravel 11                   │   • NestJS 10                         │
│   • Eloquent ORM                 │   • TypeORM                           │
│   • Laravel Queue                │   • Socket.io                         │
│   • Laravel Sanctum (Auth)       │   • Bull (Queue)                      │
│                                  │   • JWT                               │
└──────────────┬───────────────────┴─────────────┬─────────────────────────┘
               │                                 │
               │    ┌────────────────────────────┴──────────────────┐
               │    │      Message Queue & Pub/Sub                  │
               │    │      (Redis Pub/Sub + Bull)                   │
               │    │                                               │
               │    │   Canales:                                    │
               │    │   • actas.procesadas                          │
               │    │   • alertas.criticas                          │
               │    │   • sincronizacion.pendiente                  │
               │    │   • conteo.actualizado                        │
               │    └───────────────────────────────────────────────┘
               │                                 │
┌──────────────▼─────────────────────────────────▼─────────────────────────┐
│                           CAPA DE DATOS                                   │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   PostgreSQL 15 + PostGIS                      Redis 7                    │
│   ├─ electoral_schema                          ├─ Cache (Laravel)         │
│   │  ├─ departamentos                          ├─ Sessions                │
│   │  ├─ municipios                             ├─ Queues (Bull)           │
│   │  ├─ zonas_electorales                      ├─ Pub/Sub                 │
│   │  ├─ puestos_votacion (GEOGRAPHY)           ├─ Real-time counters      │
│   │  ├─ mesas                                  └─ WebSocket adapter       │
│   │  └─ censo_electoral (versionado)                                      │
│   ├─ crm_schema                                                           │
│   │  ├─ votantes                                                          │
│   │  ├─ lideres                                                           │
│   │  ├─ contactos                                                         │
│   │  ├─ segmentos                                                         │
│   │  └─ scores_ia                                                         │
│   ├─ compliance_schema                                                    │
│   │  ├─ donaciones                                                        │
│   │  ├─ donantes                                                          │
│   │  ├─ topes_legales                                                     │
│   │  └─ reportes_regulatorios                                             │
│   ├─ diad_schema                                                          │
│   │  ├─ testigos_electorales                                              │
│   │  ├─ actas                                                             │
│   │  ├─ conteo_agregado                                                   │
│   │  ├─ alertas_diad                                                      │
│   │  └─ auditoria_diad (append-only)                                      │
│   └─ communication_schema                                                 │
│      ├─ campanas_comunicacion                                             │
│      ├─ mensajes                                                          │
│      └─ templates                                                         │
│                                                                           │
│   Características:                                                        │
│   • Multi-AZ (Alta disponibilidad)                                        │
│   • Read Replicas (3) para reportes                                       │
│   • Backups automáticos cada 30 min (Día D)                               │
│   • Point-in-time recovery                                                │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│   S3-Compatible Storage                        Elasticsearch 8 (Opcional)│
│   (AWS S3 / MinIO)                                                        │
│   ├─ actas/ (fotos originales)                ├─ Logs centralizados      │
│   ├─ documentos-legales/                      ├─ Full-text search         │
│   ├─ reportes-generados/                      └─ Analytics                │
│   ├─ backups/                                                             │
│   └─ exports/                                                             │
│                                                                           │
│   Políticas:                                                              │
│   • Versionado habilitado                                                 │
│   • Lifecycle: Glacier después 90 días                                    │
│   • Encriptación en reposo (AES-256)                                      │
│   • WORM para datos legales                                               │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                         SERVICIOS EXTERNOS                                │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   Comunicación:                        Geolocalización:                   │
│   • WhatsApp Business API              • Google Maps API                  │
│   • Twilio (SMS)                       • Mapbox                           │
│   • Infobip (SMS Backup)               • PostGIS (interno)                │
│   • AWS SES (Email)                                                       │
│   • SendGrid (Email Backup)            IA/ML:                             │
│                                        • AWS Textract (OCR)                │
│   CDN:                                 • OpenAI API (opcional)             │
│   • CloudFront / CloudFlare            • TensorFlow (scoring local)       │
│                                                                           │
│   Monitoreo:                           Pagos (opcional):                  │
│   • Datadog / New Relic                • PayU / Wompi                     │
│   • Sentry (Error tracking)            • Bancolombia API                  │
│   • UptimeRobot                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Comunicación Entre Servicios

### 1. Frontend Web ↔ Backend Core (Laravel)

```
Protocolo: REST API (HTTPS)
Autenticación: Laravel Sanctum (SPA tokens)
Puerto: 443 → 8000 (interno)

Flujo:
1. Login → POST /api/v1/auth/login
2. Token → LocalStorage
3. Requests → Header: Authorization: Bearer {token}
4. Rate limiting: 100 req/min por usuario
```

### 2. PWA Móvil ↔ Backend Día D (NestJS)

```
Protocolo:
├─ REST API (sincronización offline)
└─ WebSockets (tiempo real)

WebSocket:
├─ Socket.io client
├─ Rooms: campana:{id}, mesa:{id}, municipio:{id}
├─ Autenticación: JWT en handshake
└─ Heartbeat: ping cada 30 segundos

Eventos:
Cliente → Servidor:
├─ join:campana
├─ acta:nueva
├─ ping

Servidor → Cliente:
├─ acta:procesada
├─ conteo:actualizado
├─ alerta:nueva
└─ sincronizacion:status
```

### 3. Backend Core ↔ Backend Día D

```
Comunicación bidireccional:

A) REST API (sincrónica):
   Laravel → NestJS:
   • POST /internal/testigos/asignados
   • GET /internal/conteo/{campaniaId}

   NestJS → Laravel:
   • GET /internal/votantes/{cedula}
   • GET /internal/mesa/{mesaId}

B) Message Queue (asíncrona):
   Redis Pub/Sub:

   Laravel publica:
   • canal: testigos.asignados
   • canal: estructura.actualizada

   NestJS publica:
   • canal: actas.procesadas
   • canal: alertas.criticas

   Ambos suscriben a canales relevantes
```

### 4. ¿Qué Datos Viven Dónde?

| Dato | Backend Core (Laravel) | Backend Día D (NestJS) | Sincronización |
|------|------------------------|------------------------|----------------|
| **Censo Electoral** | ✅ Maestro (PostgreSQL) | 🔄 Cache Redis (solo mesas asignadas) | Pub/Sub al asignar testigos |
| **Votantes CRM** | ✅ Único (PostgreSQL) | ❌ | API call si necesario |
| **Estructura Electoral** | ✅ Maestro (PostgreSQL) | 🔄 Réplica (PostgreSQL read-replica) | Readonly |
| **Donaciones** | ✅ Único (PostgreSQL) | ❌ | N/A |
| **Eventos** | ✅ Único (PostgreSQL) | ❌ | N/A |
| **Comunicaciones** | ✅ Único (PostgreSQL) | ❌ | N/A |
| **Testigos Asignados** | ✅ Maestro (PostgreSQL) | 🔄 Réplica + Cache | Pub/Sub en tiempo real |
| **Actas** | ❌ | ✅ Único (PostgreSQL + S3) | N/A |
| **Conteo Paralelo** | ❌ (solo lectura API) | ✅ Único (Redis + PostgreSQL) | N/A |
| **Alertas Día D** | ❌ (solo lectura API) | ✅ Único (PostgreSQL) | N/A |
| **Auditoría Día D** | ❌ | ✅ Único append-only (PostgreSQL) | N/A |

## 🔐 Seguridad

### Autenticación y Autorización

```
Sistema de Roles (RBAC):

├─ Super Admin
│  └─ Acceso total, gestión multi-campaña
│
├─ Admin Campaña
│  └─ Acceso completo a su campaña
│
├─ Director Campaña
│  └─ Lectura/escritura datos operativos
│
├─ Coordinador Territorial
│  └─ Acceso a su municipio/zona
│
├─ Brigadista
│  └─ Registro contactos, eventos
│
└─ Testigo Electoral
   └─ Solo captura actas de sus mesas
```

### Protección de Datos

```
├─ HTTPS obligatorio (TLS 1.3)
├─ JWT tokens corta duración (15 min)
├─ Refresh tokens (7 días)
├─ Encriptación datos sensibles (AES-256)
├─ Hash passwords (bcrypt cost 12)
├─ SQL Injection: ORM prevención
├─ XSS: Sanitización output
├─ CSRF: Tokens Laravel
├─ Rate Limiting:
│  ├─ API: 100 req/min por IP
│  ├─ Login: 5 intentos/15 min
│  └─ WebSocket: 1000 eventos/min
├─ Secrets en AWS Secrets Manager
└─ WAF (Web Application Firewall)
```

## 📊 Escalabilidad

### Horizontal Scaling

```
Backend Core (Laravel):
├─ Load Balancer (Application Load Balancer)
├─ Auto Scaling Group (2-10 instancias)
│  ├─ Normal: 2 instancias
│  ├─ Día D: 5-10 instancias
│  └─ Trigger: CPU >70% o Requests >500/min
└─ Sesiones en Redis (stateless)

Backend Día D (NestJS):
├─ Load Balancer (ALB)
├─ Auto Scaling Group (3-20 instancias)
│  ├─ Normal: 3 instancias
│  ├─ Día D: 10-20 instancias
│  └─ Trigger: WebSocket connections >1000/instancia
├─ Redis Adapter para Socket.io (sticky sessions)
└─ Bull Queue workers separados
```

### Vertical Scaling

```
PostgreSQL:
├─ RDS Multi-AZ
├─ Instancia: db.r6g.2xlarge (Día D)
├─ Read Replicas (3):
│  ├─ Reportes
│  ├─ Analytics
│  └─ Backup queries
└─ Connection pooling (PgBouncer)

Redis:
├─ ElastiCache Cluster Mode
├─ 3 shards mínimo
├─ Réplicas por shard: 2
└─ Instancia: cache.r6g.xlarge
```

## 🔄 Alta Disponibilidad

```
Multi-AZ Deployment:
├─ PostgreSQL: Multi-AZ automático
├─ Redis: Cluster con réplicas
├─ Aplicación: 2+ AZs
└─ Load Balancer: Cross-zone

Backups:
├─ PostgreSQL:
│  ├─ Automated backups (35 días retención)
│  ├─ Snapshots manuales pre-Día D
│  └─ Point-in-time recovery
├─ Redis:
│  ├─ AOF (Append Only File)
│  └─ Snapshot cada 1 hora
└─ S3:
   ├─ Versionado habilitado
   └─ Cross-region replication (opcional)

Disaster Recovery:
├─ RTO (Recovery Time Objective): <30 min
├─ RPO (Recovery Point Objective): <5 min
└─ Plan B: Réplica en otra región AWS
```

## 📈 Monitoreo y Observabilidad

```
APM (Application Performance Monitoring):
├─ Datadog / New Relic
├─ Métricas:
│  ├─ Response time (p50, p95, p99)
│  ├─ Throughput (req/s)
│  ├─ Error rate
│  └─ Apdex score
└─ Dashboards por servicio

Logs:
├─ CloudWatch Logs / ELK Stack
├─ Structured logging (JSON)
├─ Niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL
└─ Retención: 90 días

Alertas:
├─ Error rate >1% → PagerDuty
├─ Latencia p95 >500ms → Slack
├─ CPU >80% → Auto-scaling
├─ Memoria >85% → Alerta
├─ Disk >90% → Alerta crítica
└─ Uptime <99.5% → Escalación

Dashboards:
├─ Técnico (Grafana):
│  ├─ Métricas infraestructura
│  ├─ Performance APIs
│  └─ Queue health
└─ Operativo (Custom):
   ├─ Mesas reportadas
   ├─ Testigos conectados
   └─ Alertas Día D
```

## 🚨 Manejo de Fallos

### ¿Qué pasa cuando falla internet el Día D?

```
Escenario: Testigo sin conectividad

PWA (Cliente):
├─ Detecta offline (navigator.onLine)
├─ Continúa funcionamiento normal:
│  ├─ Captura acta (foto + formulario)
│  ├─ Almacena en IndexedDB
│  ├─ Marca como "Pendiente sincronización"
│  └─ UI muestra indicador offline
│
└─ Cuando reconecta:
   ├─ Service Worker detecta online
   ├─ Sync Manager activa sync
   ├─ Envía actas pendientes (cola FIFO)
   ├─ UI actualiza estado
   └─ WebSocket reconecta

Backend (Servidor):
├─ Recibe actas "atrasadas"
├─ Valida timestamp captura vs timestamp recepción
├─ Si delta <6 horas → acepta
├─ Si delta >6 horas → marca para revisión
├─ Procesa normalmente (validación, conteo, alertas)
└─ Responde con confirmación
```

### ¿Qué pasa si cae AWS?

```
Plan de Contingencia:

Nivel 1 (Preferred):
├─ Multi-AZ automático (failover <60s)
└─ Si falla AZ completa, ALB redirige

Nivel 2 (Disaster):
├─ Si falla región completa:
│  ├─ DNS failover a región secundaria
│  ├─ Réplica en standby (us-east-1 → us-west-2)
│  ├─ RTO: 15-30 minutos
│  └─ RPO: <5 minutos (replicación continua)

Nivel 3 (Catastrófico):
├─ Si falla todo AWS:
│  ├─ Activar formularios Google Forms
│  ├─ Google Sheets para conteo manual
│  ├─ WhatsApp groups para coordinación
│  └─ Consolidación post-evento
```

## 🧪 Ambientes

```
Development (Local):
├─ Docker Compose
├─ PostgreSQL local
├─ Redis local
└─ Sin servicios externos (mocks)

Staging:
├─ AWS/GCP
├─ Infraestructura idéntica a producción (menor escala)
├─ RDS db.t3.medium
├─ Redis cache.t3.small
├─ Datos de prueba (censo fake)
└─ Integración con servicios externos (sandbox)

Production:
├─ AWS/GCP Multi-AZ
├─ RDS db.r6g.2xlarge
├─ Redis cache.r6g.xlarge
├─ Auto-scaling habilitado
├─ Datos reales (censo oficial)
└─ Servicios externos (producción)

CI/CD Pipeline:
├─ Push a main → Deploy staging automático
├─ Tag release → Deploy producción manual
├─ Tests automáticos:
│  ├─ Unit tests
│  ├─ Integration tests
│  └─ E2E tests (Cypress)
└─ Rollback automático si falla health check
```

## 📚 Recursos Adicionales

- [Backend Core (Laravel)](01-backend-core.md)
- [Backend Día D (NestJS)](02-backend-diad.md)
- [Frontend y PWA](03-frontend-pwa.md)
- [Infraestructura Cloud](04-infraestructura.md)
- [Seguridad](05-seguridad.md)

---

**Última actualización:** Diciembre 13, 2024
