# 🗳️ PLATAFORMA ELECTORAL COLOMBIA - GUÍA DE DESARROLLO

## 📋 INFORMACIÓN DEL PROYECTO

**Nombre:** Plataforma Integral de Gestión de Campañas Políticas y Control Electoral
**Objetivo:** Elecciones Territoriales - 24 Octubre 2027
**Inicio Desarrollo:** Diciembre 2024
**Timeline:** 36-40 semanas (desarrollo acelerado con Claude Code)

## 🏗️ ARQUITECTURA DEL PROYECTO

```
Gestion de Campañas/
├── backend-core/          # Laravel 11 - API Core (CRM, Censo, Donaciones)
├── backend-diad/          # NestJS - Backend Día D (Tiempo Real, WebSockets)
├── frontend-web/          # HTML + Tailwind + Alpine.js - Panel Administrativo
├── pwa-testigos/          # PWA Offline-First - App Testigos Electorales
├── infrastructure/        # Terraform - Infraestructura como Código (AWS)
├── database/             # Migrations, Seeds, Schemas SQL
├── scripts/              # Scripts de automatización
├── docs/                 # Documentación técnica completa
└── .github/workflows/    # CI/CD GitHub Actions
```

## 🚀 STACK TECNOLÓGICO

### Backend Core (Laravel 11)
- **Framework:** Laravel 11.x (PHP 8.2+)
- **Base de Datos:** PostgreSQL 15 + PostGIS
- **Cache/Queue:** Redis 7
- **Autenticación:** Laravel Sanctum
- **Testing:** PHPUnit + Pest

### Backend Día D (NestJS)
- **Framework:** NestJS (Node.js 20+, TypeScript)
- **ORM:** TypeORM
- **WebSockets:** Socket.io
- **Queue:** Bull (Redis)
- **Testing:** Jest

### Frontend Web
- **HTML5** + **Tailwind CSS 3** + **Alpine.js 3**
- **Build:** Vite
- **Icons:** Heroicons

### PWA Testigos
- **Vanilla JavaScript** (Offline-First)
- **Service Workers**
- **IndexedDB** (Dexie.js)
- **Camera API** para captura actas

### Infraestructura
- **Cloud:** AWS
- **IaC:** Terraform
- **Containers:** Docker + ECS Fargate
- **CI/CD:** GitHub Actions
- **Monitoreo:** CloudWatch + Datadog

## 📦 DEPENDENCIAS PRINCIPALES

### Backend Core (Laravel)
```json
{
  "php": "^8.2",
  "laravel/framework": "^11.0",
  "laravel/sanctum": "^4.0",
  "phaza/laravel-postgis": "^6.0",
  "twilio/sdk": "^7.0",
  "aws/aws-sdk-php": "^3.0",
  "barryvdh/laravel-dompdf": "^2.0"
}
```

### Backend Día D (NestJS)
```json
{
  "@nestjs/core": "^10.0",
  "@nestjs/typeorm": "^10.0",
  "typeorm": "^0.3",
  "pg": "^8.11",
  "socket.io": "^4.6",
  "@nestjs/bull": "^10.0",
  "bull": "^4.11"
}
```

## 🛠️ SETUP DESARROLLO LOCAL

### Requisitos Previos
- **Docker Desktop** (recomendado) O:
  - PHP 8.2+
  - Node.js 20+
  - PostgreSQL 15+
  - Redis 7+
  - Composer 2+

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar repositorio (si aplica)
cd "C:\Gestion de Campañas"

# 2. Iniciar servicios
docker-compose up -d

# 3. Instalar dependencias Laravel
docker-compose exec backend-core composer install

# 4. Configurar .env
cp backend-core/.env.example backend-core/.env
php artisan key:generate

# 5. Ejecutar migrations
php artisan migrate --seed

# 6. Instalar dependencias NestJS
docker-compose exec backend-diad npm install

# 7. Iniciar desarrollo
docker-compose up
```

### Opción 2: Sin Docker

#### Backend Core (Laravel)
```bash
cd backend-core
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

#### Backend Día D (NestJS)
```bash
cd backend-diad
npm install
cp .env.example .env
npm run start:dev
```

#### Frontend Web
```bash
cd frontend-web
npm install
npm run dev
```

#### PWA Testigos
```bash
cd pwa-testigos
npm install
npm run dev
```

## 🗄️ BASE DE DATOS

### Schemas PostgreSQL
- `electoral` - Estructura electoral (departamentos, municipios, mesas)
- `crm` - CRM político (votantes, líderes, contactos)
- `compliance` - Donaciones y topes legales
- `diad` - Día D (actas, conteo, alertas)
- `communication` - Comunicación multicanal

### Conexión Local
```env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=electoral_platform
DB_USERNAME=postgres
DB_PASSWORD=secret
```

## 🧪 TESTING

### Backend Core (Laravel)
```bash
cd backend-core
php artisan test
# O con Pest
./vendor/bin/pest
```

### Backend Día D (NestJS)
```bash
cd backend-diad
npm run test
npm run test:e2e
npm run test:cov
```

## 🚢 DEPLOYMENT

### Ambientes
- **Development:** Local (Docker)
- **Staging:** AWS ECS (auto-deploy desde `develop`)
- **Production:** AWS ECS (manual deploy desde `main`)

### CI/CD
```yaml
# GitHub Actions ejecuta automáticamente:
- Tests (PHPUnit + Jest)
- Linting (PHPStan + ESLint)
- Build de contenedores
- Deploy a staging
```

## 📚 DOCUMENTACIÓN

### Documentación Completa
Ver carpeta `docs/`:
- `docs/arquitectura/` - Arquitectura del sistema
- `docs/database/` - Esquema base de datos
- `docs/api/` - Documentación APIs
- `docs/plan-desarrollo/` - Roadmap y planificación

### Documentos Clave
- `DOCUMENTACION-INDICE.md` - Índice completo
- `PROXIMOS-PASOS.md` - Plan de acción
- `docs/plan-desarrollo/roadmap-semanal-detallado.md` - Roadmap 132 semanas

## 🔐 SEGURIDAD

### Variables de Entorno
**NUNCA** commitear archivos `.env` con:
- Credenciales de base de datos
- API keys (Twilio, AWS, WhatsApp)
- Tokens de autenticación
- Secrets de producción

### Secrets Management
- **Desarrollo:** Archivo `.env` local
- **Staging/Producción:** AWS Secrets Manager

## 🤝 CONTRIBUTING

### Workflow Git
```bash
# 1. Crear branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-feature

# 2. Desarrollar y commitear
git add .
git commit -m "feat: descripción del feature"

# 3. Push y crear PR
git push origin feature/nombre-feature
# Crear Pull Request a 'develop'
```

### Convención Commits
- `feat:` - Nueva funcionalidad
- `fix:` - Bug fix
- `docs:` - Documentación
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Tareas mantenimiento

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Completado
- [x] Documentación técnica completa (131 páginas)
- [x] Arquitectura enterprise definida
- [x] Roadmap 34 meses detallado
- [x] Esquema base de datos (28 tablas)
- [x] APIs documentadas (100+ endpoints)
- [x] Estructura de directorios inicial
- [x] Git inicializado
- [x] .gitignore configurado

### 🚧 En Progreso (Sprint 1)
- [ ] Setup proyecto Laravel 11
- [ ] Setup proyecto NestJS
- [ ] Docker Compose configuración
- [ ] Infraestructura AWS (Terraform)
- [ ] Primera migration PostgreSQL

### 📅 Próximos Hitos
- **Semana 2-4:** Infraestructura AWS + Proyectos base
- **Semana 5-8:** Autenticación + Estructura electoral
- **Semana 9-12:** Censo electoral + PostGIS
- **Semana 13-24:** CRM + Comunicación multicanal
- **Semana 25-36:** Módulo Día D + PWA
- **Semana 37-40:** Testing + Pre-lanzamiento

## 🎯 OBJETIVO FINAL

**Noviembre 2025:** Plataforma completa lista para producción
**Elecciones Objetivo:** Territoriales 24 Octubre 2027

## 📞 CONTACTO Y SOPORTE

**Proyecto:** Plataforma Electoral Colombia
**Inicio:** Diciembre 2024
**Desarrollado con:** Claude Code (Anthropic)

---

**Última actualización:** Diciembre 14, 2024
**Versión:** 0.1.0 - Inicio desarrollo
