# PLAN DE RECUPERACION - Sistema de Preconteo Electoral
## Objetivo: Llevar el proyecto del ~55% actual al 100% funcional y listo para produccion

**Fecha de inicio:** Manana (2026-05-12)  
**Duracion estimada:** 4 semanas (20 dias habiles)  
**Estado actual auditado:** ~55% funcional real

---

## DIAGNOSTICO INICIAL (Resumen de la auditoria)

| Modulo | Estado Documentacion | Estado Real | Bloqueante |
|--------|---------------------|-------------|------------|
| Backend Core (Laravel 11) | 100% | ~70% | vendor/ no instalado, requiere PHP 8.2 |
| Backend Dia D (NestJS) | 100% | ~40% | node_modules/ no instalado |
| Frontend Web (React 19) | 95% | ~50% | Build FALLA por TypeScript + socket.io-client faltante |
| PWA Testigos (Ionic) | 100% | ~60% | node_modules/ no instalado |
| App Movil Nativa (RN+Expo) | 100% | ~35% | node_modules/ no instalado |
| DevOps/Docker | 100% | ~50% | Compose no levanta servicios correctamente |

### Problemas Criticos Encontrados
1. **Frontend-web no compila** - Error Rollup: no resuelve `socket.io-client`, errores TS en Recharts y variables no usadas
2. **4 de 5 proyectos sin dependencias instaladas** - Solo frontend-web tiene node_modules
3. **PHP del sistema (8.0) < requerido (8.2)** - Hay que usar Docker obligatoriamente
4. **Tests nunca ejecutados/verificados** - Codigo existe pero no se ha probado en este entorno
5. **Docker Compose timeout/fallo** - No levanta servicios del proyecto electoral
6. **Documentacion sobreestima el estado** - Dice 75-100%, realidad ~55%

---

## SEMANA 1: FUNDAMENTOS Y BACKEND CORE (Dias 1-5)

### DIA 1 - Setup de Entorno y Dependencias Criticas

**Tareas:**
- [ ] Verificar Docker Desktop funcionando: `docker ps`
- [ ] Levantar infraestructura base: `docker compose up -d postgres redis`
- [ ] Instalar dependencias Backend Core: `cd backend-core && composer install`
- [ ] Crear archivo `.env`: `cp .env.example .env`
- [ ] Generar app key: `php artisan key:generate`
- [ ] Verificar que `vendor/` se creo correctamente

**Comandos del dia:**
```bash
cd "C:\Gestion de Campañas"
docker compose up -d postgres redis
cd backend-core
composer install
cp .env.example .env
php artisan key:generate
```

**Verificacion:** `composer install` termina sin errores. PostgreSQL y Redis responden.

---

### DIA 2 - Base de Datos y Migraciones

**Tareas:**
- [ ] Ejecutar migraciones: `php artisan migrate:fresh`
- [ ] Ejecutar seeders: `php artisan db:seed`
- [ ] Verificar tablas creadas (pgAdmin puerto 5050 o psql)
- [ ] Probar endpoint health: `curl http://localhost:8000/api/health`

**Comandos del dia:**
```bash
cd backend-core
php artisan migrate:fresh
php artisan db:seed
php artisan serve --host=0.0.0.0 --port=8000
```

**Verificacion:** Endpoint `/api/health` responde JSON con `success: true`.

---

### DIA 3 - Tests Backend Core

**Tareas:**
- [ ] Ejecutar todos los tests: `php artisan test`
- [ ] Si fallan por factories/modelos faltantes, crearlos
- [ ] Corregir tests fallidos revisando logs
- [ ] Documentar tests que pasan vs los que fallan

**Comandos del dia:**
```bash
cd backend-core
php artisan test
php artisan test --filter=Feature
php artisan test --filter=Precount
```

**Verificacion:** 100+ tests pasando (objetivo: 103 tests verdes).

**Factories posiblemente faltantes:**
- ElectionFactory
- CandidateFactory / ElectionPositionFactory
- MunicipioFactory
- PuestoFactory
- MesaFactory
- PrecountRecordFactory
- PrecountVoteFactory
- PrecountEvidenceFactory

---

### DIA 4 - Backend Dia D (NestJS)

**Tareas:**
- [ ] Instalar dependencias: `cd backend-diad && npm install`
- [ ] Compilar TypeScript: `npm run build`
- [ ] Corregir errores de compilacion (imports, tipos, config)
- [ ] Probar arranque: `npm run start:dev`

**Comandos del dia:**
```bash
cd backend-diad
npm install
npm run build
npm run start:dev
```

**Verificacion:** Servidor NestJS escuchando en puerto 3000 sin errores de compilacion.

---

### DIA 5 - Integracion Backends + Redis

**Tareas:**
- [ ] Probar WebSocket Gateway (Postman/cliente WS a `ws://localhost:3000/actas`)
- [ ] Verificar comunicacion Redis: `redis-cli ping` → `PONG`
- [ ] Probar eventos en tiempo real: emitir `acta:nueva`, verificar recepcion
- [ ] Documentar endpoints funcionales
- [ ] Probar conexion cruzada: Frontend → API → WS → Redis

**Verificacion:** Core API (8000) + Dia D WS (3000) + Redis comunicandose.

---

## SEMANA 2: FRONTEND WEB (Dias 6-10)

### DIA 6 - Correccion de Dependencias

**Tareas:**
- [ ] Instalar dependencia faltante: `cd frontend-web && npm install socket.io-client`
- [ ] Verificar tipos: `npm install -D @types/socket.io-client` (si aplica)
- [ ] Revisar package.json vs node_modules: `npm ls socket.io-client`
- [ ] Ejecutar primer build para ver errores restantes: `npm run build`

**Comandos del dia:**
```bash
cd frontend-web
npm install socket.io-client
npm run build 2>&1 | tee build-errors.log
```

---

### DIA 7 - Correccion TypeScript Critica (Parte 1)

**Archivo objetivo:** `src/hooks/useWebSocket.ts`

**Correcciones a realizar:**
- [ ] Agregar tipos a parametros `any`:
  ```typescript
  const handleConnect = (reason: string) => { ... }
  const handleError = (error: Error) => { ... }
  const handleData = (data: WebSocketData) => { ... }
  ```
- [ ] Verificar import correcto de `socket.io-client`
- [ ] Definir interfaces para eventos del WebSocket

**Archivo objetivo:** `src/pages/dashboard/DashboardDiaD.tsx`
- [ ] Eliminar import no usado: `MapPin`
- [ ] Corregir variable `error` no usada en catch
- [ ] Agregar fallback para `progreso?.total_mesas`

---

### DIA 8 - Correccion TypeScript Critica (Parte 2)

**Archivo objetivo:** `src/components/dashboard/ResultadosChart.tsx`

**Correcciones a realizar:**
- [ ] Corregir tipado del formatter de Recharts:
  ```typescript
  formatter={(value: number | undefined) => [value ?? 0, 'Votos']}
  ```
- [ ] Eliminar parametro `name` no usado o usarlo

**Alternativa rapida (SOLO si es bloqueante):**
Si los errores persisten y bloquean el build, desactivar temporalmente en `tsconfig.json`:
```json
"noUnusedLocals": false,
"noUnusedParameters": false
```
> NOTA: Esto es para desbloquear el build. Se reactiva en la fase de QA (Dia 17).

---

### DIA 9 - Build y Verificacion

**Tareas:**
- [ ] Compilar produccion: `npm run build`
- [ ] Verificar dist/: `ls dist/` debe tener `index.html`, assets JS/CSS
- [ ] Servir localmente: `npm run preview`
- [ ] Probar en navegador: `http://localhost:5173`

**Comandos del dia:**
```bash
cd frontend-web
npm run build
npm run preview
```

**Verificacion:** Build exitoso, login carga, dashboards renderizan sin errores rojos en consola.

---

### DIA 10 - Integracion Frontend ↔ Backend

**Tareas:**
- [ ] Configurar `.env` del frontend: `VITE_API_URL=http://localhost:8000/api`
- [ ] Probar login: crear usuario, autenticar
- [ ] Probar flujo de votantes: CRUD completo
- [ ] Probar dashboard Dia D: verificar graficos con datos reales de API
- [ ] Revisar consola del navegador: 0 errores rojos

**Verificacion:** Flujo completo Login → Dashboard → CRUD votantes → Analytics funcional.

---

## SEMANA 3: PWA Y APP MOVIL (Dias 11-15)

### DIA 11 - PWA Testigos: Setup

**Tareas:**
- [ ] Instalar dependencias: `cd pwa-testigos && npm install`
- [ ] Compilar: `npm run build`
- [ ] Verificar Service Worker: revisar que se genere `sw.js`
- [ ] Probar en modo dev: `npm run dev`

**Comandos del dia:**
```bash
cd pwa-testigos
npm install
npm run build
npm run dev
```

---

### DIA 12 - PWA: Funcionalidad Offline

**Tareas:**
- [ ] Verificar IndexedDB: DevTools → Application → IndexedDB
- [ ] Probar registro de acta offline: desconectar red, llenar formulario, guardar
- [ ] Probar sincronizacion: reconectar red, verificar cola de sync
- [ ] Ejecutar tests E2E: `npm run test:e2e:ci`

**Verificacion:** Acta guardada offline aparece en "Pendientes" y sincroniza al reconectar.

---

### DIA 13 - App Movil Nativa: Setup

**Tareas:**
- [ ] Instalar dependencias: `cd app-movil-testigos && npm install`
- [ ] Configurar Expo: `npx expo install`
- [ ] Verificar `app.config.ts`: bundle identifier, permisos
- [ ] Levantar en modo dev: `npx expo start`

**Comandos del dia:**
```bash
cd app-movil-testigos
npm install
npx expo start
```

---

### DIA 14 - App Nativa: Screens y Navegacion

**Tareas:**
- [ ] Verificar navegacion: Login → Home → Formulario → Pendientes
- [ ] Probar SQLite offline: guardar acta, cerrar app, reopen, verificar persistencia
- [ ] Probar camara: tomar foto en formulario
- [ ] Probar GPS: verificar ubicacion en metadata

---

### DIA 15 - App Nativa: Builds de Prueba

**Tareas:**
- [ ] Build preview Android: `npx eas build --platform android --profile preview`
- [ ] O build local: `npx expo prebuild && cd android && ./gradlew assembleDebug`
- [ ] Verificar APK generado: `ls *.apk`

**Verificacion:** APK instalable en dispositivo Android.

---

## SEMANA 4: TESTING, QA Y PRODUCCION (Dias 16-20)

### DIA 16 - Testing Integral Backend

**Tareas:**
- [ ] Ejecutar suite completa: `cd backend-core && php artisan test`
- [ ] Feature tests API: `php artisan test --filter=Feature`
- [ ] Load testing: `php artisan test --filter=Load`
- [ ] Corregir bugs encontrados (priorizar críticos)

**Objetivo:** 100% tests pasando.

---

### DIA 17 - Testing Integral Frontend

**Tareas:**
- [ ] Re-activar strict TS: `"noUnusedLocals": true` en `tsconfig.json`
- [ ] Corregir todos los warnings TS (refactor variables y tipos)
- [ ] Probar flujo completo E2E: Login → Registrar votante → Crear evento → Dashboard Dia D
- [ ] Cross-browser testing: Chrome, Firefox, Edge

---

### DIA 18 - Docker Compose Completo

**Tareas:**
- [ ] Corregir `docker-compose.yml`: eliminar `version: '3.8'` (obsoleto)
- [ ] Build de todas las imagenes: `docker compose build --no-cache`
- [ ] Levantar stack completo: `docker compose up -d`
- [ ] Verificar todos los servicios: `docker ps` (7+ contenedores)
- [ ] Health checks:
  - [ ] `curl http://localhost:8000/api/health`
  - [ ] `curl http://localhost:3000`
  - [ ] `curl http://localhost:5173`
  - [ ] `curl http://localhost:5050` (pgAdmin)
  - [ ] `curl http://localhost:8081` (Redis Commander)

**Verificacion:** Todos los servicios responden desde Docker.

---

### DIA 19 - Pruebas de Estres y Seguridad

**Tareas:**
- [ ] Prueba de carga API: Artillery (`tests/Load/api-load-test.yml`)
- [ ] Prueba de carga WebSocket: `tests/Load/websocket-load-test.yml`
- [ ] Rate limiting: verificar 429 despues de 15 req/min
- [ ] Validar JWT: probar tokens expirados, invalidos
- [ ] Revision de `.env`: ninguna clave expuesta en repos
- [ ] Revisar `.gitignore`: `vendor/`, `node_modules/`, `.env` excluidos

---

### DIA 20 - Deploy Staging y Documentacion Final

**Tareas:**
- [ ] Deploy a servidor staging: ejecutar `scripts/deploy.sh staging`
- [ ] Verificar SSL/HTTPS: `https://staging.tudominio.com`
- [ ] Backup automatizado: probar script de backup
- [ ] Actualizar READMEs: estado real del proyecto, URLs, credenciales iniciales
- [ ] Checklist de produccion: revisar `docs/DEPLOYMENT.md`
- [ ] Git commit final: `git add . && git commit -m "v1.0.0-rc1 listo para produccion"`
- [ ] Actualizar este plan marcando TODO como completado

---

## RECURSOS Y DEPENDENCIAS NECESARIAS

| Software | Version Requerida | Estado Actual | Accion |
|----------|------------------|---------------|--------|
| PHP | 8.2+ | 8.0 | Usar Docker obligatoriamente |
| Node.js | 20+ | 24 | OK |
| Composer | 2.x | Verificar | `composer --version` |
| Docker Desktop | Ultima | 29.1.3 | OK |
| PostgreSQL | 15+ | En Docker | OK |
| Redis | 7+ | En Docker | OK |
| Git | 2.x | Instalado | OK |

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Mitigacion |
|--------|-------------|------------|
| PHP 8.0 no corre Laravel 11 | Alta | Usar Docker obligatoriamente para backend |
| Tests fallan por factories faltantes | Media | Crear factories minimas el dia 3 |
| socket.io-client tiene conflictos de tipos | Media | Usar `@ts-ignore` temporal o downgrade |
| Docker Compose timeout en Windows | Media | Aumentar RAM Docker Desktop a 8GB+ |
| App movil nativa no compila | Baja | Priorizar PWA (funciona en cualquier movil) |
| Recharts tiene breaking changes | Media | Fijar version compatible o usar chart alternativo |

---

## CHECKLIST DE INICIO (MANANA)

```bash
# 1. Ir al proyecto
cd "C:\Gestion de Campañas"

# 2. Verificar Docker
docker ps

# 3. Levantar solo DB y Cache
docker compose up -d postgres redis

# 4. Instalar backend core
cd backend-core
composer install
cp .env.example .env
php artisan key:generate

# 5. Primer build del dia
php artisan migrate:fresh --seed
php artisan serve
```

**Meta de la semana 1:** Backend Core respondiendo con datos reales.

---

## METRICAS DE EXITO

| Metrica | Actual | Objetivo Dia 20 |
|---------|--------|-----------------|
| Tests pasando | 0 ejecutados | 103+ verdes |
| Build frontend | FALLA | OK |
| Build PWA | No intentado | OK |
| Build app nativa | No intentado | APK generado |
| Docker Compose | Timeout/falla | 7 servicios UP |
| API endpoints funcionales | 0 verificados | 25+ verificados |
| WebSocket conectado | No probado | Eventos en tiempo real |
| Code coverage | ~75% (documentado) | >75% verificado |

---

## NOTAS

- Este plan fue generado tras una auditoria tecnica exhaustiva del proyecto el 2026-05-11.
- El proyecto tiene codigo real y arquitectura solida, pero requiere trabajo de integracion.
- Prioridad: Backend Core → Frontend Web → PWA → App Nativa → Docker/Deploy.
- Documentacion original sobreestima el estado (75-100% vs realidad ~55%).
