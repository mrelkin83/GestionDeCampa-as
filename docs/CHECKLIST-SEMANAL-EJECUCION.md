# ✅ CHECKLIST SEMANAL DE EJECUCIÓN
## Plan de Trabajo - Completar Desarrollo Electoral

**Fecha Inicio:** 7 de Mayo, 2026  
**Fecha Objetivo:** 24 de Octubre, 2027  
**Documento Principal:** `PLAN-TRABAJO-COMPLETAR-DESARROLLO.md`

---

## 📅 SEMANA 1 (7-13 Mayo 2026)
### 🔴 FASE 1: Backend Día D - Migraciones Base

### Día 1 (Lunes) - Setup Inicial
- [ ] 1.1 Revisar estado actual backend-diad
- [ ] 1.2 Crear archivo migración: `2024_05_07_000001_create_preconteo_tables.php`
- [ ] 1.3 Definir estructura tabla `precount_records`
- [ ] 1.4 Commit inicial: "feat: migraciones base preconteo"

### Día 2 (Martes) - Tablas Core
- [ ] 2.1 Crear tabla `precount_votes`
- [ ] 2.2 Crear tabla `precount_evidence`
- [ ] 2.3 Crear tabla `precount_metadata`
- [ ] 2.4 Ejecutar migraciones en local

### Día 3 (Miércoles) - Validaciones y Agregados
- [ ] 3.1 Crear tabla `precount_validations`
- [ ] 3.2 Crear tabla `precount_aggregates`
- [ ] 3.3 Crear tabla `mesa_cargo_status`
- [ ] 3.4 Verificar todas las tablas en PostgreSQL

### Día 4 (Jueves) - Índices y Performance
- [ ] 4.1 Crear índices críticos (por mesa, estado, cargo)
- [ ] 4.2 Agregar constraints y foreign keys
- [ ] 4.3 Testear migraciones `php artisan migrate:fresh`
- [ ] 4.4 Documentar schema en `docs/database/schema-update.md`

### Día 5 (Viernes) - Seeders y Testing
- [ ] 5.1 Crear seeder `PrecountTestSeeder` (10 registros prueba)
- [ ] 5.2 Ejecutar `php artisan db:seed --class=PrecountTestSeeder`
- [ ] 5.3 Verificar datos en BD
- [ ] 5.4 Commit: "feat: migraciones preconteo completas"

### Día 6 (Sábado) - Revisión y Ajustes
- [ ] 6.1 Revisión código con linter
- [ ] 6.2 Optimizar índices si es necesario
- [ ] 6.3 Preparar semana 2

**Entregable Semana 1:** ✅ Base de datos preconteo completa y funcional

---

## 📅 SEMANA 2 (14-20 Mayo 2026)
### Modelos Eloquent y Relaciones

### Día 1 (Lunes) - Modelos Core
- [ ] 1.1 Crear `PrecountRecord.php` con fillables y casts
- [ ] 1.2 Crear `PrecountVote.php` con relación a Record
- [ ] 1.3 Crear `PrecountEvidence.php`
- [ ] 1.4 Commit: "feat: modelos preconteo base"

### Día 2 (Martes) - Metadata y Validaciones
- [ ] 2.1 Crear `PrecountMetadata.php`
- [ ] 2.2 Crear `PrecountValidation.php`
- [ ] 2.3 Crear `PrecountAggregate.php`
- [ ] 2.4 Crear `MesaCargoStatus.php`

### Día 3 (Miércoles) - Relaciones
- [ ] 3.1 Definir relaciones en PrecountRecord (hasMany votes, evidence)
- [ ] 3.2 Definir belongsTo en modelos hijos
- [ ] 3.3 Agregar scopes útiles (byEstado, byMesa)
- [ ] 3.4 Testing básico de relaciones

### Día 4 (Jueves) - Accesors y Mutators
- [ ] 4.1 Agregar accessor `totalVotos` en Record
- [ ] 4.2 Agregar accessor `porcentaje` en Aggregate
- [ ] 4.3 Mutator para normalizar datos
- [ ] 4.4 Commit: "feat: relaciones y accesors modelos"

### Día 5 (Viernes) - Testing Modelos
- [ ] 5.1 Crear `tests/Unit/PrecountRecordTest.php`
- [ ] 5.2 Test crear record con votos
- [ ] 5.3 Test relaciones eager loading
- [ ] 5.4 Test scopes

### Día 6 (Sábado) - Documentación
- [ ] 6.1 Documentar modelos con PHPDoc
- [ ] 6.2 Actualizar diagrama ERD
- [ ] 6.3 Preparar semana 3

**Entregable Semana 2:** ✅ Modelos Eloquent completos con relaciones

---

## 📅 SEMANA 3 (21-27 Mayo 2026)
### API REST Preconteo - Parte 1

### Día 1 (Lunes) - Controller Base
- [ ] 1.1 Crear `PrecountController.php`
- [ ] 1.2 Implementar `getElecciones()`
- [ ] 1.3 Implementar `getCargosByEleccion()`
- [ ] 1.4 Commit: "feat: precount controller base"

### Día 2 (Martes) - Endpoints Públicos
- [ ] 2.1 Implementar `getResultados()`
- [ ] 2.2 Validar parámetros scope_type, scope_id
- [ ] 2.3 Implementar eager loading de candidatos
- [ ] 2.4 Test con Postman

### Día 3 (Miércoles) - Progreso y Estadísticas
- [ ] 3.1 Implementar `getProgreso()`
- [ ] 3.2 Calcular totales, reportadas, observadas, pendientes
- [ ] 3.3 Agregar filtros por municipio
- [ ] 3.4 Testing endpoints

### Día 4 (Jueves) - Rutas API
- [ ] 4.1 Agregar rutas públicas en `api.php`
- [ ] 4.2 Test rutas: `/api/preconteo/elecciones`
- [ ] 4.3 Test rutas: `/api/preconteo/resultados`
- [ ] 4.4 Commit: "feat: endpoints públicos preconteo"

### Día 5 (Viernes) - Documentación API
- [ ] 5.1 Documentar GET /api/preconteo/elecciones
- [ ] 5.2 Documentar GET /api/preconteo/resultados
- [ ] 5.3 Documentar GET /api/preconteo/progreso
- [ ] 5.4 Agregar ejemplos JSON

### Día 6 (Sábado) - Testing Integración
- [ ] 6.1 Test integración con frontend existente
- [ ] 6.2 Verificar autenticación no requerida en endpoints públicos
- [ ] 6.3 Performance test básico

**Entregable Semana 3:** ✅ Endpoints públicos API documentados y funcionales

---

## 📅 SEMANA 4 (28 Mayo - 3 Junio 2026)
### API REST Preconteo - Parte 2 (Endpoints Internos)

### Día 1 (Lunes) - Store Acta Endpoint
- [ ] 1.1 Implementar `storeActa()`
- [ ] 1.2 Validar request (polling_table_id, election_position_id, etc.)
- [ ] 1.3 Transaction DB para atomicidad
- [ ] 1.4 Determinar versión automáticamente

### Día 2 (Martes) - Guardado de Datos
- [ ] 2.1 Crear PrecountRecord
- [ ] 2.2 Guardar PrecountVotes (loop resultados)
- [ ] 2.3 Guardar PrecountEvidence (imagen)
- [ ] 2.4 Guardar PrecountMetadata (GPS, dispositivo)

### Día 3 (Miércoles) - Validaciones Automáticas
- [ ] 3.1 Implementar `ejecutarValidaciones()`
- [ ] 3.2 Validación suma de votos == sufragantes
- [ ] 3.3 Validación votos no superan sufragantes
- [ ] 3.4 Validación mesa duplicada

### Día 4 (Jueves) - Estado y Agregados
- [ ] 4.1 Actualizar `mesa_cargo_status`
- [ ] 4.2 Implementar `recalcularAgregados()`
- [ ] 4.3 Calcular scopes: MESA, PUESTO, MUNICIPIO, DEPARTAMENTO
- [ ] 4.4 Commit: "feat: endpoint store acta completo"

### Día 5 (Viernes) - Endpoint Validar
- [ ] 5.1 Implementar `validarActa()`
- [ ] 5.2 Acción VALIDAR → estado VALIDADA
- [ ] 5.3 Acción OBSERVAR → estado OBSERVADA
- [ ] 5.4 Recalcular agregados si se valida

### Día 6 (Sábado) - Testing Completo
- [ ] 6.1 Test crear acta exitoso
- [ ] 6.2 Test validación suma incorrecta
- [ ] 6.3 Test validar acta por coordinador
- [ ] 6.4 Documentar edge cases

**Entregable Semana 4:** ✅ API completa para captura y validación de actas

---

## 📅 SEMANA 5 (4-10 Junio 2026)
### WebSockets Tiempo Real

### Día 1 (Lunes) - Setup NestJS WebSocket
- [ ] 1.1 Instalar `@nestjs/websockets` y `@nestjs/platform-socket.io`
- [ ] 1.2 Crear `PreconteoGateway`
- [ ] 1.3 Configurar namespace `/ws/preconteo`
- [ ] 1.4 Implementar `handleConnection` y `handleDisconnect`

### Día 2 (Martes) - Suscripción a Eventos
- [ ] 2.1 Implementar `@SubscribeMessage('subscribe')`
- [ ] 2.2 Crear rooms por scope (MESA:123:456)
- [ ] 2.3 Manejar desuscripción
- [ ] 2.4 Testing con socket.io-client

### Día 3 (Miércoles) - Emisión de Eventos
- [ ] 3.1 Implementar `emitirActualizacion()`
- [ ] 3.2 Implementar `emitirProgreso()`
- [ ] 3.3 Implementar `emitirAlerta()`
- [ ] 3.4 Integrar emisión en PrecountController

### Día 4 (Jueves) - Redis Adapter
- [ ] 4.1 Configurar Redis adapter para WebSockets
- [ ] 4.2 Permitir múltiples instancias NestJS
- [ ] 4.3 Test con múltiples conexiones
- [ ] 4.4 Commit: "feat: websockets tiempo real"

### Día 5 (Viernes) - Testing WebSockets
- [ ] 5.1 Test suscripción a room
- [ ] 5.2 Test recepción actualizaciones
- [ ] 5.3 Test reconexión automática
- [ ] 5.4 Performance test (100 conexiones)

### Día 6 (Sábado) - Documentación
- [ ] 6.1 Documentar protocolo WebSocket
- [ ] 6.2 Ejemplos de uso cliente
- [ ] 6.3 Troubleshooting guide

**Entregable Semana 5:** ✅ Sistema tiempo real con WebSockets funcionando

---

## 📅 SEMANA 6 (11-17 Junio 2026)
### Jobs Asíncronos y Optimización

### Día 1 (Lunes) - Job Recalcular Agregados
- [ ] 1.1 Crear `RecalcularAgregadosJob`
- [ ] 1.2 Implementar lógica de cálculo
- [ ] 1.3 Dispatch async desde controller
- [ ] 1.4 Configurar cola en Redis

### Día 2 (Martes) - Job Procesar Imagen
- [ ] 2.1 Crear `ProcesarImagenActaJob`
- [ ] 2.2 Subir a S3
- [ ] 2.3 Generar thumbnail
- [ ] 2.4 Actualizar registro con URL

### Día 3 (Miércoles) - Supervisor y Workers
- [ ] 3.1 Configurar Supervisor para queue workers
- [ ] 3.2 Crear config `/etc/supervisor/conf.d/laravel-worker.conf`
- [ ] 3.3 Iniciar workers (4 procesos)
- [ ] 3.4 Monitorear cola con Horizon

### Día 4 (Jueves) - Testing Jobs
- [ ] 4.1 Test job dispatch
- [ ] 4.2 Test ejecución async
- [ ] 4.3 Test failure y retry
- [ ] 4.4 Verificar performance

### Día 5 (Viernes) - Cache Redis
- [ ] 5.1 Implementar cache en `getResultados()`
- [ ] 5.2 TTL 5 minutos
- [ ] 5.3 Invalidar cache al validar acta
- [ ] 5.4 Testing cache hits/misses

### Día 6 (Sábado) - Revisión y Ajustes
- [ ] 6.1 Revisar logs de workers
- [ ] 6.2 Optimizar queries lentas
- [ ] 6.3 Ajustar prioridades jobs

**Entregable Semana 6:** ✅ Procesamiento async y cache implementados

---

## 📅 SEMANA 7 (18-24 Junio 2026)
### Testing Backend y Documentación

### Día 1-2 (Lunes-Martes) - Unit Tests
- [ ] 1. Crear `PrecountRecordTest`
- [ ] 2. Test crear record con votos
- [ ] 3. Test validaciones automáticas
- [ ] 4. Test recalcular agregados
- [ ] 5. Test scopes y relaciones
- [ ] 6. Cobertura >70%

### Día 3-4 (Miércoles-Jueves) - Feature Tests
- [ ] 1. Test GET /api/preconteo/resultados
- [ ] 2. Test POST /api/internal/preconteo/acta
- [ ] 3. Test validación suma incorrecta
- [ ] 4. Test validar acta coordinador
- [ ] 5. Test autenticación requerida

### Día 5 (Viernes) - Performance Testing
- [ ] 1. Test carga: 1000 requests/min
- [ ] 2. Test DB con 100k registros
- [ ] 3. Optimizar queries lentas
- [ ] 4. Documentar benchmarks

### Día 6 (Sábado) - Documentación API Final
- [ ] 1. Actualizar `API-DOCUMENTATION.md`
- [ ] 2. Agregar sección Preconteo
- [ ] 3. Ejemplos request/response
- [ ] 4. Documentar WebSockets

**Entregable Semana 7:** ✅ Backend Día D testeado y documentado

---

## 📅 SEMANA 8 (25 Junio - 1 Julio 2026)
### 🔴 FASE 2: PWA Testigos - Setup Base

### Día 1 (Lunes) - Estructura PWA
- [ ] 1.1 Crear carpeta `pwa-testigos/`
- [ ] 1.2 Setup Vite + React + TypeScript
- [ ] 1.3 Instalar `vite-plugin-pwa`
- [ ] 1.4 Configurar `vite.config.ts` con PWA

### Día 2 (Martes) - Manifest y Service Worker
- [ ] 2.1 Crear `manifest.json`
- [ ] 2.2 Configurar Service Worker autogenerado
- [ ] 2.3 Agregar icons (192x192, 512x512)
- [ ] 2.4 Test instalación PWA

### Día 3 (Miércoles) - IndexedDB Setup
- [ ] 3.1 Instalar `idb`
- [ ] 3.2 Crear `services/storage.ts`
- [ ] 3.3 Definir schema IndexedDB
- [ ] 3.4 Test crear/get datos

### Día 4 (Jueves) - Store Global (Zustand)
- [ ] 4.1 Instalar Zustand
- [ ] 4.2 Crear store auth
- [ ] 4.3 Crear store actas
- [ ] 4.4 Crear store sync

### Día 5 (Viernes) - Páginas Base
- [ ] 5.1 Crear `pages/Login.tsx`
- [ ] 5.2 Crear `pages/Dashboard.tsx`
- [ ] 5.3 Crear `pages/CaptureActa.tsx` (vacía)
- [ ] 5.4 Routing con React Router

### Día 6 (Sábado) - Testing PWA
- [ ] 6.1 Test en Chrome DevTools (mobile)
- [ ] 6.2 Verificar instalación
- [ ] 6.3 Test offline básico

**Entregable Semana 8:** ✅ PWA instalable con estructura base

---

## 📅 SEMANA 9 (2-8 Julio 2026)
### PWA - IndexedDB y Storage

### Día 1-2 (Lunes-Martes) - Storage Service
- [ ] 1. Implementar `guardarActa()`
- [ ] 2. Implementar `obtenerActasPendientes()`
- [ ] 3. Implementar `marcarActaSincronizada()`
- [ ] 4. Implementar `actualizarEstadoActa()`
- [ ] 5. Testing storage service

### Día 3 (Miércoles) - Cache Mesas
- [ ] 1. Implementar `guardarMesasCache()`
- [ ] 2. Implementar `obtenerMesasCache()`
- [ ] 3. Sync mesas al iniciar app
- [ ] 4. Test offline con mesas cacheadas

### Día 4 (Jueves) - UI Storage
- [ ] 1. Mostrar número actas pendientes en Dashboard
- [ ] 2. Indicador visual estado sync
- [ ] 3. Toast notificaciones
- [ ] 4. Testing UI

### Día 5 (Viernes) - Página CaptureActa UI
- [ ] 1. Formulario datos acta
- [ ] 2. Selector mesa (autocomplete con cache)
- [ ] 3. Inputs: sufragantes, nulos, no marcados
- [ ] 4. Sección resultados por candidato

### Día 6 (Sábado) - Validaciones Cliente
- [ ] 1. Validar suma en tiempo real
- [ ] 2. Mostrar alertas visuales
- [ ] 3. Prevenir submit si errores
- [ ] 4. Testing validaciones

**Entregable Semana 9:** ✅ Sistema storage offline funcional

---

## 📅 SEMANA 10 (9-15 Julio 2026)
### PWA - Cámara y Geolocalización

### Día 1 (Lunes) - Captura Imagen
- [ ] 1. Componente `ActaCapture/Camera.tsx`
- [ ] 2. Acceso a cámara móvil
- [ ] 3. Preview captura
- [ ] 4. Guardar base64 en storage

### Día 2 (Martes) - Geolocalización
- [ ] 1. Obtener GPS al capturar
- [ ] 2. Mostrar coordenadas
- [ ] 3. Validar precisión (< 100m)
- [ ] 4. Guardar en metadata

### Día 3 (Miércoles) - Guardado Offline
- [ ] 1. Integrar captura imagen + datos + GPS
- [ ] 2. Guardar en IndexedDB
- [ ] 3. Mostrar confirmación
- [ ] 4. Redireccionar a Dashboard

### Día 4 (Jueves) - Sync Service
- [ ] 1. Crear `services/sync.ts`
- [ ] 2. Implementar `sincronizarActas()`
- [ ] 3. Manejar errores y reintentos
- [ ] 4. Test sync manual

### Día 5 (Viernes) - Sync Automático
- [ ] 1. Detectar conexión online/offline
- [ ] 2. Intentar sync al restaurar conexión
- [ ] 3. Intervalo 5 minutos
- [ ] 4. Notificaciones sync exitoso/fallido

### Día 6 (Sábado) - Testing Completo PWA
- [ ] 1. Test flujo completo: captura → guardado → sync
- [ ] 2. Test modo offline
- [ ] 3. Test reconexión
- [ ] 4. Performance test

**Entregable Semana 10:** ✅ PWA captura y sincronización funcionando

---

## 📅 SEMANA 11 (16-22 Julio 2026)
### 🔴 FASE 3: Infraestructura - AWS Setup

### Día 1 (Lunes) - VPC y Networking
- [ ] 1. Crear VPC (10.0.0.0/16)
- [ ] 2. Crear subnets públicas (3 AZ)
- [ ] 3. Crear subnets privadas (3 AZ)
- [ ] 4. Internet Gateway + NAT Gateways

### Día 2 (Martes) - Security Groups
- [ ] 1. SG-Web (80, 443)
- [ ] 2. SG-App (8000, 3000)
- [ ] 3. SG-DB (5432 desde SG-App)
- [ ] 4. SG-Redis (6379 desde SG-App)

### Día 3 (Miércoles) - RDS PostgreSQL
- [ ] 1. Launch RDS PostgreSQL 15
- [ ] 2. Habilitar PostGIS
- [ ] 3. Multi-AZ configurado
- [ ] 4. Security Group configurado

### Día 4 (Jueves) - ElastiCache Redis
- [ ] 1. Launch ElastiCache Redis 7
- [ ] 2. Configurar security group
- [ ] 3. Test conexión desde local
- [ ] 4. Documentar endpoints

### Día 5 (Viernes) - S3 Buckets
- [ ] 1. `campaign-actas-prod`
- [ ] 2. `campaign-frontend-prod`
- [ ] 3. `campaign-backups`
- [ ] 4. Configurar versionado, encryption, CORS

### Día 6 (Sábado) - Revisión y Ajustes
- [ ] 1. Verificar conectividad entre servicios
- [ ] 2. Documentar infraestructura
- [ ] 3. Estimar costos

**Entregable Semana 11:** ✅ Infraestructura AWS base operativa

---

## 📅 SEMANA 12 (23-29 Julio 2026)
### Infraestructura - Deploy Producción

### Día 1 (Lunes) - EC2 Instances
- [ ] 1. Launch EC2 t3.medium (backend)
- [ ] 2. Launch EC2 t3.small (frontend)
- [ ] 3. Configurar security groups
- [ ] 4. Crear Elastic IPs

### Día 2 (Martes) - Setup Servidores
- [ ] 1. Instalar PHP 8.2, Composer, Nginx
- [ ] 2. Instalar Node.js, PM2
- [ ] 3. Configurar usuarios SSH
- [ ] 4. Setup SSL con Let's Encrypt

### Día 3 (Miércoles) - Deploy Backend
- [ ] 1. Clonar repo en servidor
- [ ] 2. `composer install`
- [ ] 3. Configurar `.env` producción
- [ ] 4. Ejecutar migraciones

### Día 4 (Jueves) - Deploy Frontend
- [ ] 1. Build producción
- [ ] 2. Deploy a S3
- [ ] 3. Configurar CloudFront
- [ ] 4. Test acceso HTTPS

### Día 5 (Viernes) - CI/CD GitHub Actions
- [ ] 1. Crear `.github/workflows/deploy-backend.yml`
- [ ] 2. Crear `.github/workflows/deploy-frontend.yml`
- [ ] 3. Configurar secrets
- [ ] 4. Test deploy automático

### Día 6 (Sábado) - Testing Producción
- [ ] 1. Test endpoints API
- [ ] 2. Test frontend
- [ ] 3. Verificar SSL
- [ ] 4. Monitoreo básico

**Entregable Semana 12:** ✅ Sistema desplegado en producción AWS

---

## 📅 SEMANA 13 (30 Julio - 5 Agosto 2026)
### PWA - Testing y Ajustes

### Día 1-3 (Lunes-Miércoles) - Testing PWA
- [ ] 1. Test en dispositivos reales (Android)
- [ ] 2. Test en dispositivos reales (iOS)
- [ ] 3. Test modo offline extenso
- [ ] 4. Test sincronización con errores
- [ ] 5. Test geolocalización precisa
- [ ] 6. Performance test

### Día 4-5 (Jueves-Viernes) - Ajustes UX
- [ ] 1. Mejorar feedback visual
- [ ] 2. Optimizar tiempos carga
- [ ] 3. Simplificar flujo captura
- [ ] 4. Agregar ayuda contextual

### Día 6 (Sábado) - Documentación PWA
- [ ] 1. Manual instalación testigo
- [ ] 2. Guía uso paso a paso
- [ ] 3. Troubleshooting

**Entregable Semana 13:** ✅ PWA lista para uso de testigos

---

## 📅 SEMANAS 14-16 (6-26 Agosto 2026)
### 🟡 FASE 4: Frontend Admin Dashboard

### Semana 14: Dashboard Preconteo
- [ ] 1. Crear página Dashboard Preconteo
- [ ] 2. Integrar WebSockets cliente
- [ ] 3. Mostrar resultados tiempo real
- [ ] 4. Gráficos de progreso

### Semana 15: Validación de Actas
- [ ] 1. Lista actas pendientes
- [ ] 2. Preview imagen acta
- [ ] 3. Botones validar/observar
- [ ] 4. Comentarios validación

### Semana 16: Gestión Testigos
- [ ] 1. CRUD testigos
- [ ] 2. Asignar mesas
- [ ] 3. Monitoreo en campo
- [ ] 4. Reportes participación

**Entregable Semanas 14-16:** ✅ Frontend administrativo completo

---

## 📅 SEMANAS 17-18 (27 Agosto - 9 Septiembre 2026)
### Alertas y Sistema Notificaciones

- [ ] 1. Componente Alertas tiempo real
- [ ] 2. Configuración umbrales
- [ ] 3. Notificaciones push
- [ ] 4. Email alertas críticas
- [ ] 5. SMS emergencias

**Entregable Semanas 17-18:** ✅ Sistema alertas operativo

---

## 📅 SEMANAS 19-20 (10-23 Septiembre 2026)
### 🔴 FASE 5: Testing y Hardening

### Semana 19: Testing Completo
- [ ] 1. Unit tests cobertura >70%
- [ ] 2. Integration tests
- [ ] 3. E2E tests con Cypress
- [ ] 4. Performance testing
- [ ] 5. Security audit

### Semana 20: Optimización y Documentación
- [ ] 1. Optimizar queries lentas
- [ ] 2. Agregar índices faltantes
- [ ] 3. Cache Redis tuning
- [ ] 4. Documentación operativa
- [ ] 5. Manuales de usuario

**Entregable Semanas 19-20:** ✅ Sistema testeado, optimizado y documentado

---

## 📅 SEMANAS 21-22 (24 Septiembre - 7 Octubre 2026)
### Simulacros y Ajustes Finales

- [ ] 1. Preparar datos simulacro (100 mesas)
- [ ] 2. Invitar testigos voluntarios
- [ ] 3. Ejecutar simulacro 4 horas
- [ ] 4. Recolectar feedback
- [ ] 5. Ajustes críticos
- [ ] 6. Performance tuning

**Entregable Semanas 21-22:** ✅ Simulacro exitoso, ajustes aplicados

---

## 📅 SEMANA 23 (8-14 Octubre 2026) - PRE-DÍA D
### 🔴 FASE 6: Go-Live Preparación

### Lunes-Martes: Preparación Final
- [ ] 1. Congelar código (feature freeze)
- [ ] 2. Deploy producción final
- [ ] 3. Backup completo BD
- [ ] 4. Verificar SSL certificados

### Miércoles-Jueves: Capacitación
- [ ] 1. Capacitar coordinadores
- [ ] 2. Capacitar testigos
- [ ] 3. Distribuir credenciales
- [ ] 4. Test accesos

### Viernes: Monitoreo y Soporte
- [ ] 1. Setup monitoreo 24/7
- [ ] 2. Canal soporte emergencias
- [ ] 3. Plan rollback listo
- [ ] 4. Checklist Día D impreso

### Fin de Semana: Descanso
- [ ] 1. Revisar checklist final
- [ ] 2. Preparar equipo soporte
- [ ] 3. Descansar para Día D

---

## 📅 24 OCTUBRE 2027 - DÍA D

### Checklist Día D:
- [ ] ✅ Sistema operativo
- [ ] ✅ Testigos en campo con app
- [ ] ✅ Coordinadores monitoreando
- [ ] ✅ Soporte técnico on-call
- [ ] ✅ Backups automáticos funcionando
- [ ] ✅ Plan rollback a mano
- [ ] 🎯 **ELECCIONES EXITOSAS**

---

## 📊 MÉTRICAS DE SEGUIMIENTO SEMANAL

### Cada Viernes revisar:
- [ ] % avance semana completado
- [ ] Tests pasando
- [ ] Bugs críticos abiertos
- [ ] Documentación actualizada
- [ ] Obstáculos para siguiente semana

### Reporte Semanal:
```
Semana: XX
Avance: XX%
Estado: 🟢/🟡/🔴
Bloqueos: 
- Item 1
- Item 2
Plan próxima semana:
- Tarea 1
- Tarea 2
```

---

**Documento Checklist Creado:** 7 de Mayo, 2026  
**Frecuencia Actualización:** Diaria durante desarrollo  
**Próxima Revisión:** Viernes 13 Mayo, 2026
