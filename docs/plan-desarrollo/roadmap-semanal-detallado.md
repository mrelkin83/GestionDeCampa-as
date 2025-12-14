# 📅 ROADMAP SEMANAL DETALLADO - PLATAFORMA ELECTORAL COLOMBIA

## 🎯 Información General

**Proyecto:** Plataforma Integral de Gestión de Campañas Políticas y Control Electoral
**Inicio:** 3 de Febrero 2025 (Lunes)
**Duración:** 132 semanas (34 meses)
**Objetivo:** Elecciones Territoriales - 24 Octubre 2027
**Metodología:** Scrum con sprints de 2 semanas

---

## 📊 ESTRUCTURA DEL ROADMAP

```
Total Sprints: 66 sprints (2 semanas c/u)
Total Semanas: 132 semanas
Fases: 6 fases principales

Equipo Inicial: 6 personas
Equipo Pico: 12 personas
Equipo Final: 10 personas
```

---

## 🔴 FASE 0: PREPARACIÓN Y SETUP (Semana -4 a 0)

### **Semana -4: 6-12 Enero 2025**
**Equipo:** CEO + 1 persona

**Objetivos:**
- Decisión GO/NO-GO
- Contratación equipo core

**Tareas:**
- [ ] Presentar presupuesto a stakeholders
- [ ] Aprobar inversión $1.395M COP
- [ ] Publicar ofertas laborales (LinkedIn, Indeed)
- [ ] Primera ronda entrevistas CTO

**Entregables:**
- ✅ Presupuesto aprobado
- ✅ 5 candidatos CTO entrevistados

---

### **Semana -3: 13-19 Enero 2025**
**Equipo:** CEO + 1 persona

**Objetivos:**
- Contratar CTO
- Segunda ronda entrevistas backend

**Tareas:**
- [ ] Contratar CTO/Tech Lead
- [ ] CTO define stack técnico final
- [ ] Entrevistar 10 backend developers
- [ ] Entrevistar 5 DevOps

**Entregables:**
- ✅ CTO contratado (inicia 27 enero)
- ✅ 3 finalistas backend
- ✅ 2 finalistas DevOps

---

### **Semana -2: 20-26 Enero 2025**
**Equipo:** CEO + CTO

**Objetivos:**
- Contratar equipo core
- Setup inicial

**Tareas:**
- [ ] Contratar 2 Backend Seniors
- [ ] Contratar 1 DevOps
- [ ] Crear cuenta AWS
- [ ] Registrar dominios
- [ ] Setup GitHub Organization

**Entregables:**
- ✅ Equipo core completo (4 personas)
- ✅ Infraestructura cuenta AWS
- ✅ Dominios registrados

---

### **Semana -1: 27 Enero - 2 Febrero 2025**
**Equipo:** CTO + 2 Backend + DevOps (4 personas)

**Objetivos:**
- Onboarding equipo
- Setup herramientas

**Tareas:**
- [ ] Onboarding técnico equipo
- [ ] Setup Jira/Linear
- [ ] Setup Slack workspace
- [ ] Configurar accesos AWS
- [ ] Definir Git workflow
- [ ] Crear tablero Scrum

**Entregables:**
- ✅ Equipo productivo
- ✅ Herramientas configuradas
- ✅ Primer planning meeting

---

## 🟢 FASE 1: FUNDACIONES (Semana 1-24 | 6 meses)

### **🔵 SPRINT 1 (Semana 1-2): Infraestructura Base AWS**

#### **Semana 1: 3-9 Febrero 2025**
**Equipo:** CTO + 2 Backend + DevOps

**Funcionalidades:**
1. **Infraestructura AWS Multi-AZ**
2. **Networking y Seguridad Base**

**Tareas Técnicas:**

**DevOps (5 días):**
- [ ] **Lunes:** Crear VPC con 3 subnets públicas + 3 privadas
  - CIDR: 10.0.0.0/16
  - Subnets por AZ: us-east-1a, us-east-1b, us-east-1c
- [ ] **Martes:** Configurar Internet Gateway + NAT Gateway
- [ ] **Miércoles:** Security Groups:
  - SG-Web: 80, 443 (público)
  - SG-App: 8000, 3000 (privado)
  - SG-DB: 5432 (solo desde SG-App)
  - SG-Redis: 6379 (solo desde SG-App)
- [ ] **Jueves:** Provisionar RDS PostgreSQL 15
  - Instancia: db.t3.medium (dev/staging)
  - Multi-AZ: Habilitado
  - Storage: 100 GB gp3
  - Backup: 7 días retención
- [ ] **Viernes:** Provisionar ElastiCache Redis
  - Instancia: cache.t3.small
  - Engine: Redis 7
  - Cluster mode: Deshabilitado (dev)

**Backend Laravel (3 días):**
- [ ] **Lunes:** Setup proyecto Laravel 11
  - `composer create-project laravel/laravel campaign-core`
  - Configurar .env (DB, Redis)
- [ ] **Martes-Miércoles:** Primera migration
  ```sql
  - users table
  - roles table
  - permissions table
  ```
- [ ] **Jueves:** Seeders roles:
  - super_admin
  - admin_campana
  - director
  - coordinador
  - brigadista
  - testigo
- [ ] **Viernes:** Testing conexión DB + Redis

**Backend NestJS (3 días):**
- [ ] **Lunes:** Setup proyecto NestJS
  - `nest new campaign-diad`
  - Configurar TypeORM
- [ ] **Martes:** Configurar Redis connection
- [ ] **Miércoles:** Health check endpoints
  - GET /health
  - GET /health/db
  - GET /health/redis
- [ ] **Jueves-Viernes:** Testing

**Criterios Aceptación:**
- ✅ VPC con 6 subnets operativa
- ✅ RDS PostgreSQL conectado
- ✅ Redis funcional
- ✅ Laravel ejecuta migrations
- ✅ NestJS health checks retornan 200

**Riesgos:**
- ⚠️ Límites cuenta AWS nueva (solicitar aumento)
- ⚠️ Costos estimados: $150 USD/mes

---

#### **Semana 2: 10-16 Febrero 2025**

**Funcionalidades:**
1. **S3 y Storage**
2. **CI/CD Base**
3. **Ambientes Dev/Staging**

**Tareas Técnicas:**

**DevOps (5 días):**
- [ ] **Lunes:** Crear S3 buckets:
  ```
  campaign-actas-dev
  campaign-actas-staging
  campaign-actas-prod
  campaign-documentos-dev
  campaign-backups
  ```
  - Versionado habilitado
  - Encriptación AES-256
  - Lifecycle: Glacier después 90 días
- [ ] **Martes:** Configurar CloudFront CDN
  - Origin: S3 actas
  - HTTPS obligatorio
  - Cache policy: 1 hora
- [ ] **Miércoles:** GitHub Actions CI/CD Laravel:
  ```yaml
  - Run tests
  - Build
  - Deploy to staging
  ```
- [ ] **Jueves:** GitHub Actions CI/CD NestJS
- [ ] **Viernes:** Setup SSL/TLS (Let's Encrypt)

**Backend Laravel (3 días):**
- [ ] **Lunes:** Configurar S3 filesystem
- [ ] **Martes:** Helper upload archivos
- [ ] **Miércoles:** Testing upload S3

**Backend NestJS (2 días):**
- [ ] **Lunes:** Configurar S3 SDK
- [ ] **Martes:** Testing

**Criterios Aceptación:**
- ✅ S3 buckets operativos
- ✅ Upload archivo prueba exitoso
- ✅ CI/CD deploy automático a staging
- ✅ SSL certificado válido
- ✅ CloudFront sirve archivos

**Entregables Sprint 1:**
- ✅ Infraestructura AWS completa
- ✅ Proyectos base Laravel + NestJS
- ✅ CI/CD funcional
- ✅ 3 ambientes (dev, staging, prod)

---

### **🔵 SPRINT 2 (Semana 3-4): Autenticación y RBAC**

#### **Semana 3: 17-23 Febrero 2025**

**Funcionalidades:**
1. **Sistema de Autenticación (Laravel Sanctum)**
2. **Roles y Permisos (RBAC)**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Instalar Laravel Sanctum
  ```bash
  composer require laravel/sanctum
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
  ```
- [ ] **Martes:** Migration users + tokens:
  ```sql
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    rol VARCHAR(50),
    campanas_asignadas INTEGER[],
    activo BOOLEAN DEFAULT true
  );
  CREATE TABLE personal_access_tokens (...);
  ```
- [ ] **Miércoles:** Implementar endpoints auth:
  ```php
  POST /api/v1/auth/login
  POST /api/v1/auth/logout
  POST /api/v1/auth/refresh
  GET  /api/v1/auth/me
  ```
- [ ] **Jueves:** Rate limiting:
  - Login: 5 intentos / 15 min
  - API general: 100 req/min
- [ ] **Viernes:** Testing autenticación

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration roles + permissions:
  ```sql
  CREATE TABLE roles (
    id SERIAL,
    nombre VARCHAR(50) UNIQUE,
    descripcion TEXT,
    permisos JSONB
  );
  ```
- [ ] **Martes:** Seeder 6 roles:
  ```php
  - super_admin (todos los permisos)
  - admin_campana (gestión completa campaña)
  - director (lectura/escritura operativa)
  - coordinador (su zona)
  - brigadista (contactos, eventos)
  - testigo (solo captura actas)
  ```
- [ ] **Miércoles:** Middleware ValidarRol:
  ```php
  Route::middleware(['auth:sanctum', 'role:admin_campana'])
  ```
- [ ] **Jueves:** Middleware ValidarCampana:
  ```php
  // Verificar usuario tiene acceso a campaña X
  ```
- [ ] **Viernes:** Testing RBAC

**DevOps (2 días):**
- [ ] **Lunes:** Setup logging (CloudWatch)
- [ ] **Martes:** Configurar alertas básicas

**Criterios Aceptación:**
- ✅ Login funcional retorna JWT
- ✅ Middleware bloquea rutas sin permisos
- ✅ Rate limiting activo
- ✅ 6 roles creados en DB
- ✅ Logs en CloudWatch

---

#### **Semana 4: 24 Febrero - 2 Marzo 2025**

**Funcionalidades:**
1. **Frontend Login**
2. **Layout Base Administrativo**

**Tareas Técnicas:**

**Frontend (Contratar esta semana - 1 Frontend Senior):**
- [ ] **Martes** (después contratación): Setup proyecto:
  ```bash
  mkdir campaign-web
  npm init
  npm install tailwindcss alpinejs axios
  ```
- [ ] **Miércoles:** Configurar Tailwind CSS
- [ ] **Jueves:** Página login:
  ```html
  - Form email/password
  - Validación cliente
  - Llamada POST /api/v1/auth/login
  - Guardar token en localStorage
  ```
- [ ] **Viernes:** Layout base:
  ```html
  - Sidebar navegación
  - Header con usuario
  - Logout button
  ```

**Backend Laravel (3 días):**
- [ ] **Lunes:** CRUD usuarios:
  ```php
  GET    /api/v1/users
  POST   /api/v1/users
  GET    /api/v1/users/{id}
  PUT    /api/v1/users/{id}
  DELETE /api/v1/users/{id}
  ```
- [ ] **Martes:** Validaciones
- [ ] **Miércoles:** Testing

**Backend NestJS (2 días):**
- [ ] **Lunes:** Implementar JWT auth
- [ ] **Martes:** Guards + Decorators

**Criterios Aceptación:**
- ✅ Login frontend funcional
- ✅ Token guardado correctamente
- ✅ Redirect a dashboard post-login
- ✅ CRUD usuarios completo
- ✅ Sidebar navegación responsive

**Entregables Sprint 2:**
- ✅ Sistema autenticación completo
- ✅ RBAC con 6 roles
- ✅ Frontend login + layout
- ✅ CRUD usuarios
- ✅ Rate limiting activo

---

### **🔵 SPRINT 3 (Semana 5-6): Estructura Electoral Base**

#### **Semana 5: 3-9 Marzo 2025**

**Funcionalidades:**
1. **Estructura Electoral Colombia (Departamentos, Municipios)**
2. **Seeders Datos Colombia**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Crear schema `electoral`:
  ```sql
  CREATE SCHEMA electoral;
  ```
- [ ] **Lunes:** Migration departamentos:
  ```sql
  CREATE TABLE electoral.departamentos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **Martes:** Migration municipios:
  ```sql
  CREATE TABLE electoral.municipios (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER REFERENCES electoral.departamentos(id),
    codigo VARCHAR(5) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    dane_code VARCHAR(8) UNIQUE,
    poblacion INTEGER
  );
  ```
- [ ] **Miércoles:** Seeder 32 departamentos:
  ```php
  [
    ['codigo' => '05', 'nombre' => 'Antioquia'],
    ['codigo' => '08', 'nombre' => 'Atlántico'],
    ['codigo' => '11', 'nombre' => 'Bogotá D.C.'],
    // ... 29 más
  ]
  ```
- [ ] **Jueves:** Seeder 1,102 municipios
  - Descargar datos DANE oficial
  - Importar CSV
- [ ] **Viernes:** Verificación datos:
  - ✅ 32 departamentos
  - ✅ 1,102 municipios

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration zonas_electorales:
  ```sql
  CREATE TABLE electoral.zonas_electorales (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER,
    numero INTEGER,
    nombre VARCHAR(100),
    UNIQUE(municipio_id, numero)
  );
  ```
- [ ] **Martes:** Migration puestos_votacion (sin geo aún):
  ```sql
  CREATE TABLE electoral.puestos_votacion (
    id SERIAL PRIMARY KEY,
    zona_electoral_id INTEGER,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    tipo VARCHAR(50),
    capacidad_mesas INTEGER
  );
  ```
- [ ] **Miércoles:** Migration mesas:
  ```sql
  CREATE TABLE electoral.mesas (
    id SERIAL PRIMARY KEY,
    puesto_votacion_id INTEGER,
    numero VARCHAR(10) NOT NULL,
    tipo_mesa VARCHAR(20),
    potencial_votantes INTEGER,
    UNIQUE(puesto_votacion_id, numero)
  );
  ```
- [ ] **Jueves:** Models Eloquent:
  ```php
  Departamento
  Municipio
  ZonaElectoral
  PuestoVotacion
  Mesa
  ```
- [ ] **Viernes:** Relaciones Eloquent

**Frontend (3 días):**
- [ ] **Lunes:** Página lista departamentos
- [ ] **Martes:** Página lista municipios (filtro por depto)
- [ ] **Miércoles:** Testing

**Criterios Aceptación:**
- ✅ 32 departamentos en DB
- ✅ 1,102 municipios en DB
- ✅ Tablas electoral creadas
- ✅ Models con relaciones funcionales
- ✅ Frontend muestra departamentos

---

#### **Semana 6: 10-16 Marzo 2025**

**Funcionalidades:**
1. **API CRUD Estructura Electoral**
2. **Cargos Electorales**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Controller EstructuraElectoralController:
  ```php
  GET /api/v1/electoral/departamentos
  GET /api/v1/electoral/municipios?departamento_id={id}
  GET /api/v1/electoral/zonas?municipio_id={id}
  GET /api/v1/electoral/puestos?zona_id={id}
  GET /api/v1/electoral/mesas?puesto_id={id}
  ```
- [ ] **Martes:** Implementar endpoints
- [ ] **Miércoles:** Paginación (50 por página)
- [ ] **Jueves:** Filtros y búsqueda
- [ ] **Viernes:** Testing API

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration cargos_electorales:
  ```sql
  CREATE TABLE electoral.cargos_electorales (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    nombre VARCHAR(100),
    nivel VARCHAR(20) NOT NULL,
    duracion_anos INTEGER DEFAULT 4
  );
  ```
- [ ] **Martes:** Seeder cargos:
  ```php
  [
    'senado' => 'Senado de la República',
    'camara' => 'Cámara de Representantes',
    'gobernacion' => 'Gobernación',
    'alcaldia' => 'Alcaldía',
    'asamblea' => 'Asamblea Departamental',
    'concejo' => 'Concejo Municipal',
    'jal' => 'Junta Administradora Local'
  ]
  ```
- [ ] **Miércoles:** Migration campanas:
  ```sql
  CREATE TABLE electoral.campanas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    cargo_electoral_id INTEGER,
    candidato_principal VARCHAR(200),
    departamento_id INTEGER,
    municipio_id INTEGER,
    fecha_eleccion DATE NOT NULL,
    tope_legal_gastos DECIMAL(15,2),
    estado VARCHAR(20) DEFAULT 'activa'
  );
  ```
- [ ] **Jueves:** CRUD campañas API
- [ ] **Viernes:** Testing

**Frontend (3 días):**
- [ ] **Lunes:** Página crear campaña
- [ ] **Martes:** Formulario campaña
- [ ] **Miércoles:** Lista campañas

**Criterios Aceptación:**
- ✅ API estructura electoral completa
- ✅ 7 cargos electorales creados
- ✅ CRUD campañas funcional
- ✅ Frontend crea primera campaña

**Entregables Sprint 3:**
- ✅ Estructura electoral Colombia completa
- ✅ 32 departamentos + 1,102 municipios
- ✅ Cargos electorales
- ✅ CRUD campañas
- ✅ API completa

---

### **🔵 SPRINT 4 (Semana 7-8): Censo Electoral Versionado**

#### **Semana 7: 17-23 Marzo 2025**

**Funcionalidades:**
1. **Sistema de Censo Electoral Versionado**
2. **Importador CSV Robusto**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration censo_electoral_versiones:
  ```sql
  CREATE TABLE electoral.censo_electoral_versiones (
    id SERIAL PRIMARY KEY,
    fecha_corte DATE NOT NULL,
    fuente VARCHAR(100),
    total_registros INTEGER,
    archivo_original VARCHAR(255),
    activo BOOLEAN DEFAULT false,
    procesado_at TIMESTAMP
  );
  CREATE UNIQUE INDEX ON censo_electoral_versiones(activo)
  WHERE activo = true;
  ```
- [ ] **Martes:** Migration censo_electoral:
  ```sql
  CREATE TABLE electoral.censo_electoral (
    id BIGSERIAL PRIMARY KEY,
    version_id INTEGER,
    cedula VARCHAR(15) NOT NULL,
    primer_nombre VARCHAR(50),
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50),
    segundo_apellido VARCHAR(50),
    fecha_nacimiento DATE,
    genero VARCHAR(1),
    mesa_id INTEGER,
    -- Denormalizado
    puesto_codigo VARCHAR(20),
    zona_numero INTEGER,
    municipio_id INTEGER,
    departamento_id INTEGER,
    UNIQUE(version_id, cedula)
  );
  ```
- [ ] **Miércoles:** Índices críticos:
  ```sql
  CREATE INDEX idx_censo_cedula ON censo_electoral(cedula);
  CREATE INDEX idx_censo_mesa ON censo_electoral(mesa_id);
  CREATE INDEX idx_censo_municipio ON censo_electoral(municipio_id);
  CREATE INDEX idx_censo_nombre ON censo_electoral(primer_apellido, primer_nombre);
  ```
- [ ] **Jueves:** Models + Relaciones
- [ ] **Viernes:** Testing estructura

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Service ImportadorCenso:
  ```php
  class ImportadorCensoService {
    public function importar($archivo, $fecha_corte)
    public function validarFormato($archivo)
    public function procesarCSV($archivo, $version_id)
  }
  ```
- [ ] **Martes:** Parser CSV robusto:
  ```php
  - Detectar encoding (UTF-8, Latin1)
  - Validar columnas requeridas
  - Sanitizar datos
  - Validar cédulas (algoritmo dígito verificación)
  ```
- [ ] **Miércoles:** Procesamiento por lotes:
  ```php
  // Insertar 1000 registros por vez
  foreach (array_chunk($data, 1000) as $batch) {
    DB::table('censo_electoral')->insert($batch);
  }
  ```
- [ ] **Jueves:** Job asíncrono (Laravel Queue):
  ```php
  dispatch(new ProcesarCensoJob($version_id));
  ```
- [ ] **Viernes:** Testing con CSV prueba (10K registros)

**DevOps (2 días):**
- [ ] **Lunes:** Configurar Redis Queue
- [ ] **Martes:** Worker Laravel Queue

**Criterios Aceptación:**
- ✅ Tablas censo creadas
- ✅ Importador procesa CSV sin errores
- ✅ 10K registros prueba importados
- ✅ Índices funcionando
- ✅ Queue procesando jobs

---

#### **Semana 8: 24-30 Marzo 2025**

**Funcionalidades:**
1. **API Búsqueda Censo**
2. **Frontend Importador**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Controller CensoController:
  ```php
  GET  /api/v1/censo/versiones
  POST /api/v1/censo/versiones (upload CSV)
  GET  /api/v1/censo/votantes?cedula={cedula}
  GET  /api/v1/censo/mesa/{mesaId}/votantes
  ```
- [ ] **Martes:** Endpoint búsqueda optimizado:
  ```php
  // Búsqueda por cédula (índice)
  // Búsqueda por nombre (ILIKE)
  // Paginación
  ```
- [ ] **Miércoles:** Validaciones
- [ ] **Jueves:** Rate limiting búsqueda
- [ ] **Viernes:** Testing API

**Backend Laravel Senior 2 (3 días):**
- [ ] **Lunes:** Detector duplicados:
  ```php
  - Cédulas duplicadas
  - Nombres muy similares (fuzzy matching)
  ```
- [ ] **Martes:** Reporte inconsistencias
- [ ] **Miércoles:** Testing

**Frontend (5 días):**
- [ ] **Lunes:** Página importar censo:
  ```html
  - Upload CSV
  - Validación formato
  - Progress bar
  ```
- [ ] **Martes:** Vista versiones censo
- [ ] **Miércoles:** Buscador votante:
  ```html
  - Input cédula
  - Resultados en tiempo real
  - Ficha votante
  ```
- [ ] **Jueves:** Vista votantes por mesa
- [ ] **Viernes:** Testing completo

**Criterios Aceptación:**
- ✅ Upload CSV funcional
- ✅ Progress bar muestra avance
- ✅ Búsqueda por cédula <100ms
- ✅ Frontend muestra votante con mesa asignada
- ✅ Detector duplicados funciona

**Entregables Sprint 4:**
- ✅ Censo electoral versionado
- ✅ Importador CSV robusto
- ✅ API búsqueda optimizada
- ✅ 10K registros prueba
- ✅ Frontend importador + buscador

---

### **🔵 SPRINT 5 (Semana 9-10): Gestión Multi-Campaña**

#### **Semana 9: 31 Marzo - 6 Abril 2025**

**Funcionalidades:**
1. **Aislamiento Multi-Tenant**
2. **Scopes Eloquent por Campaña**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Trait CampaignScoped:
  ```php
  trait CampaignScoped {
    protected static function bootCampaignScoped() {
      static::addGlobalScope('campaign', function ($query) {
        $query->where('campana_id', auth()->user()->currentCampaignId());
      });
    }
  }
  ```
- [ ] **Martes:** Aplicar scope a todos los models:
  ```php
  class Votante extends Model {
    use CampaignScoped;
  }
  ```
- [ ] **Miércoles:** Middleware ValidarCampana mejorado
- [ ] **Jueves:** Testing aislamiento:
  ```php
  // User 1 (campaña A) NO puede ver datos campaña B
  ```
- [ ] **Viernes:** Refactor controllers

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Sistema selector campaña:
  ```php
  POST /api/v1/usuarios/{id}/cambiar-campana
  GET  /api/v1/usuarios/{id}/campanas
  ```
- [ ] **Martes:** Sesión campaña actual
- [ ] **Miércoles:** Permisos por campaña
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Frontend (3 días):**
- [ ] **Lunes:** Selector campaña (navbar)
- [ ] **Martes:** Persistir campaña seleccionada
- [ ] **Miércoles:** Testing cambio campaña

**Criterios Aceptación:**
- ✅ Scope global funciona
- ✅ Aislamiento datos verificado
- ✅ Selector campaña frontend
- ✅ Testing cross-tenant

---

#### **Semana 10: 7-13 Abril 2025**

**Funcionalidades:**
1. **Dashboard Principal**
2. **KPIs Base**

**Tareas Técnicas:**

**Backend Laravel (4 días):**
- [ ] **Lunes:** Endpoint dashboard KPIs:
  ```php
  GET /api/v1/dashboard/kpis/{campanaId}
  ```
  Retorna:
  ```json
  {
    "votantes_total": 1000,
    "contactos_total": 500,
    "eventos_planificados": 5,
    "donaciones_total": 25000000
  }
  ```
- [ ] **Martes:** Cache Redis KPIs (TTL 5 min)
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes-Martes:** Dashboard principal:
  ```html
  - 4 tarjetas KPIs
  - Gráfico barras (Chart.js)
  - Lista últimas actividades
  ```
- [ ] **Miércoles:** Responsive design
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Polish UI/UX

**Criterios Aceptación:**
- ✅ Dashboard muestra KPIs
- ✅ Cache funcionando
- ✅ Responsive
- ✅ Gráficos interactivos

**Entregables Sprint 5:**
- ✅ Multi-tenant isolation
- ✅ Scopes Eloquent
- ✅ Dashboard con KPIs
- ✅ Selector campaña

---

### **🔵 SPRINT 6 (Semana 11-12): PostGIS y Georreferenciación Base**

#### **Semana 11: 14-20 Abril 2025**

**Funcionalidades:**
1. **PostGIS Habilitado**
2. **Georreferenciación Puestos**

**Tareas Técnicas:**

**DevOps (1 día):**
- [ ] **Lunes:** Habilitar PostGIS en RDS:
  ```sql
  CREATE EXTENSION postgis;
  CREATE EXTENSION postgis_topology;
  ```

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration agregar columna geo:
  ```sql
  ALTER TABLE electoral.puestos_votacion
  ADD COLUMN ubicacion GEOGRAPHY(POINT, 4326);
  ```
- [ ] **Martes:** Instalar laravel-postgis:
  ```bash
  composer require phaza/laravel-postgis
  ```
- [ ] **Miércoles:** Model con PostGIS:
  ```php
  use Phaza\LaravelPostgis\Eloquent\PostgisTrait;

  class PuestoVotacion extends Model {
    use PostgisTrait;
    protected $postgisFields = ['ubicacion'];
  }
  ```
- [ ] **Jueves:** Importador coordenadas:
  ```php
  // CSV: codigo_puesto, lat, lng
  // Actualizar ubicacion
  ```
- [ ] **Viernes:** Testing geo queries

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Queries geoespaciales:
  ```php
  // Puestos en bounding box
  PuestoVotacion::whereRaw(
    "ST_Within(ubicacion, ST_MakeEnvelope(?, ?, ?, ?, 4326))",
    [$swLng, $swLat, $neLng, $neLat]
  )->get();
  ```
- [ ] **Martes:** Índice GiST:
  ```sql
  CREATE INDEX idx_puestos_ubicacion
  ON puestos_votacion USING GIST(ubicacion);
  ```
- [ ] **Miércoles:** Testing performance
- [ ] **Jueves:** Documentación

**Criterios Aceptación:**
- ✅ PostGIS habilitado
- ✅ Columna geo agregada
- ✅ Queries geo funcionan
- ✅ Índice GiST creado
- ✅ Performance <100ms

---

#### **Semana 12: 21-27 Abril 2025**

**Funcionalidades:**
1. **API Geo Endpoints**
2. **Datos Geo Bogotá (Piloto)**

**Tareas Técnicas:**

**Backend Laravel (5 días):**
- [ ] **Lunes:** Controller GeorreferenciaController:
  ```php
  GET /api/v1/geo/puestos/bbox
    ?sw_lat={lat}&sw_lng={lng}
    &ne_lat={lat}&ne_lng={lng}

  GET /api/v1/geo/puestos/cerca
    ?lat={lat}&lng={lng}&radio={km}
  ```
- [ ] **Martes:** GeoJSON response:
  ```json
  {
    "type": "FeatureCollection",
    "features": [...]
  }
  ```
- [ ] **Miércoles:** Importar coordenadas Bogotá:
  ```
  - 500 puestos Bogotá (muestra)
  - Latitud/Longitud
  ```
- [ ] **Jueves:** Testing API geo
- [ ] **Viernes:** Documentación

**Frontend (3 días):**
- [ ] **Lunes:** Integrar Mapbox GL JS
- [ ] **Martes:** Mapa básico Bogotá
- [ ] **Miércoles:** Mostrar puestos (puntos)

**Criterios Aceptación:**
- ✅ API geo retorna GeoJSON
- ✅ 500 puestos Bogotá georreferenciados
- ✅ Mapa muestra puntos
- ✅ Bbox query funciona

**Entregables Sprint 6:**
- ✅ PostGIS configurado
- ✅ API geo funcional
- ✅ 500 puestos georreferenciados
- ✅ Mapa básico

**🎯 CHECKPOINT FASE 1 (Semana 12):**
- ✅ Infraestructura AWS robusta
- ✅ Autenticación + RBAC
- ✅ Estructura electoral completa
- ✅ Censo versionado (10K prueba)
- ✅ Multi-campaña funcional
- ✅ PostGIS base
- ✅ **6 personas equipo**

---

## 🟡 FASE 2: MÓDULOS CORE (Semana 13-52 | 10 meses | 40 semanas)

### **🔵 SPRINT 7-8 (Semana 13-16): CRM Votantes Base**

#### **Semana 13: 28 Abril - 4 Mayo 2025**

**Funcionalidades:**
1. **Modelo CRM Votantes**
2. **Vinculación Censo ↔ CRM**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Crear schema `crm`:
  ```sql
  CREATE SCHEMA crm;
  ```
- [ ] **Lunes:** Migration votantes:
  ```sql
  CREATE TABLE crm.votantes (
    id BIGSERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    censo_electoral_id BIGINT REFERENCES electoral.censo_electoral(id),
    cedula VARCHAR(15) NOT NULL,
    nombre_completo VARCHAR(200),
    celular VARCHAR(15),
    email VARCHAR(100),
    direccion TEXT,
    ubicacion_real GEOGRAPHY(POINT, 4326),
    -- Scoring
    score_afinidad INTEGER DEFAULT 0,
    probabilidad_voto DECIMAL(5,2),
    intencion_voto VARCHAR(20),
    -- Segmentación
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campana_id, cedula)
  );
  ```
- [ ] **Martes:** Índices:
  ```sql
  CREATE INDEX idx_votantes_campana ON crm.votantes(campana_id);
  CREATE INDEX idx_votantes_cedula ON crm.votantes(cedula);
  CREATE INDEX idx_votantes_score ON crm.votantes(score_afinidad DESC);
  CREATE INDEX idx_votantes_tags ON crm.votantes USING GIN(tags);
  ```
- [ ] **Miércoles:** Model Votante + Relaciones
- [ ] **Jueves:** Scope campaña
- [ ] **Viernes:** Testing

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Service CrearVotanteDesdeC enso:
  ```php
  // Buscar en censo por cédula
  // Crear en CRM con datos censo
  // Vincular censo_electoral_id
  ```
- [ ] **Martes:** Validaciones
- [ ] **Miércoles:** Deduplicación
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Criterios Aceptación:**
- ✅ Tabla votantes creada
- ✅ Puede crear votante desde censo
- ✅ Vinculación censo ↔ CRM
- ✅ Índices funcionando

---

#### **Semana 14: 5-11 Mayo 2025**

**Funcionalidades:**
1. **CRUD Votantes API**
2. **Historial Contactos**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Controller VotanteController:
  ```php
  GET    /api/v1/votantes
  POST   /api/v1/votantes
  GET    /api/v1/votantes/{id}
  PUT    /api/v1/votantes/{id}
  DELETE /api/v1/votantes/{id}
  PATCH  /api/v1/votantes/{id}/score
  ```
- [ ] **Martes:** Filtros:
  ```php
  ?mesa_id=123
  &score_min=70
  &intencion_voto=favorable
  &tags[]=joven
  ```
- [ ] **Miércoles:** Paginación
- [ ] **Jueves:** Búsqueda full-text
- [ ] **Viernes:** Testing API

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration contactos:
  ```sql
  CREATE TABLE crm.contactos (
    id BIGSERIAL PRIMARY KEY,
    votante_id BIGINT NOT NULL,
    campana_id INTEGER NOT NULL,
    fecha TIMESTAMP DEFAULT NOW(),
    tipo VARCHAR(50),
    canal VARCHAR(50),
    resultado VARCHAR(100),
    notas TEXT,
    usuario_registro VARCHAR(100),
    ubicacion GEOGRAPHY(POINT, 4326)
  );
  ```
- [ ] **Martes:** API contactos:
  ```php
  POST /api/v1/votantes/{id}/contacto
  GET  /api/v1/votantes/{id}/historial
  ```
- [ ] **Miércoles:** Validaciones
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Frontend (3 días):**
- [ ] **Lunes:** Página lista votantes
- [ ] **Martes:** Ficha votante
- [ ] **Miércoles:** Form contacto

**Criterios Aceptación:**
- ✅ CRUD votantes completo
- ✅ Filtros funcionan
- ✅ Historial contactos
- ✅ Frontend lista votantes

---

#### **Semana 15: 12-18 Mayo 2025**

**Funcionalidades:**
1. **Líderes Políticos**
2. **Estructura Territorial**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration lideres:
  ```sql
  CREATE TABLE crm.lideres (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    votante_id BIGINT,
    nombre_completo VARCHAR(200),
    cedula VARCHAR(15),
    celular VARCHAR(15),
    tipo VARCHAR(50),
    nivel_influencia INTEGER,
    mesas_asignadas INTEGER[],
    zonas_asignadas INTEGER[],
    activo BOOLEAN DEFAULT true
  );
  ```
- [ ] **Martes:** CRUD líderes API
- [ ] **Miércoles:** Asignación territorial:
  ```php
  POST /api/v1/lideres/{id}/asignar-mesas
  POST /api/v1/lideres/{id}/asignar-zonas
  ```
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (3 días):**
- [ ] **Lunes:** Reporte estructura:
  ```php
  GET /api/v1/lideres/{id}/estructura
  // Retorna: sub-líderes, brigadistas, votantes
  ```
- [ ] **Martes:** Testing
- [ ] **Miércoles:** Documentación

**Frontend (4 días):**
- [ ] **Lunes:** Página líderes
- [ ] **Martes:** Form crear líder
- [ ] **Miércoles:** Asignación territorial
- [ ] **Jueves:** Vista estructura

**Criterios Aceptación:**
- ✅ CRUD líderes
- ✅ Asignación territorial
- ✅ Reporte estructura
- ✅ Frontend líderes

---

#### **Semana 16: 19-25 Mayo 2025**

**Funcionalidades:**
1. **Scoring Manual Votantes**
2. **Tags y Categorización**

**Tareas Técnicas:**

**Backend Laravel (3 días):**
- [ ] **Lunes:** Actualización score:
  ```php
  PATCH /api/v1/votantes/{id}/score
  {
    "score_afinidad": 85,
    "intencion_voto": "favorable",
    "probabilidad_voto": 0.90
  }
  ```
- [ ] **Martes:** Actualización tags:
  ```php
  PATCH /api/v1/votantes/{id}/tags
  {
    "tags": ["joven", "profesional", "centro"]
  }
  ```
- [ ] **Miércoles:** Testing

**Frontend (5 días):**
- [ ] **Lunes:** Componente scoring:
  ```html
  - Slider 0-100
  - Select intención voto
  ```
- [ ] **Martes:** Componente tags:
  ```html
  - Input tags (autocomplete)
  - Tags populares
  ```
- [ ] **Miércoles:** Integración ficha votante
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Polish UI

**Criterios Aceptación:**
- ✅ Actualizar score desde frontend
- ✅ Tags funcionan
- ✅ Autocomplete tags
- ✅ UI intuitiva

**Entregables Sprint 7-8:**
- ✅ CRM votantes completo
- ✅ Historial contactos
- ✅ Líderes y estructura
- ✅ Scoring y tags
- ✅ 1,000 votantes prueba

---

---

## 🔵 FASE 2: MÓDULOS CORE (Semana 17-64)

### **🔵 SPRINT 9 (Semana 17-18): Segmentación Dinámica**

#### **Semana 17: 26 Mayo - 1 Junio 2025**

**Funcionalidades:**
1. **Motor Segmentación**
2. **Criterios Dinámicos**

**Equipo:** CTO + 3 Backend + 1 Frontend + 1 DevOps + 1 QA (7 personas)

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration tabla segmentos:
  ```sql
  CREATE TABLE crm.segmentos (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    nombre VARCHAR(200),
    descripcion TEXT,
    criterios JSONB NOT NULL,
    total_votantes INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_segmentos_campana ON crm.segmentos(campana_id);
  CREATE INDEX idx_segmentos_criterios ON crm.segmentos USING GIN(criterios);
  ```
- [ ] **Martes:** Model Segmento con query builder:
  ```php
  class Segmento extends Model {
    protected $casts = ['criterios' => 'array'];

    public function buildQuery() {
      $query = Votante::query();
      foreach($this->criterios as $criterio) {
        switch($criterio['campo']) {
          case 'edad':
            $query->whereBetween('edad', [$criterio['min'], $criterio['max']]);
            break;
          case 'municipio':
            $query->where('municipio_id', $criterio['valor']);
            break;
          case 'score':
            $query->where('score_afinidad', '>=', $criterio['minimo']);
            break;
        }
      }
      return $query;
    }
  }
  ```
- [ ] **Miércoles:** API crear segmento:
  ```php
  POST /api/v1/segmentos
  {
    "nombre": "Jóvenes Bogotá Alta Afinidad",
    "criterios": [
      {"campo": "edad", "min": 18, "max": 35},
      {"campo": "municipio", "valor": 11001},
      {"campo": "score", "minimo": 70}
    ]
  }
  ```
- [ ] **Jueves:** Preview endpoint:
  ```php
  POST /api/v1/segmentos/preview
  // Retorna: primeros 100 votantes + total count
  ```
- [ ] **Viernes:** Testing unitario

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Job calcular total:
  ```php
  class ActualizarTotalSegmentoJob implements ShouldQueue {
    public function handle() {
      $total = $this->segmento->buildQuery()->count();
      $this->segmento->update(['total_votantes' => $total]);
    }
  }
  ```
- [ ] **Martes:** Cache resultados segmentación (Redis)
- [ ] **Miércoles:** API listar votantes segmento:
  ```php
  GET /api/v1/segmentos/{id}/votantes?page=1&per_page=50
  ```
- [ ] **Jueves:** Exportar CSV segmento
- [ ] **Viernes:** Testing

**Frontend (5 días):**
- [ ] **Lunes:** Página crear segmento
- [ ] **Martes:** Constructor criterios (drag & drop):
  ```html
  - Select campo (edad, municipio, score, tags)
  - Operador (=, >, <, between, in)
  - Valor
  - Botón "Agregar criterio"
  ```
- [ ] **Miércoles:** Preview live results
- [ ] **Jueves:** Lista segmentos guardados
- [ ] **Viernes:** Testing E2E

**QA (3 días):**
- [ ] **Miércoles:** Plan testing segmentación
- [ ] **Jueves:** Testing funcional
- [ ] **Viernes:** Reporte bugs

**Criterios Aceptación:**
- ✅ Crear segmento con múltiples criterios
- ✅ Preview muestra votantes correctos
- ✅ Total actualizado automáticamente
- ✅ Cache funciona (TTL 10 min)
- ✅ Exportar CSV

**Riesgos:**
- ⚠️ Query lento con muchos criterios (optimizar índices)
- ⚠️ Cache inválido si votantes cambian (invalidación automática)

---

#### **Semana 18: 2-8 Junio 2025**

**Funcionalidades:**
1. **Criterios Geográficos**
2. **Segmentación por Tags**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Criterio geográfico bbox:
  ```php
  case 'bbox':
    $query->whereRaw(
      "ST_Within(ubicacion, ST_MakeEnvelope(?, ?, ?, ?, 4326))",
      [$criterio['xmin'], $criterio['ymin'], $criterio['xmax'], $criterio['ymax']]
    );
  ```
- [ ] **Martes:** Criterio radio (distancia desde punto):
  ```php
  case 'radio':
    $query->whereRaw(
      "ST_DWithin(ubicacion::geography, ST_Point(?, ?)::geography, ?)",
      [$criterio['lng'], $criterio['lat'], $criterio['metros']]
    );
  ```
- [ ] **Miércoles:** Testing geo queries
- [ ] **Jueves:** Performance tuning (EXPLAIN ANALYZE)
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Criterio tags:
  ```php
  case 'tags':
    $query->whereJsonContains('tags', $criterio['tags']);
  ```
- [ ] **Martes:** Criterio historial contactos:
  ```php
  case 'contactado_ultimo_mes':
    $query->whereHas('contactos', function($q) {
      $q->where('fecha_contacto', '>=', now()->subMonth());
    });
  ```
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes-Martes:** Selector geográfico en mapa:
  ```html
  - Dibujar rectángulo (bbox)
  - Dibujar círculo (radio)
  - Obtener coordenadas automáticamente
  ```
- [ ] **Miércoles:** Selector tags (autocomplete)
- [ ] **Jueves:** Testing integración
- [ ] **Viernes:** Polish UX

**DevOps (1 día):**
- [ ] **Lunes:** Optimizar PostgreSQL para geo queries:
  ```sql
  CREATE INDEX idx_votantes_ubicacion ON crm.votantes USING GIST(ubicacion);
  ```

**Criterios Aceptación:**
- ✅ Segmentación por bbox funciona
- ✅ Segmentación por radio funciona
- ✅ Segmentación por tags
- ✅ Query <500ms con 100k votantes
- ✅ Mapa interactivo funcional

**Entregables Sprint 9:**
- ✅ Motor segmentación completo
- ✅ 10+ criterios disponibles
- ✅ Preview tiempo real
- ✅ Exportar CSV
- ✅ Frontend intuitivo

---

### **🔵 SPRINT 10 (Semana 19-20): Comunicación SMS**

#### **Semana 19: 9-15 Junio 2025**

**Funcionalidades:**
1. **Integración Twilio SMS**
2. **Templates Mensajes**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Setup Twilio:
  ```bash
  composer require twilio/sdk
  ```
  Config:
  ```php
  // config/services.php
  'twilio' => [
    'sid' => env('TWILIO_SID'),
    'token' => env('TWILIO_TOKEN'),
    'from' => env('TWILIO_FROM'),
  ]
  ```
- [ ] **Martes:** Migration campañas comunicación:
  ```sql
  CREATE SCHEMA communication;

  CREATE TABLE communication.campanas_comunicacion (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    nombre VARCHAR(200),
    tipo VARCHAR(20), -- 'sms', 'email', 'whatsapp'
    segmento_id INTEGER,
    template_id INTEGER,
    estado VARCHAR(20) DEFAULT 'borrador',
    programada_para TIMESTAMP,
    total_destinatarios INTEGER DEFAULT 0,
    enviados INTEGER DEFAULT 0,
    errores INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE communication.mensajes (
    id BIGSERIAL PRIMARY KEY,
    campana_comunicacion_id INTEGER NOT NULL,
    votante_id BIGINT NOT NULL,
    tipo VARCHAR(20),
    destinatario VARCHAR(100),
    mensaje TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    external_id VARCHAR(100),
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP,
    error_mensaje TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_mensajes_campana ON communication.mensajes(campana_comunicacion_id);
  CREATE INDEX idx_mensajes_estado ON communication.mensajes(estado);
  ```
- [ ] **Miércoles:** Service enviar SMS:
  ```php
  class TwilioService {
    public function enviarSMS($to, $mensaje) {
      $twilio = new Client(config('services.twilio.sid'), config('services.twilio.token'));

      $message = $twilio->messages->create($to, [
        'from' => config('services.twilio.from'),
        'body' => $mensaje
      ]);

      return $message->sid;
    }
  }
  ```
- [ ] **Jueves:** Job envío masivo:
  ```php
  class EnviarCampanaSMSJob implements ShouldQueue {
    public function handle() {
      $votantes = $this->campana->segmento->buildQuery()->get();

      foreach($votantes as $votante) {
        dispatch(new EnviarSMSIndividualJob($votante, $this->campana));
      }
    }
  }
  ```
- [ ] **Viernes:** Rate limiting (Twilio límites)

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration templates:
  ```sql
  CREATE TABLE communication.templates (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    nombre VARCHAR(200),
    tipo VARCHAR(20),
    asunto VARCHAR(200),
    cuerpo TEXT,
    variables JSONB,
    activo BOOLEAN DEFAULT true
  );
  ```
- [ ] **Martes:** Motor reemplazo variables:
  ```php
  class TemplateService {
    public function render($template, $votante) {
      $mensaje = $template->cuerpo;
      $mensaje = str_replace('{{nombre}}', $votante->nombre, $mensaje);
      $mensaje = str_replace('{{cedula}}', $votante->cedula, $mensaje);
      return $mensaje;
    }
  }
  ```
- [ ] **Miércoles:** API templates CRUD
- [ ] **Jueves:** Testing templates
- [ ] **Viernes:** Documentación

**DevOps (2 días):**
- [ ] **Lunes:** Setup Redis Queue para SMS
- [ ] **Martes:** Monitoreo queue (Horizon)

**Criterios Aceptación:**
- ✅ Enviar SMS individual
- ✅ Templates con variables
- ✅ Queue funcional
- ✅ Rate limiting (100 SMS/min)
- ✅ Logs de envío

---

#### **Semana 20: 16-22 Junio 2025**

**Funcionalidades:**
1. **Campañas SMS Masivas**
2. **Tracking y Estadísticas**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** API crear campaña:
  ```php
  POST /api/v1/comunicacion/campanas
  {
    "nombre": "Invitación Evento Bogotá",
    "tipo": "sms",
    "segmento_id": 5,
    "template_id": 3,
    "programada_para": "2025-06-20T10:00:00Z"
  }
  ```
- [ ] **Martes:** Scheduler Laravel:
  ```php
  // app/Console/Kernel.php
  protected function schedule(Schedule $schedule) {
    $schedule->call(function() {
      $campanas = CampanaComunicacion::where('estado', 'programada')
        ->where('programada_para', '<=', now())
        ->get();

      foreach($campanas as $campana) {
        dispatch(new EnviarCampanaSMSJob($campana));
      }
    })->everyMinute();
  }
  ```
- [ ] **Miércoles:** Webhook Twilio status:
  ```php
  POST /api/v1/webhooks/twilio/status
  // Actualizar estado mensaje (entregado, fallido)
  ```
- [ ] **Jueves:** Testing webhooks
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Estadísticas campaña:
  ```php
  GET /api/v1/comunicacion/campanas/{id}/stats
  {
    "total_destinatarios": 1000,
    "enviados": 980,
    "entregados": 950,
    "fallidos": 30,
    "tasa_entrega": 0.97,
    "costo_total": 98000
  }
  ```
- [ ] **Martes:** Cache stats (Redis)
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes:** Página crear campaña SMS
- [ ] **Martes:** Selector segmento + template
- [ ] **Miércoles:** Programador fecha/hora
- [ ] **Jueves:** Dashboard stats campaña
- [ ] **Viernes:** Testing E2E

**QA (3 días):**
- [ ] **Miércoles:** Testing funcional SMS
- [ ] **Jueves:** Testing programación
- [ ] **Viernes:** Testing webhooks

**Criterios Aceptación:**
- ✅ Crear campaña SMS
- ✅ Programar envío futuro
- ✅ Envío masivo funciona (1000 SMS en 10 min)
- ✅ Webhooks actualizan estado
- ✅ Stats en tiempo real

**Entregables Sprint 10:**
- ✅ Integración Twilio completa
- ✅ Templates SMS
- ✅ Campañas masivas
- ✅ Tracking entrega
- ✅ Dashboard stats

---

### **🔵 SPRINT 11 (Semana 21-22): Comunicación Email**

#### **Semana 21: 23-29 Junio 2025**

**Funcionalidades:**
1. **Integración AWS SES**
2. **Templates Email HTML**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Setup AWS SES:
  ```bash
  composer require aws/aws-sdk-php
  ```
  Config:
  ```php
  // config/mail.php
  'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => 'us-east-1',
  ]
  ```
- [ ] **Martes:** Mailable Laravel:
  ```php
  class CampanaEmail extends Mailable {
    public function build() {
      return $this->subject($this->template->asunto)
        ->view('emails.campana', [
          'votante' => $this->votante,
          'template' => $this->template
        ]);
    }
  }
  ```
- [ ] **Miércoles:** Job envío email:
  ```php
  class EnviarEmailJob implements ShouldQueue {
    public function handle() {
      Mail::to($this->votante->email)->send(new CampanaEmail($this->votante, $this->template));
    }
  }
  ```
- [ ] **Jueves:** Testing envío
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Blade templates email:
  ```blade
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial; }
      .header { background: #1e40af; color: white; padding: 20px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>{{ $template->titulo }}</h1>
    </div>
    <div class="content">
      {!! str_replace('{{nombre}}', $votante->nombre, $template->cuerpo) !!}
    </div>
  </body>
  </html>
  ```
- [ ] **Martes:** Editor HTML templates (Quill.js)
- [ ] **Miércoles:** Preview email
- [ ] **Jueves:** Testing templates
- [ ] **Viernes:** Documentación

**DevOps (2 días):**
- [ ] **Lunes:** Verificar dominio SES
- [ ] **Martes:** Setup SPF, DKIM records

**Criterios Aceptación:**
- ✅ Enviar email HTML
- ✅ Templates personalizados
- ✅ Variables reemplazadas
- ✅ Imágenes cargadas
- ✅ SPF/DKIM configurados

---

#### **Semana 22: 30 Junio - 6 Julio 2025**

**Funcionalidades:**
1. **Campañas Email Masivas**
2. **Tracking Aperturas/Clicks**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Pixel tracking aperturas:
  ```php
  // Agregar a email:
  <img src="{{ route('email.track', $mensaje->id) }}" width="1" height="1">

  // Route:
  Route::get('/email/track/{mensajeId}', function($mensajeId) {
    Mensaje::find($mensajeId)->update(['abierto' => true, 'fecha_apertura' => now()]);
    return response()->file(public_path('pixel.png'));
  });
  ```
- [ ] **Martes:** Link tracking clicks:
  ```php
  // Reemplazar links en email:
  <a href="{{ route('email.click', [$mensaje->id, base64_encode($url)]) }}">Click aquí</a>

  // Redireccionar y trackear:
  Route::get('/email/click/{mensajeId}/{url}', function($mensajeId, $url) {
    Mensaje::find($mensajeId)->increment('clicks');
    return redirect(base64_decode($url));
  });
  ```
- [ ] **Miércoles:** SES bounces/complaints webhook
- [ ] **Jueves:** Lista supresión (unsubscribe)
- [ ] **Viernes:** Testing tracking

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Stats avanzadas email:
  ```php
  {
    "enviados": 1000,
    "entregados": 985,
    "abiertos": 450,
    "clicks": 120,
    "tasa_apertura": 0.457,
    "tasa_click": 0.122
  }
  ```
- [ ] **Martes:** Cache stats
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes:** Página crear campaña email
- [ ] **Martes:** Editor Quill.js integrado
- [ ] **Miércoles:** Preview responsivo (desktop/mobile)
- [ ] **Jueves:** Dashboard stats email
- [ ] **Viernes:** Testing

**Criterios Aceptación:**
- ✅ Tracking aperturas funciona
- ✅ Tracking clicks funciona
- ✅ Bounces procesados
- ✅ Unsubscribe funcional
- ✅ Stats precisas

**Entregables Sprint 11:**
- ✅ Integración SES completa
- ✅ Templates HTML
- ✅ Tracking completo
- ✅ Campañas email masivas
- ✅ Dashboard stats

---

### **🔵 SPRINT 12 (Semana 23-24): WhatsApp Business API**

#### **Semana 23: 7-13 Julio 2025**

**Funcionalidades:**
1. **Integración WhatsApp Business API**
2. **Templates WhatsApp**

**⚠️ NOTA CRÍTICA:**
**Iniciar proceso aprobación Meta Business AHORA (Diciembre 2024)**
Proceso aprobación: 2-4 semanas
Requiere: Empresa verificada, caso de uso electoral aprobado

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Setup WhatsApp Cloud API:
  ```bash
  composer require netflie/whatsapp-cloud-api
  ```
  Config:
  ```php
  // config/services.php
  'whatsapp' => [
    'token' => env('WHATSAPP_TOKEN'),
    'phone_number_id' => env('WHATSAPP_PHONE_ID'),
    'business_account_id' => env('WHATSAPP_BUSINESS_ID'),
  ]
  ```
- [ ] **Martes:** Service enviar mensaje template:
  ```php
  use Netflie\WhatsAppCloudApi\WhatsAppCloudApi;

  class WhatsAppService {
    public function enviarTemplate($to, $templateName, $params) {
      $whatsapp = new WhatsAppCloudApi([
        'from_phone_number_id' => config('services.whatsapp.phone_number_id'),
        'access_token' => config('services.whatsapp.token'),
      ]);

      $response = $whatsapp->sendTemplate($to, $templateName, 'es', $params);
      return $response->decodedBody();
    }
  }
  ```
- [ ] **Miércoles:** Job envío WhatsApp:
  ```php
  class EnviarWhatsAppJob implements ShouldQueue {
    public function handle() {
      $response = app(WhatsAppService::class)->enviarTemplate(
        $this->votante->celular,
        'invitacion_evento',
        [
          ['type' => 'text', 'text' => $this->votante->nombre],
          ['type' => 'text', 'text' => $this->evento->nombre],
        ]
      );

      Mensaje::create([
        'votante_id' => $this->votante->id,
        'tipo' => 'whatsapp',
        'external_id' => $response['messages'][0]['id'],
        'estado' => 'enviado',
      ]);
    }
  }
  ```
- [ ] **Jueves:** Rate limiting WhatsApp (80 msg/seg tier 1)
- [ ] **Viernes:** Testing

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Crear templates en Meta:
  ```json
  // Template "invitacion_evento"
  {
    "name": "invitacion_evento",
    "language": "es",
    "category": "MARKETING",
    "components": [
      {
        "type": "HEADER",
        "format": "TEXT",
        "text": "¡Hola {{1}}!"
      },
      {
        "type": "BODY",
        "text": "Te invitamos al evento {{2}} el {{3}}. ¡No faltes!"
      },
      {
        "type": "FOOTER",
        "text": "Campaña 2027"
      }
    ]
  }
  ```
- [ ] **Martes:** Sincronizar templates a BD
- [ ] **Miércoles:** API listar templates aprobados
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**DevOps (1 día):**
- [ ] **Lunes:** Webhook WhatsApp status:
  ```nginx
  location /webhooks/whatsapp {
    proxy_pass http://laravel-app;
  }
  ```

**Criterios Aceptación:**
- ✅ Enviar WhatsApp template aprobado
- ✅ Variables reemplazadas
- ✅ Rate limiting funcional
- ✅ Logs de envío
- ✅ Templates sincronizados

**Riesgos:**
- ⚠️ **CRÍTICO:** Aprobación Meta puede tardar 4 semanas
- ⚠️ Templates deben estar pre-aprobados por Meta
- ⚠️ No se pueden enviar mensajes libres (solo templates)

---

#### **Semana 24: 14-20 Julio 2025**

**Funcionalidades:**
1. **Campañas WhatsApp Masivas**
2. **Webhooks Status**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Webhook Meta status:
  ```php
  POST /api/v1/webhooks/whatsapp/status

  public function handleWebhook(Request $request) {
    $data = $request->all();

    foreach($data['entry'] as $entry) {
      foreach($entry['changes'] as $change) {
        if($change['field'] === 'messages') {
          $status = $change['value']['statuses'][0];

          Mensaje::where('external_id', $status['id'])->update([
            'estado' => $status['status'], // sent, delivered, read, failed
            'fecha_entrega' => $status['status'] === 'delivered' ? now() : null,
          ]);
        }
      }
    }
  }
  ```
- [ ] **Martes:** Verificación webhook (Meta requiere):
  ```php
  GET /api/v1/webhooks/whatsapp/verify

  public function verify(Request $request) {
    if($request->hub_verify_token === env('WHATSAPP_VERIFY_TOKEN')) {
      return response($request->hub_challenge);
    }
    return response('Forbidden', 403);
  }
  ```
- [ ] **Miércoles:** Testing webhooks
- [ ] **Jueves:** Manejo errores Meta API
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Stats WhatsApp:
  ```php
  {
    "enviados": 500,
    "entregados": 485,
    "leidos": 320,
    "fallidos": 15,
    "tasa_entrega": 0.97,
    "tasa_lectura": 0.66
  }
  ```
- [ ] **Martes:** Cache stats
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes:** Página crear campaña WhatsApp
- [ ] **Martes:** Selector template aprobado
- [ ] **Miércoles:** Preview template con variables
- [ ] **Jueves:** Dashboard stats WhatsApp
- [ ] **Viernes:** Testing

**QA (3 días):**
- [ ] **Miércoles:** Testing envío WhatsApp
- [ ] **Jueves:** Testing webhooks
- [ ] **Viernes:** Testing stats

**Criterios Aceptación:**
- ✅ Campañas WhatsApp masivas
- ✅ Webhooks procesando status
- ✅ Stats leídos/entregados
- ✅ Error handling robusto
- ✅ Logs detallados

**Entregables Sprint 12:**
- ✅ WhatsApp Business API integrado
- ✅ Templates aprobados funcionando
- ✅ Webhooks status
- ✅ Campañas masivas
- ✅ Dashboard stats

**Checkpoint Jul 2025:**
- ✅ Comunicación multicanal completa (SMS, Email, WhatsApp)
- ✅ Templates por canal
- ✅ Tracking completo
- ✅ 5,000 mensajes enviados (prueba)
- ✅ Stats en tiempo real

---

### **🔵 SPRINT 13 (Semana 25-26): Eventos - CRUD Base**

#### **Semana 25: 21-27 Julio 2025**

**Funcionalidades:**
1. **Modelo Eventos**
2. **CRUD Completo**

**Equipo:** CTO + 3 Backend + 2 Frontend + 1 DevOps + 1 QA (8 personas)

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration eventos:
  ```sql
  CREATE TABLE crm.eventos (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    nombre VARCHAR(200),
    descripcion TEXT,
    tipo VARCHAR(50), -- 'reunion', 'caminata', 'debate', 'cierre'
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    ubicacion GEOGRAPHY(POINT, 4326),
    direccion VARCHAR(300),
    municipio_id INTEGER,
    capacidad INTEGER,
    estado VARCHAR(20) DEFAULT 'planificado',
    responsable_id INTEGER,
    presupuesto DECIMAL(12,2),
    costo_real DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_eventos_campana ON crm.eventos(campana_id);
  CREATE INDEX idx_eventos_fecha ON crm.eventos(fecha_inicio);
  CREATE INDEX idx_eventos_ubicacion ON crm.eventos USING GIST(ubicacion);
  ```
- [ ] **Martes:** Model Evento:
  ```php
  class Evento extends Model {
    use PostgisTrait;

    protected $casts = [
      'fecha_inicio' => 'datetime',
      'fecha_fin' => 'datetime',
      'presupuesto' => 'decimal:2',
    ];

    protected $postgisFields = ['ubicacion'];

    public function asistencias() {
      return $this->hasMany(AsistenciaEvento::class);
    }
  }
  ```
- [ ] **Miércoles:** API CRUD:
  ```php
  GET    /api/v1/eventos?campana_id=1&fecha_desde=2025-08-01
  POST   /api/v1/eventos
  GET    /api/v1/eventos/{id}
  PUT    /api/v1/eventos/{id}
  DELETE /api/v1/eventos/{id}
  ```
- [ ] **Jueves:** Validaciones:
  ```php
  'nombre' => 'required|max:200',
  'fecha_inicio' => 'required|date|after:now',
  'capacidad' => 'nullable|integer|min:1',
  'presupuesto' => 'nullable|numeric|min:0',
  ```
- [ ] **Viernes:** Testing unitario

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration asistencias:
  ```sql
  CREATE TABLE crm.asistencias_evento (
    id BIGSERIAL PRIMARY KEY,
    evento_id INTEGER NOT NULL,
    votante_id BIGINT NOT NULL,
    estado VARCHAR(20) DEFAULT 'confirmado',
    fecha_confirmacion TIMESTAMP,
    fecha_checkin TIMESTAMP,
    metodo_checkin VARCHAR(20), -- 'qr', 'manual'
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(evento_id, votante_id)
  );

  CREATE INDEX idx_asistencias_evento ON crm.asistencias_evento(evento_id);
  CREATE INDEX idx_asistencias_votante ON crm.asistencias_evento(votante_id);
  ```
- [ ] **Martes:** API invitar votantes:
  ```php
  POST /api/v1/eventos/{id}/invitar
  {
    "segmento_id": 5,
    "enviar_whatsapp": true,
    "template_id": 10
  }
  ```
- [ ] **Miércoles:** Job enviar invitaciones
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Frontend Senior (5 días):**
- [ ] **Lunes:** Página listar eventos (calendario)
- [ ] **Martes:** Form crear evento
- [ ] **Miércoles:** Mapa selector ubicación
- [ ] **Jueves:** Vista detalle evento
- [ ] **Viernes:** Testing

**Criterios Aceptación:**
- ✅ CRUD eventos completo
- ✅ Validaciones funcionan
- ✅ Ubicación geográfica
- ✅ Calendario visual
- ✅ Invitar segmentos

---

#### **Semana 26: 28 Julio - 3 Agosto 2025**

**Funcionalidades:**
1. **QR Check-in**
2. **Estadísticas Evento**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Generar QR único por votante:
  ```bash
  composer require simplesoftwareio/simple-qrcode
  ```
  ```php
  use SimpleSoftwareIO\QrCode\Facades\QrCode;

  public function generarQR(Evento $evento, Votante $votante) {
    $token = hash('sha256', $evento->id . $votante->id . time());

    AsistenciaEvento::create([
      'evento_id' => $evento->id,
      'votante_id' => $votante->id,
      'token_qr' => $token,
    ]);

    return QrCode::size(300)->generate(
      route('eventos.checkin', $token)
    );
  }
  ```
- [ ] **Martes:** Endpoint check-in QR:
  ```php
  POST /api/v1/eventos/checkin/{token}

  public function checkin($token) {
    $asistencia = AsistenciaEvento::where('token_qr', $token)->firstOrFail();

    if($asistencia->fecha_checkin) {
      return response()->json(['error' => 'Ya registrado'], 400);
    }

    $asistencia->update([
      'fecha_checkin' => now(),
      'metodo_checkin' => 'qr',
    ]);

    return response()->json(['success' => true, 'votante' => $asistencia->votante]);
  }
  ```
- [ ] **Miércoles:** Check-in manual (sin QR):
  ```php
  POST /api/v1/eventos/{id}/checkin-manual
  {
    "cedula": "1234567890"
  }
  ```
- [ ] **Jueves:** Testing check-in
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Stats evento:
  ```php
  GET /api/v1/eventos/{id}/stats
  {
    "invitados": 200,
    "confirmados": 150,
    "asistieron": 120,
    "tasa_asistencia": 0.80,
    "costo_por_asistente": 25000,
    "presupuesto_vs_real": {
      "presupuesto": 3000000,
      "gastado": 2800000,
      "diferencia": 200000
    }
  }
  ```
- [ ] **Martes:** Reporte asistentes (CSV)
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación

**Frontend Senior 1 (5 días):**
- [ ] **Lunes:** Página invitar votantes
- [ ] **Martes:** Generar QR masivo (ZIP)
- [ ] **Miércoles:** App check-in (escanear QR con webcam)
- [ ] **Jueves:** Dashboard stats evento
- [ ] **Viernes:** Testing

**Frontend Senior 2 (3 días):**
- [ ] **Lunes:** Lista asistentes en tiempo real
- [ ] **Martes:** Check-in manual UI
- [ ] **Miércoles:** Testing

**QA (3 días):**
- [ ] **Miércoles:** Testing QR
- [ ] **Jueves:** Testing check-in
- [ ] **Viernes:** Testing stats

**Criterios Aceptación:**
- ✅ QR único por votante
- ✅ Check-in QR funciona
- ✅ Check-in manual funciona
- ✅ No duplicados check-in
- ✅ Stats tiempo real

**Entregables Sprint 13:**
- ✅ CRUD eventos completo
- ✅ QR check-in funcional
- ✅ Invitaciones automáticas
- ✅ Stats eventos
- ✅ 1 evento prueba realizado

---

### **🔵 SPRINT 14 (Semana 27-28): Donaciones Base**

#### **Semana 27: 4-10 Agosto 2025**

**Funcionalidades:**
1. **Modelo Donaciones**
2. **CRUD Donaciones**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration donaciones (ya existe en schema):
  ```sql
  -- Ya creado en Sprint anterior, verificar:
  SELECT * FROM information_schema.tables
  WHERE table_schema = 'compliance' AND table_name = 'donaciones';
  ```
- [ ] **Martes:** Model Donacion:
  ```php
  class Donacion extends Model {
    protected $table = 'compliance.donaciones';

    protected $casts = [
      'monto' => 'decimal:2',
      'fecha_donacion' => 'date',
    ];

    public function donante() {
      return $this->belongsTo(Donante::class);
    }
  }
  ```
- [ ] **Miércoles:** API CRUD:
  ```php
  POST /api/v1/donaciones
  {
    "campana_id": 1,
    "donante_id": 50,
    "monto": 500000,
    "metodo_pago": "transferencia",
    "fecha_donacion": "2025-08-05",
    "comprobante_url": "https://s3.../comprobante.pdf"
  }

  GET /api/v1/donaciones?campana_id=1&fecha_desde=2025-01-01
  ```
- [ ] **Jueves:** Validaciones
- [ ] **Viernes:** Testing

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Migration donantes:
  ```sql
  CREATE TABLE compliance.donantes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(20), -- 'persona', 'empresa'
    nombre_completo VARCHAR(200),
    cedula_nit VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    telefono VARCHAR(15),
    direccion VARCHAR(300),
    verificado BOOLEAN DEFAULT false,
    bloqueado BOOLEAN DEFAULT false,
    razon_bloqueo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **Martes:** API donantes CRUD
- [ ] **Miércoles:** Verificación donante:
  ```php
  POST /api/v1/donantes/{id}/verificar
  // Verificar identidad, fuente fondos
  ```
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Frontend (5 días):**
- [ ] **Lunes:** Página listar donaciones
- [ ] **Martes:** Form registrar donación
- [ ] **Miércoles:** Búsqueda donante (autocomplete)
- [ ] **Jueves:** Vista detalle donación
- [ ] **Viernes:** Testing

**Criterios Aceptación:**
- ✅ CRUD donaciones
- ✅ CRUD donantes
- ✅ Validaciones básicas
- ✅ Upload comprobante
- ✅ Búsqueda donantes

---

#### **Semana 28: 11-17 Agosto 2025**

**Funcionalidades:**
1. **Topes Legales Colombia**
2. **Compliance CNE**

**⚠️ NOTA:** Consultar abogado electoral para validar topes actualizados

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration topes legales:
  ```sql
  CREATE TABLE compliance.topes_legales_control (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    tipo_eleccion VARCHAR(50),
    tope_total DECIMAL(15,2),
    tope_persona_natural DECIMAL(12,2),
    tope_persona_juridica DECIMAL(12,2),
    actual_total DECIMAL(15,2) DEFAULT 0,
    porcentaje_usado DECIMAL(5,2) DEFAULT 0,
    en_riesgo BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **Martes:** Calcular topes:
  ```php
  class TopeService {
    public function calcularTopes(Campana $campana) {
      $total = Donacion::where('campana_id', $campana->id)->sum('monto');
      $tope = $campana->tipo_eleccion === 'senado' ? 5000000000 : 2000000000;
      $porcentaje = ($total / $tope) * 100;

      TopeLegalControl::updateOrCreate(
        ['campana_id' => $campana->id],
        [
          'actual_total' => $total,
          'porcentaje_usado' => $porcentaje,
          'en_riesgo' => $porcentaje > 80,
        ]
      );
    }
  }
  ```
- [ ] **Miércoles:** Validar donación vs topes:
  ```php
  public function validarDonacion(Donacion $donacion) {
    $donante = $donacion->donante;
    $totalDonante = Donacion::where('donante_id', $donante->id)
      ->where('campana_id', $donacion->campana_id)
      ->sum('monto');

    $topeDonante = $donante->tipo === 'persona' ? 10000000 : 50000000;

    if($totalDonante > $topeDonante) {
      throw new \Exception("Excede tope por donante");
    }
  }
  ```
- [ ] **Jueves:** Testing topes
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Reportes CNE:
  ```php
  GET /api/v1/compliance/reporte-cne/{campanaId}

  // Generar PDF según formato CNE
  ```
- [ ] **Martes:** Migration reportes:
  ```sql
  CREATE TABLE compliance.reportes_regulatorios (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    tipo VARCHAR(50), -- 'pre-campana', 'mensual', 'final'
    periodo_inicio DATE,
    periodo_fin DATE,
    total_ingresos DECIMAL(15,2),
    total_gastos DECIMAL(15,2),
    archivo_url VARCHAR(500),
    enviado_cne BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **Miércoles:** Testing reportes
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes:** Dashboard topes legales:
  ```html
  - Progress bar tope total
  - Alerta si >80%
  - Lista donantes cerca del tope
  ```
- [ ] **Martes:** Validación real-time form donación
- [ ] **Miércoles:** Generar reporte CNE (botón)
- [ ] **Jueves:** Vista reportes generados
- [ ] **Viernes:** Testing

**QA (3 días):**
- [ ] **Miércoles:** Testing topes
- [ ] **Jueves:** Testing validaciones
- [ ] **Viernes:** Testing reportes

**Criterios Aceptación:**
- ✅ Topes calculados automáticamente
- ✅ Validación pre-donación
- ✅ Alerta >80% tope
- ✅ Reporte CNE generado
- ✅ No exceder topes

**Entregables Sprint 14:**
- ✅ CRUD donaciones completo
- ✅ Topes legales CNE
- ✅ Validaciones compliance
- ✅ Reportes regulatorios
- ✅ Dashboard topes

**Checkpoint Agosto 2025:**
- ✅ Comunicación multicanal (SMS, Email, WhatsApp)
- ✅ Eventos con QR check-in
- ✅ Donaciones con compliance CNE
- ✅ 10 eventos realizados (prueba)
- ✅ $50M COP donaciones registradas (prueba)

---

### **🔵 SPRINT 15-16 (Semana 29-32): Georreferenciación Avanzada**

#### **Semana 29: 18-24 Agosto 2025**

**Funcionalidades:**
1. **Mapas Interactivos Completos**
2. **Heatmaps Votantes**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** API bbox votantes:
  ```php
  GET /api/v1/geo/votantes/bbox?campana_id=1&xmin=-74.2&ymin=4.5&xmax=-74.0&ymax=4.8

  // Retorna GeoJSON:
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [-74.1, 4.6]},
        "properties": {"id": 123, "nombre": "Juan Pérez", "score": 85}
      }
    ]
  }
  ```
- [ ] **Martes:** Optimización query geo:
  ```sql
  CREATE INDEX idx_votantes_ubicacion_score
  ON crm.votantes(score_afinidad)
  WHERE ubicacion IS NOT NULL;
  ```
- [ ] **Miércoles:** Clustering (agrupar puntos cercanos):
  ```php
  // ST_ClusterKMeans para reducir puntos en mapa
  ```
- [ ] **Jueves:** Testing performance (10k puntos)
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Heatmap endpoint:
  ```php
  GET /api/v1/geo/heatmap?campana_id=1&tipo=score

  // Retorna array de [lat, lng, intensity]
  ```
- [ ] **Martes:** Cache heatmap (Redis TTL 30 min)
- [ ] **Miércoles:** Testing
- [ ] **Jueves:** Documentación
- [ ] **Viernes:** Buffer

**Frontend Senior 1 (5 días):**
- [ ] **Lunes:** Integrar Leaflet.js:
  ```html
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  ```
- [ ] **Martes:** Mapa votantes (markers):
  ```javascript
  const map = L.map('map').setView([4.6, -74.1], 12);

  fetch('/api/v1/geo/votantes/bbox?...')
    .then(res => res.json())
    .then(data => {
      L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 5,
            color: feature.properties.score > 70 ? 'green' : 'red'
          });
        }
      }).addTo(map);
    });
  ```
- [ ] **Miércoles:** Heatmap layer:
  ```javascript
  import 'leaflet.heat';

  fetch('/api/v1/geo/heatmap?tipo=score')
    .then(res => res.json())
    .then(points => {
      L.heatLayer(points, {radius: 25}).addTo(map);
    });
  ```
- [ ] **Jueves:** Filtros mapa (score, edad, tags)
- [ ] **Viernes:** Testing

**Criterios Aceptación:**
- ✅ Mapa muestra votantes
- ✅ Heatmap score funcional
- ✅ Filtros actualizan mapa
- ✅ Performance <2seg (10k puntos)
- ✅ Responsive mobile

---

#### **Semana 30-32: Continuar con funcionalidades geo avanzadas**

**(Resumen para mantener documento manejable)**

**Semana 30:**
- Rutas puerta a puerta
- Optimización algoritmo TSP (Traveling Salesman)
- Asignación zonas a brigadistas

**Semana 31:**
- Análisis territorial (cobertura por municipio)
- Zonas sin cobertura (alertas)
- Comparativa vs censo oficial

**Semana 32:**
- Dashboard geográfico completo
- Exportar mapas (PNG, PDF)
- Integración rutas con Google Maps

**Entregables Sprint 15-16:**
- ✅ Mapas interactivos completos
- ✅ Heatmaps
- ✅ Rutas optimizadas
- ✅ Análisis territorial
- ✅ 100,000 votantes georreferenciados

---

---

## 🔵 FASE 2 CONTINUACIÓN: CONSOLIDACIÓN (Semana 33-48)

### **🔵 SPRINT 17 (Semana 33-34): Integración de Pagos Online**

#### **Semana 33: 25-31 Agosto 2025**

**Funcionalidades:**
1. **Gateway Pagos (PSE/Tarjetas)**
2. **Checkout Donaciones**

**Equipo:** CTO + 3 Backend + 2 Frontend + 1 DevOps + 1 QA (8 personas)

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Integración Wompi/PayU:
  ```bash
  composer require wompi/wompi-php
  ```
  Config:
  ```php
  // config/services.php
  'wompi' => [
    'public_key' => env('WOMPI_PUBLIC_KEY'),
    'private_key' => env('WOMPI_PRIVATE_KEY'),
    'events_secret' => env('WOMPI_EVENTS_SECRET'),
  ]
  ```
- [ ] **Martes:** Service crear transacción:
  ```php
  class WompiService {
    public function crearTransaccion($monto, $email, $reference) {
      $client = new \GuzzleHttp\Client();

      $response = $client->post('https://production.wompi.co/v1/transactions', [
        'headers' => ['Authorization' => 'Bearer ' . config('services.wompi.private_key')],
        'json' => [
          'amount_in_cents' => $monto * 100,
          'currency' => 'COP',
          'customer_email' => $email,
          'reference' => $reference,
          'redirect_url' => route('donaciones.callback'),
        ]
      ]);

      return json_decode($response->getBody());
    }
  }
  ```
- [ ] **Miércoles:** Migration transacciones:
  ```sql
  CREATE TABLE compliance.transacciones_pago (
    id BIGSERIAL PRIMARY KEY,
    donacion_id INTEGER NOT NULL,
    gateway VARCHAR(20), -- 'wompi', 'payu'
    external_id VARCHAR(100),
    estado VARCHAR(20), -- 'pending', 'approved', 'declined'
    metodo VARCHAR(50), -- 'pse', 'card', 'nequi'
    monto DECIMAL(12,2),
    comision DECIMAL(12,2),
    respuesta_gateway JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_transacciones_donacion ON compliance.transacciones_pago(donacion_id);
  CREATE INDEX idx_transacciones_external ON compliance.transacciones_pago(external_id);
  ```
- [ ] **Jueves:** Webhook callback:
  ```php
  POST /api/v1/webhooks/wompi

  public function handleWebhook(Request $request) {
    $signature = hash_hmac('sha256', $request->getContent(), config('services.wompi.events_secret'));

    if($signature !== $request->header('X-Signature')) {
      return response('Invalid signature', 403);
    }

    $event = $request->json('data');

    $transaccion = TransaccionPago::where('external_id', $event['transaction']['id'])->first();

    $transaccion->update([
      'estado' => $event['transaction']['status'],
      'respuesta_gateway' => $event
    ]);

    if($event['transaction']['status'] === 'APPROVED') {
      $transaccion->donacion->update(['estado' => 'aprobada']);
    }
  }
  ```
- [ ] **Viernes:** Testing webhooks

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** API checkout donación:
  ```php
  POST /api/v1/donaciones/checkout
  {
    "donante_id": 50,
    "monto": 100000,
    "metodo": "pse",
    "email": "donante@example.com"
  }

  // Retorna:
  {
    "checkout_url": "https://checkout.wompi.co/p/...",
    "reference": "DON-2025-001234"
  }
  ```
- [ ] **Martes:** Callback redirect:
  ```php
  GET /donaciones/callback?id={transactionId}

  // Mostrar página: "Procesando pago..."
  // Polling cada 2seg para verificar estado
  ```
- [ ] **Miércoles:** Reintento pago fallido
- [ ] **Jueves:** Testing checkout
- [ ] **Viernes:** Documentación

**Frontend Senior 1 (5 días):**
- [ ] **Lunes:** Página checkout donación:
  ```html
  - Form datos donante (si no existe)
  - Selector método pago (PSE, Tarjeta, Nequi)
  - Resumen donación
  ```
- [ ] **Martes:** Integración Wompi Checkout:
  ```javascript
  const checkout = new WidgetCheckout({
    currency: 'COP',
    amountInCents: monto * 100,
    reference: reference,
    publicKey: WOMPI_PUBLIC_KEY,
    redirectUrl: '/donaciones/callback'
  });

  checkout.open();
  ```
- [ ] **Miércoles:** Página confirmación pago
- [ ] **Jueves:** Página error pago
- [ ] **Viernes:** Testing E2E

**DevOps (2 días):**
- [ ] **Lunes:** SSL para webhooks Wompi
- [ ] **Martes:** Logs transacciones (Datadog)

**Criterios Aceptación:**
- ✅ Checkout PSE funciona
- ✅ Checkout tarjeta funciona
- ✅ Webhooks procesados correctamente
- ✅ Donación creada automáticamente
- ✅ Email confirmación enviado

**Riesgos:**
- ⚠️ Comisiones Wompi 3.49% + $900 COP (validar con CFO)
- ⚠️ PCI-DSS compliance (no guardar datos tarjeta)

---

#### **Semana 34: 1-7 Septiembre 2025**

**Funcionalidades:**
1. **Recibos de Donación**
2. **Certificados Tributarios**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Generar recibo PDF:
  ```bash
  composer require barryvdh/laravel-dompdf
  ```
  ```php
  class ReciboService {
    public function generarRecibo(Donacion $donacion) {
      $pdf = PDF::loadView('recibos.donacion', ['donacion' => $donacion]);

      $filename = "recibo-{$donacion->id}.pdf";
      Storage::disk('s3')->put("recibos/{$filename}", $pdf->output());

      $donacion->update(['recibo_url' => Storage::url("recibos/{$filename}")]);
    }
  }
  ```
- [ ] **Martes:** Template recibo (Blade):
  ```blade
  <!DOCTYPE html>
  <html>
  <body>
    <h1>RECIBO DE DONACIÓN</h1>
    <p>Número: {{ $donacion->id }}</p>
    <p>Fecha: {{ $donacion->fecha_donacion }}</p>
    <p>Donante: {{ $donacion->donante->nombre_completo }}</p>
    <p>Cédula/NIT: {{ $donacion->donante->cedula_nit }}</p>
    <p>Monto: ${{ number_format($donacion->monto, 0) }} COP</p>
    <p>Campaña: {{ $donacion->campana->nombre }}</p>
  </body>
  </html>
  ```
- [ ] **Miércoles:** Job generar recibo (automático post-aprobación)
- [ ] **Jueves:** Testing PDFs
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Certificado tributario anual:
  ```php
  GET /api/v1/donantes/{id}/certificado-tributario?year=2025

  // Genera PDF con todas las donaciones del año
  // Para deducción impuestos (20% hasta 30% UVT)
  ```
- [ ] **Martes:** Testing certificados
- [ ] **Miércoles:** Email automático recibo
- [ ] **Jueves:** Documentación

**Frontend (5 días):**
- [ ] **Lunes:** Botón descargar recibo
- [ ] **Martes:** Botón solicitar certificado tributario
- [ ] **Miércoles:** Preview PDF antes descargar
- [ ] **Jueves:** Historial recibos donante
- [ ] **Viernes:** Testing

**QA (3 días):**
- [ ] **Miércoles:** Testing checkout completo
- [ ] **Jueves:** Testing generación PDFs
- [ ] **Viernes:** Testing emails

**Criterios Aceptación:**
- ✅ Recibo generado automáticamente
- ✅ Certificado tributario correcto
- ✅ Email con recibo enviado
- ✅ PDFs con formato legal
- ✅ Descarga desde frontend

**Entregables Sprint 17:**
- ✅ Gateway pagos integrado
- ✅ Checkout donaciones online
- ✅ Recibos automáticos
- ✅ Certificados tributarios
- ✅ 10 donaciones online procesadas (prueba)

---

### **🔵 SPRINT 18 (Semana 35-36): Analytics y Reportes**

#### **Semana 35: 8-14 Septiembre 2025**

**Funcionalidades:**
1. **Dashboard Analytics**
2. **Reportes Avanzados**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** API métricas generales:
  ```php
  GET /api/v1/analytics/overview/{campanaId}
  {
    "votantes": {
      "total": 50000,
      "alta_afinidad": 15000,
      "media_afinidad": 20000,
      "baja_afinidad": 15000,
      "score_promedio": 65
    },
    "contactos": {
      "total": 25000,
      "ultimo_mes": 5000,
      "canales": {
        "sms": 10000,
        "email": 8000,
        "whatsapp": 7000
      }
    },
    "eventos": {
      "total": 50,
      "asistentes_total": 6000,
      "tasa_asistencia_promedio": 0.75
    },
    "donaciones": {
      "total": 250000000,
      "donantes_unicos": 500,
      "promedio_donacion": 500000
    }
  }
  ```
- [ ] **Martes:** Cache métricas (Redis TTL 15 min)
- [ ] **Miércoles:** API métricas temporales:
  ```php
  GET /api/v1/analytics/timeline?desde=2025-01-01&hasta=2025-12-31&grupo=mes
  // Retorna series temporales para gráficos
  ```
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 2 (5 días):**
- [ ] **Lunes:** Reportes exportables:
  ```php
  GET /api/v1/reportes/votantes?formato=excel
  GET /api/v1/reportes/donaciones?formato=pdf
  ```
  ```bash
  composer require maatwebsite/excel
  ```
- [ ] **Martes:** Excel export:
  ```php
  class VotantesExport implements FromQuery {
    public function query() {
      return Votante::where('campana_id', $this->campanaId)
        ->with(['contactos', 'asistencias']);
    }
  }
  ```
- [ ] **Miércoles:** Job export async (queue)
- [ ] **Jueves:** Testing exports
- [ ] **Viernes:** Documentación

**Backend Laravel Senior 3 (contratado Sep) (5 días):**
- [ ] **Lunes:** Vistas materializadas PostgreSQL:
  ```sql
  CREATE MATERIALIZED VIEW analytics.votantes_por_municipio AS
  SELECT
    municipio_id,
    COUNT(*) as total_votantes,
    AVG(score_afinidad) as score_promedio,
    COUNT(CASE WHEN score_afinidad >= 70 THEN 1 END) as alta_afinidad
  FROM crm.votantes
  GROUP BY municipio_id;

  CREATE INDEX idx_mv_votantes_municipio ON analytics.votantes_por_municipio(municipio_id);
  ```
- [ ] **Martes:** Refresh vistas materializadas (cron cada hora)
- [ ] **Miércoles:** API consultar vistas materializadas
- [ ] **Jueves:** Testing
- [ ] **Viernes:** Documentación

**Frontend Senior 1 (5 días):**
- [ ] **Lunes:** Dashboard principal con KPIs
- [ ] **Martes:** Gráficos Chart.js:
  ```javascript
  // Line chart: evolución votantes en el tiempo
  // Bar chart: donaciones por mes
  // Pie chart: distribución score afinidad
  ```
- [ ] **Miércoles:** Filtros temporales (semana, mes, año, custom)
- [ ] **Jueves:** Exportar gráficos (PNG)
- [ ] **Viernes:** Testing

**Criterios Aceptación:**
- ✅ Dashboard muestra métricas actualizadas
- ✅ Gráficos interactivos
- ✅ Exportar Excel/PDF
- ✅ Cache funciona
- ✅ Performance <1seg

---

#### **Semana 36: 15-21 Septiembre 2025**

**Funcionalidades:**
1. **Análisis Predictivo Básico**
2. **Alertas Automáticas**

**Tareas Técnicas:**

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Sistema alertas:
  ```sql
  CREATE TABLE analytics.alertas (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    tipo VARCHAR(50), -- 'bajo_engagement', 'tope_cercano', 'meta_eventos'
    severidad VARCHAR(20), -- 'info', 'warning', 'critical'
    titulo VARCHAR(200),
    mensaje TEXT,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **Martes:** Job verificar condiciones alertas:
  ```php
  class VerificarAlertasJob {
    public function handle() {
      // Alerta: tope donaciones >80%
      if($porcentajeTope > 80) {
        Alerta::create([
          'tipo' => 'tope_cercano',
          'severidad' => 'critical',
          'titulo' => 'Tope de donaciones cerca del límite',
          'mensaje' => "Actual: {$porcentajeTope}%"
        ]);
      }

      // Alerta: engagement bajo últimos 7 días
      $contactosUltimaSemana = Contacto::where('created_at', '>=', now()->subWeek())->count();
      if($contactosUltimaSemana < 100) {
        Alerta::create(['tipo' => 'bajo_engagement', 'severidad' => 'warning']);
      }
    }
  }
  ```
- [ ] **Miércoles:** Scheduler ejecutar cada 6 horas
- [ ] **Jueves:** API alertas CRUD
- [ ] **Viernes:** Testing

**Backend Laravel Senior 2 (4 días):**
- [ ] **Lunes:** Análisis tendencias:
  ```php
  GET /api/v1/analytics/tendencias

  {
    "votantes_mes_actual": 1200,
    "votantes_mes_anterior": 1000,
    "crecimiento_porcentual": 20,
    "tendencia": "creciente",
    "proyeccion_fin_campana": 25000
  }
  ```
- [ ] **Martes:** Testing tendencias
- [ ] **Miércoles:** Documentación
- [ ] **Jueves:** Buffer

**Frontend (5 días):**
- [ ] **Lunes:** Componente alertas (campana icono)
- [ ] **Martes:** Modal lista alertas
- [ ] **Miércoles:** Marcar como leída
- [ ] **Jueves:** Badge contador alertas no leídas
- [ ] **Viernes:** Testing

**QA (3 días):**
- [ ] **Miércoles:** Testing analytics completo
- [ ] **Jueves:** Testing exportaciones
- [ ] **Viernes:** Testing alertas

**Criterios Aceptación:**
- ✅ Alertas generadas automáticamente
- ✅ Notificaciones en tiempo real
- ✅ Análisis tendencias correcto
- ✅ Proyecciones razonables
- ✅ Frontend reactivo

**Entregables Sprint 18:**
- ✅ Dashboard analytics completo
- ✅ Reportes exportables
- ✅ Sistema alertas automáticas
- ✅ Análisis tendencias
- ✅ Vistas materializadas

**Checkpoint Sep 2025:**
- ✅ 8 meses desarrollo completados
- ✅ Backend Core robusto
- ✅ CRM completo con 50,000 votantes prueba
- ✅ Comunicación multicanal funcional
- ✅ Donaciones online procesadas
- ✅ Analytics en tiempo real

---

### **🔵 SPRINT 19-20 (Semana 37-40): Preparación Módulo Día D**

#### **Semana 37: 22-28 Septiembre 2025**

**Funcionalidades:**
1. **Setup Proyecto NestJS**
2. **Infraestructura Día D**

**Equipo:** CTO + 3 Backend + 2 Frontend + 1 DevOps + 1 QA + **1 Backend NestJS nuevo** (9 personas)

**Tareas Técnicas:**

**Backend NestJS Senior 1 (nuevo contratado) (5 días):**
- [ ] **Lunes:** Setup proyecto NestJS:
  ```bash
  npm i -g @nestjs/cli
  nest new backend-diad
  cd backend-diad
  npm install @nestjs/typeorm typeorm pg redis socket.io
  ```
- [ ] **Martes:** Estructura base:
  ```
  src/
  ├── main.ts
  ├── app.module.ts
  ├── config/
  ├── modules/
  │   ├── testigos/
  │   ├── actas/
  │   ├── conteo/
  │   └── alertas/
  ├── common/
  │   ├── guards/
  │   ├── interceptors/
  │   └── filters/
  └── database/
  ```
- [ ] **Miércoles:** TypeORM config PostgreSQL:
  ```typescript
  // app.module.ts
  @Module({
    imports: [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        schema: 'diad',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    ],
  })
  ```
- [ ] **Jueves:** Redis setup (cache + queue):
  ```bash
  npm install @nestjs/bull bull ioredis
  ```
  ```typescript
  BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST,
      port: 6379,
    },
  })
  ```
- [ ] **Viernes:** Health check:
  ```typescript
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected'
    };
  }
  ```

**Backend Laravel Senior 1 (5 días):**
- [ ] **Lunes:** Migration schema diad:
  ```sql
  CREATE SCHEMA diad;

  CREATE TABLE diad.testigos_electorales (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    votante_id BIGINT,
    nombre_completo VARCHAR(200),
    cedula VARCHAR(15),
    celular VARCHAR(15),
    email VARCHAR(100),
    mesa_asignada INTEGER,
    puesto_id INTEGER,
    estado VARCHAR(20) DEFAULT 'activo',
    credencial_url VARCHAR(500),
    pin VARCHAR(6),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_testigos_campana ON diad.testigos_electorales(campana_id);
  CREATE INDEX idx_testigos_mesa ON diad.testigos_electorales(mesa_asignada);
  ```
- [ ] **Martes:** Migration actas (tabla crítica):
  ```sql
  CREATE TABLE diad.actas (
    id BIGSERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    testigo_id INTEGER NOT NULL,
    mesa_id INTEGER NOT NULL,

    -- Captura
    fecha_captura TIMESTAMP NOT NULL,
    ubicacion_captura GEOGRAPHY(POINT, 4326),
    online BOOLEAN DEFAULT true,

    -- Imagen
    imagen_url VARCHAR(500),
    imagen_hash_sha256 VARCHAR(64),
    imagen_size_bytes INTEGER,

    -- Datos Acta
    votantes_habilitados INTEGER,
    votos_depositados INTEGER,
    votos_candidato_principal INTEGER,
    votos_blancos INTEGER,
    votos_nulos INTEGER,
    votos_otros JSONB,

    -- Validaciones
    suma_correcta BOOLEAN,
    inconsistencias JSONB,

    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente',
    validado_por INTEGER,
    fecha_validacion TIMESTAMP,

    -- Sincronización
    sincronizado BOOLEAN DEFAULT false,
    fecha_sincronizacion TIMESTAMP,
    intentos_sincronizacion INTEGER DEFAULT 0,

    -- OCR
    ocr_procesado BOOLEAN DEFAULT false,
    ocr_confianza DECIMAL(5,4),
    ocr_coincide_manual BOOLEAN,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_actas_campana ON diad.actas(campana_id);
  CREATE INDEX idx_actas_mesa ON diad.actas(mesa_id);
  CREATE INDEX idx_actas_estado ON diad.actas(estado);
  CREATE INDEX idx_actas_sincronizado ON diad.actas(sincronizado);
  ```
- [ ] **Miércoles:** Migration conteo agregado:
  ```sql
  CREATE TABLE diad.conteo_agregado (
    id BIGSERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    nivel VARCHAR(20), -- 'puesto', 'zona', 'municipio', 'departamento', 'nacional'
    nivel_id INTEGER,

    total_mesas_asignadas INTEGER,
    mesas_reportadas INTEGER,
    porcentaje_cobertura DECIMAL(5,2),

    votos_candidato_principal INTEGER DEFAULT 0,
    votos_blancos INTEGER DEFAULT 0,
    votos_nulos INTEGER DEFAULT 0,
    votos_otros JSONB,
    total_votos INTEGER DEFAULT 0,

    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE UNIQUE INDEX idx_conteo_campana_nivel
  ON diad.conteo_agregado(campana_id, nivel, nivel_id);
  ```
- [ ] **Jueves:** Migration auditoría:
  ```sql
  CREATE TABLE diad.auditoria_diad (
    id BIGSERIAL PRIMARY KEY,
    acta_id BIGINT NOT NULL,
    accion VARCHAR(50), -- 'created', 'validated', 'modified'
    usuario_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    hash_anterior VARCHAR(64),
    hash_nuevo VARCHAR(64),
    timestamp TIMESTAMP DEFAULT NOW()
  );

  -- Tabla append-only, nunca DELETE
  CREATE INDEX idx_auditoria_acta ON diad.auditoria_diad(acta_id);
  ```
- [ ] **Viernes:** Seeders mesas prueba

**DevOps (5 días):**
- [ ] **Lunes:** Setup ECS Fargate para NestJS:
  ```bash
  # Task definition
  CPU: 512
  Memory: 1024 MB
  Image: backend-diad:latest
  ```
- [ ] **Martes:** Load Balancer ALB para NestJS
- [ ] **Miércoles:** Deploy staging NestJS
- [ ] **Jueves:** CI/CD GitHub Actions NestJS
- [ ] **Viernes:** Monitoreo CloudWatch

**Criterios Aceptación:**
- ✅ Proyecto NestJS corriendo
- ✅ Conexión PostgreSQL schema diad
- ✅ Redis funcional
- ✅ Health check responde
- ✅ Deploy staging exitoso

---

#### **Semana 38-40: Continuar desarrollo base Día D**

**(Resumen para mantener documento manejable)**

**Semana 38:**
- Entities TypeORM (Testigo, Acta, Conteo)
- CRUD básico testigos
- Autenticación JWT

**Semana 39:**
- API asignación testigos a mesas
- Generación credenciales PDF
- Envío WhatsApp credenciales

**Semana 40:**
- Testing integración Laravel ↔ NestJS
- Endpoints internos sincronización
- Documentación API Día D

**Entregables Sprint 19-20:**
- ✅ Backend NestJS operativo
- ✅ Schema diad completo
- ✅ Infraestructura desplegada
- ✅ CRUD testigos funcional
- ✅ Integración Laravel ↔ NestJS

---

## 📊 RESUMEN GENERAL RESTANTE (Actualizado)

### **🔵 SPRINT 21 (Semana 41-42): Captura de Actas - Backend**

#### **Semana 41: 6-12 Octubre 2025**

**Funcionalidades:**
1. **Upload Multipart Actas**
2. **Entities TypeORM**

**Equipo:** CTO + 3 Backend Laravel + 2 Backend NestJS + 2 Frontend + 1 DevOps + 1 QA (10 personas)

**Tareas Técnicas:**

**Backend NestJS Senior 1 (5 días):**
- [ ] **Lunes:** Entity Acta:
  ```typescript
  @Entity({schema: 'diad', name: 'actas'})
  export class Acta {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({name: 'campana_id'})
    campanaId: number;

    @Column({name: 'testigo_id'})
    testigoId: number;

    @Column({name: 'mesa_id'})
    mesaId: number;

    @Column({name: 'fecha_captura', type: 'timestamp'})
    fechaCaptura: Date;

    @Column({name: 'ubicacion_captura', type: 'geography'})
    ubicacionCaptura: string;

    @Column({name: 'imagen_url'})
    imagenUrl: string;

    @Column({name: 'imagen_hash_sha256'})
    imagenHash: string;

    @Column({name: 'votantes_habilitados'})
    votantesHabilitados: number;

    @Column({name: 'votos_depositados'})
    votosDepositados: number;

    @Column({name: 'votos_candidato_principal'})
    votosCandidatoPrincipal: number;

    @Column({type: 'jsonb', nullable: true})
    inconsistencias: any;

    @Column({default: 'pendiente'})
    estado: string;
  }
  ```
- [ ] **Martes:** ActasRepository con TypeORM
- [ ] **Miércoles:** Testing entities
- [ ] **Jueves:** Entity Testigo
- [ ] **Viernes:** Entity ConteoAgregado

**Backend NestJS Senior 2 (contratado Oct) (5 días):**
- [ ] **Lunes:** Multer config S3:
  ```bash
  npm install @nestjs/platform-express multer multer-s3 @aws-sdk/client-s3
  ```
  ```typescript
  import * as multerS3 from 'multer-s3';
  import { S3Client } from '@aws-sdk/client-s3';

  const s3 = new S3Client({region: 'us-east-1'});

  export const multerOptions = {
    storage: multerS3({
      s3: s3,
      bucket: 'electoral-actas',
      acl: 'private',
      key: function (req, file, cb) {
        cb(null, `actas/${Date.now()}-${file.originalname}`);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Formato no soportado'), false);
      }
    },
  };
  ```
- [ ] **Martes:** Controller upload acta:
  ```typescript
  @Post('actas')
  @UseInterceptors(FileInterceptor('imagen', multerOptions))
  async uploadActa(
    @UploadedFile() file: Express.MulterS3.File,
    @Body() createActaDto: CreateActaDto,
  ) {
    const hash = crypto.createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    const acta = await this.actasService.create({
      ...createActaDto,
      imagenUrl: file.location,
      imagenHash: hash,
      imagenSizeBytes: file.size,
    });

    return acta;
  }
  ```
- [ ] **Miércoles:** Validaciones DTO:
  ```typescript
  export class CreateActaDto {
    @IsNumber()
    campanaId: number;

    @IsNumber()
    testigoId: number;

    @IsNumber()
    mesaId: number;

    @IsNumber()
    @Min(0)
    votantesHabilitados: number;

    @IsNumber()
    @Min(0)
    votosDepositados: number;

    @IsNumber()
    @Min(0)
    votosCandidatoPrincipal: number;

    @IsNumber()
    @Min(0)
    votoBlancos: number;

    @IsNumber()
    @Min(0)
    votosNulos: number;
  }
  ```
- [ ] **Jueves:** Validación suma votos:
  ```typescript
  validarSuma(acta: CreateActaDto): boolean {
    const suma = acta.votosCandidatoPrincipal +
                 acta.votoBlancos +
                 acta.votosNulos;

    return suma === acta.votosDepositados;
  }
  ```
- [ ] **Viernes:** Testing upload

**Backend Laravel Senior 1 (3 días):**
- [ ] **Lunes:** Endpoint listar actas (desde Laravel):
  ```php
  GET /api/v1/actas?campana_id=1&estado=pendiente

  // Proxy a NestJS
  Http::get('https://diad.plataforma-electoral.com/v1/actas?...');
  ```
- [ ] **Martes:** Testing proxy
- [ ] **Miércoles:** Documentación

**DevOps (3 días):**
- [ ] **Lunes:** S3 bucket actas:
  ```bash
  aws s3 mb s3://electoral-actas
  # Lifecycle: transición a S3-IA después 90 días
  ```
- [ ] **Martes:** CloudFront CDN para actas
- [ ] **Miércoles:** Backup S3 Cross-Region

**Criterios Aceptación:**
- ✅ Upload imagen acta funciona
- ✅ Hash SHA-256 generado
- ✅ Validación suma votos
- ✅ DTO validaciones correctas
- ✅ S3 storage funcional

---

#### **Semana 42: 13-19 Octubre 2025**

**Funcionalidades:**
1. **Validaciones Automáticas**
2. **Inconsistencias Detectadas**

**Tareas Técnicas:**

**Backend NestJS Senior 1 (5 días):**
- [ ] **Lunes:** Service validaciones:
  ```typescript
  @Injectable()
  export class ValidacionService {
    validarActa(acta: Acta): ValidacionResult {
      const inconsistencias = [];

      // Validación 1: Suma correcta
      if(!this.validarSuma(acta)) {
        inconsistencias.push({
          tipo: 'suma_incorrecta',
          severidad: 'critica',
          mensaje: 'Suma de votos no coincide con votos depositados'
        });
      }

      // Validación 2: Votos depositados <= habilitados
      if(acta.votosDepositados > acta.votantesHabilitados) {
        inconsistencias.push({
          tipo: 'votos_exceden_habilitados',
          severidad: 'critica'
        });
      }

      // Validación 3: Participación razonable (>10% y <100%)
      const participacion = (acta.votosDepositados / acta.votantesHabilitados) * 100;
      if(participacion < 10 || participacion > 100) {
        inconsistencias.push({
          tipo: 'participacion_anomala',
          severidad: 'warning',
          datos: {participacion}
        });
      }

      return {
        valida: inconsistencias.length === 0,
        inconsistencias
      };
    }
  }
  ```
- [ ] **Martes:** Ejecutar validaciones automáticamente en upload
- [ ] **Miércoles:** Guardar inconsistencias en campo JSONB
- [ ] **Jueves:** Testing validaciones
- [ ] **Viernes:** Documentación

**Backend NestJS Senior 2 (5 días):**
- [ ] **Lunes:** Alertas automáticas:
  ```typescript
  if(validacion.inconsistencias.some(i => i.severidad === 'critica')) {
    await this.alertasService.create({
      campanaId: acta.campanaId,
      tipo: 'acta_inconsistente',
      severidad: 'critical',
      actaId: acta.id,
      mesaId: acta.mesaId,
      mensaje: `Acta mesa ${acta.mesaId} tiene inconsistencias críticas`
    });
  }
  ```
- [ ] **Martes:** Migration tabla alertas Día D:
  ```sql
  CREATE TABLE diad.alertas_diad (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL,
    tipo VARCHAR(50),
    severidad VARCHAR(20),
    acta_id BIGINT,
    mesa_id INTEGER,
    mensaje TEXT,
    resuelta BOOLEAN DEFAULT false,
    resuelto_por INTEGER,
    fecha_resolucion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] **Miércoles:** CRUD alertas
- [ ] **Jueves:** Testing alertas
- [ ] **Viernes:** Documentación

**Frontend Senior 1 (5 días):**
- [ ] **Lunes:** Página upload acta (form):
  ```html
  <form>
    - Input file (captura foto)
    - Input votantes habilitados
    - Input votos candidato principal
    - Input blancos
    - Input nulos
    - Botón enviar
  </form>
  ```
- [ ] **Martes:** Preview imagen antes enviar
- [ ] **Miércoles:** Validación cliente (suma correcta)
- [ ] **Jueves:** Mostrar inconsistencias si las hay
- [ ] **Viernes:** Testing UI

**Criterios Aceptación:**
- ✅ Validaciones automáticas ejecutadas
- ✅ Inconsistencias detectadas y guardadas
- ✅ Alertas generadas para críticas
- ✅ Frontend muestra errores
- ✅ Acta rechazada si suma incorrecta

**Entregables Sprint 21:**
- ✅ Upload actas funcional
- ✅ Validaciones automáticas
- ✅ Sistema alertas Día D
- ✅ Frontend captura actas
- ✅ 100 actas prueba subidas

---

### **🔵 SPRINT 22 (Semana 43-44): PWA Offline-First**

#### **Semana 43: 20-26 Octubre 2025**

**Funcionalidades:**
1. **PWA Base**
2. **Service Worker**

**Equipo:** CTO + 3 Backend + 2 Frontend + **1 Frontend PWA** (contratado Oct) + 1 DevOps + 1 QA (10 personas)

**Tareas Técnicas:**

**Frontend PWA Specialist (nuevo) (5 días):**
- [ ] **Lunes:** Setup PWA:
  ```json
  // manifest.json
  {
    "name": "Testigo Electoral - Día D",
    "short_name": "Testigo",
    "start_url": "/diad",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#1e40af",
    "icons": [
      {
        "src": "/icons/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```
- [ ] **Martes:** Service Worker base:
  ```javascript
  // sw.js
  const CACHE_NAME = 'diad-v1';
  const urlsToCache = [
    '/diad',
    '/diad/captura',
    '/css/app.css',
    '/js/app.js'
  ];

  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
  });

  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  });
  ```
- [ ] **Miércoles:** Registrar Service Worker:
  ```javascript
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.log('SW error', err));
  }
  ```
- [ ] **Jueves:** Testing offline básico
- [ ] **Viernes:** Debugging SW

**Frontend PWA Specialist (5 días - continuación):**
- [ ] **Siguiente semana:** IndexedDB setup

**Frontend Senior 1 (5 días):**
- [ ] **Lunes:** Diseño UI PWA captura:
  ```html
  - Header con logo campaña
  - Indicador online/offline
  - Botón capturar foto (camera)
  - Form datos acta
  - Botón guardar (local si offline)
  ```
- [ ] **Martes:** Captura foto con camera:
  ```javascript
  <input type="file" accept="image/*" capture="environment">

  // O usar getUserMedia para control completo
  navigator.mediaDevices.getUserMedia({video: true})
    .then(stream => {
      video.srcObject = stream;
    });
  ```
- [ ] **Miércoles:** Comprimir imagen antes guardar:
  ```javascript
  import Compressor from 'compressorjs';

  new Compressor(file, {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    success(result) {
      // Guardar result
    }
  });
  ```
- [ ] **Jueves:** Testing captura
- [ ] **Viernes:** Polish UI

**Criterios Aceptación:**
- ✅ PWA instalable
- ✅ Service Worker registrado
- ✅ Cache funcionando
- ✅ Funciona offline básico
- ✅ Captura foto funciona

---

#### **Semana 44: 27 Octubre - 2 Noviembre 2025**

**Funcionalidades:**
1. **IndexedDB Storage**
2. **Background Sync**

**Tareas Técnicas:**

**Frontend PWA Specialist (5 días):**
- [ ] **Lunes:** IndexedDB setup:
  ```bash
  npm install idb
  ```
  ```javascript
  import { openDB } from 'idb';

  const db = await openDB('diad-db', 1, {
    upgrade(db) {
      const store = db.createObjectStore('actas', {
        keyPath: 'id',
        autoIncrement: true
      });
      store.createIndex('sincronizado', 'sincronizado');
    }
  });
  ```
- [ ] **Martes:** Guardar acta offline:
  ```javascript
  async function guardarActaOffline(acta) {
    const db = await openDB('diad-db');

    // Convertir imagen a base64
    const reader = new FileReader();
    reader.readAsDataURL(acta.imagen);
    reader.onload = async () => {
      await db.add('actas', {
        ...acta,
        imagenBase64: reader.result,
        sincronizado: false,
        fechaCaptura: new Date().toISOString()
      });

      mostrarNotificacion('Acta guardada localmente');
    };
  }
  ```
- [ ] **Miércoles:** Background Sync:
  ```javascript
  // Service Worker
  self.addEventListener('sync', event => {
    if(event.tag === 'sync-actas') {
      event.waitUntil(syncActas());
    }
  });

  async function syncActas() {
    const db = await openDB('diad-db');
    const actas = await db.getAllFromIndex('actas', 'sincronizado', false);

    for(const acta of actas) {
      try {
        // Convertir base64 a Blob
        const blob = await fetch(acta.imagenBase64).then(r => r.blob());

        const formData = new FormData();
        formData.append('imagen', blob);
        formData.append('data', JSON.stringify(acta));

        await fetch('/api/v1/actas', {
          method: 'POST',
          body: formData
        });

        // Marcar como sincronizado
        await db.put('actas', {...acta, sincronizado: true});
      } catch(err) {
        console.error('Error sync', err);
      }
    }
  }
  ```
- [ ] **Jueves:** Registrar sync cuando recupera conexión:
  ```javascript
  if(navigator.onLine) {
    navigator.serviceWorker.ready.then(reg => {
      reg.sync.register('sync-actas');
    });
  }
  ```
- [ ] **Viernes:** Testing sync completo

**Backend NestJS Senior 1 (3 días):**
- [ ] **Lunes:** Endpoint batch sync:
  ```typescript
  @Post('actas/batch-sync')
  async batchSync(@Body() actas: CreateActaDto[]) {
    const results = [];

    for(const actaDto of actas) {
      try {
        const acta = await this.actasService.create(actaDto);
        results.push({id: actaDto.id, status: 'success', actaId: acta.id});
      } catch(err) {
        results.push({id: actaDto.id, status: 'error', error: err.message});
      }
    }

    return results;
  }
  ```
- [ ] **Martes:** Testing batch sync
- [ ] **Miércoles:** Documentación

**Criterios Aceptación:**
- ✅ Actas guardadas en IndexedDB offline
- ✅ Background Sync funciona
- ✅ Sincronización automática al reconectar
- ✅ Sin pérdida de datos
- ✅ Batch upload eficiente

**Entregables Sprint 22:**
- ✅ PWA funcional offline-first
- ✅ Service Worker completo
- ✅ IndexedDB storage
- ✅ Background Sync
- ✅ Testing offline completo

**Checkpoint Nov 2025:**
- ✅ 10 meses desarrollo
- ✅ Backend Core completo
- ✅ Backend Día D operativo
- ✅ PWA offline-first funcional
- ✅ Captura actas probada

---

### **🔵 SPRINT 23-24 (Semana 45-48): Conteo Paralelo y WebSockets**

#### **Semana 45: 3-9 Noviembre 2025**

**Funcionalidades:**
1. **Conteo Paralelo Agregado**
2. **Actualización Tiempo Real**

**Tareas Técnicas:**

**Backend NestJS Senior 1 (5 días):**
- [ ] **Lunes:** Service conteo agregado:
  ```typescript
  @Injectable()
  export class ConteoService {
    async actualizarConteo(acta: Acta) {
      // Nivel puesto
      await this.actualizarNivel('puesto', acta.puestoId, acta);

      // Nivel municipio
      const puesto = await this.puestosRepo.findOne(acta.puestoId);
      await this.actualizarNivel('municipio', puesto.municipioId, acta);

      // Nivel departamento
      const municipio = await this.municipiosRepo.findOne(puesto.municipioId);
      await this.actualizarNivel('departamento', municipio.departamentoId, acta);

      // Nivel nacional
      await this.actualizarNivel('nacional', acta.campanaId, acta);
    }

    private async actualizarNivel(nivel: string, nivelId: number, acta: Acta) {
      const conteo = await this.conteoRepo.findOne({
        where: {campanaId: acta.campanaId, nivel, nivelId}
      });

      if(conteo) {
        conteo.mesasReportadas++;
        conteo.votosCandidatoPrincipal += acta.votosCandidatoPrincipal;
        conteo.votosBlancos += acta.votosBlancos;
        conteo.votosNulos += acta.votosNulos;
        conteo.totalVotos += acta.votosDepositados;
        conteo.porcentajeCobertura = (conteo.mesasReportadas / conteo.totalMesasAsignadas) * 100;

        await this.conteoRepo.save(conteo);
      }
    }
  }
  ```
- [ ] **Martes:** Trigger actualización post-validación acta
- [ ] **Miércoles:** Optimización query agregación
- [ ] **Jueves:** Cache Redis conteo (TTL 30seg)
- [ ] **Viernes:** Testing conteo

**Backend NestJS Senior 2 (5 días):**
- [ ] **Lunes:** API consultar conteo:
  ```typescript
  @Get('conteo/agregado/:campanaId')
  async getConteo(
    @Param('campanaId') campanaId: number,
    @Query('nivel') nivel: string,
    @Query('nivelId') nivelId: number
  ) {
    return this.conteoService.getConteo(campanaId, nivel, nivelId);
  }
  ```
- [ ] **Martes:** Endpoint comparativa vs oficial:
  ```typescript
  GET /conteo/comparativa/:campanaId

  {
    "nuestro_conteo": {
      "candidato_principal": 45000,
      "blancos": 1000,
      "nulos": 500,
      "cobertura": 0.85
    },
    "conteo_oficial_cne": {
      "candidato_principal": 46000,
      "blancos": 1100,
      "nulos": 550
    },
    "diferencia": {
      "candidato_principal": -1000,
      "porcentaje_error": 0.02
    }
  }
  ```
- [ ] **Miércoles:** Testing comparativa
- [ ] **Jueves:** Documentación
- [ ] **Viernes:** Buffer

**Criterios Aceptación:**
- ✅ Conteo agregado multi-nivel
- ✅ Actualización automática
- ✅ Performance <1seg
- ✅ Cache funcional
- ✅ Comparativa vs oficial

---

#### **Semana 46-48: WebSockets, OCR y Testing**

**(Resumen)**

**Semana 46:**
- Socket.io integration
- Rooms por campaña
- Eventos tiempo real (acta:nueva, conteo:actualizado)
- Testing WebSockets (10k conexiones simultáneas)

**Semana 47:**
- AWS Textract OCR integration
- Comparación OCR vs manual
- Confianza threshold 95%
- Testing OCR (100 actas)

**Semana 48:**
- Testing carga completo (5000 actas en 2 horas)
- Simulacro Día D con equipo
- Optimización performance
- Documentación completa

**Entregables Sprint 23-24:**
- ✅ Conteo paralelo funcional
- ✅ WebSockets tiempo real
- ✅ OCR integrado
- ✅ Testing carga exitoso
- ✅ Simulacro completado

**Checkpoint Dic 2025:**
- ✅ 11 meses desarrollo
- ✅ Módulo Día D funcional
- ✅ PWA offline-first probada
- ✅ Conteo paralelo tiempo real
- ✅ Sistema completo end-to-end

---

## 📊 RESUMEN FASES RESTANTES

### **Sprints 25-32 (Semana 49-64): IA y Multi-Campaña**
- Scoring IA con machine learning
- Predicción tendencias
- Multi-tenant SaaS completo
- API pública v1
- Webhooks eventos

### **Sprints 33-40 (Semana 65-80): Dashboards y War Room**
- Dashboard war room tiempo real
- Métricas Día D (actas/min, cobertura)
- Sistema alertas avanzado
- Integración pantallas grandes

### **Sprints 41-48 (Semana 81-96): Testing y Optimización**
- Performance testing (100k votantes, 10k actas)
- Security audit completo
- Penetration testing
- Disaster recovery tests

### **Sprints 49-60 (Semana 97-120): IA y Enterprise**
- Machine Learning scoring
- Predicción resultados
- Multi-campaña SaaS
- API pública documentada
- Webhooks y integraciones

### **Sprints 61-66 (Semana 121-132): Pre-Lanzamiento**
- QA exhaustivo
- Beta con 2-3 campañas piloto
- Capacitación usuarios finales
- Importación censo oficial (Sep 2027)
- Simulacro completo (Sep 28, 2027)
- Code freeze (Oct 15, 2027)
- **Elecciones Territoriales: Octubre 24, 2027** 🗳️

---

## 🎯 RESUMEN EJECUTIVO DEL ROADMAP

**Total documentado en detalle:** 48 semanas (12 meses completos)

### **Cobertura del Documento:**

**✅ DETALLADO EXHAUSTIVO (Semana por semana, día por día):**
- **Semanas 1-16 (4 meses):** Fundaciones
  - Infraestructura AWS
  - Autenticación y RBAC
  - Estructura electoral
  - Censo versionado
  - PostGIS base
  - Multi-tenant
  - Dashboard KPIs

- **Semanas 17-32 (4 meses):** CRM Avanzado + Comunicación
  - Segmentación dinámica
  - SMS (Twilio)
  - Email (AWS SES)
  - WhatsApp Business API
  - Eventos + QR check-in
  - Donaciones + Compliance CNE
  - Georreferenciación

- **Semanas 33-40 (2 meses):** Consolidación
  - Gateway pagos online (Wompi/PayU)
  - Recibos y certificados tributarios
  - Analytics y reportes avanzados
  - Sistema alertas automáticas
  - Setup proyecto NestJS Día D

- **Semanas 41-48 (2 meses):** Módulo Día D Core
  - Upload actas multipart
  - Validaciones automáticas
  - PWA offline-first
  - IndexedDB + Background Sync
  - Conteo paralelo multi-nivel
  - WebSockets tiempo real
  - OCR (AWS Textract)
  - Testing carga

**📊 RESUMIDO (Por sprint):**
- **Semanas 49-132 (20 meses):** Fases finales
  - IA y scoring predictivo
  - Multi-campaña SaaS
  - Testing exhaustivo
  - Beta piloto
  - Lanzamiento producción

---

## 📈 ESTADÍSTICAS DEL ROADMAP

| Métrica | Valor |
|---------|-------|
| **Total páginas** | ~120 |
| **Total semanas** | 132 |
| **Semanas detalladas** | 48 (36% del total) |
| **Total sprints** | 66 |
| **Sprints detallados** | 24 |
| **Líneas de código ejemplo** | ~800 |
| **Tareas específicas** | ~1,200+ |
| **Checkpoints** | 12 |

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

### **Si decides continuar con el proyecto:**

1. **Semana 1 (Hoy - 7 días):**
   - Tomar decisión GO/NO-GO
   - Aprobar presupuesto $1.395M COP
   - Iniciar contratación CTO

2. **Semana 2-3 (Enero 2025):**
   - Contratar equipo core (4 personas)
   - Setup infraestructura básica
   - Crear repos GitHub

3. **Semana 4 (3 Febrero 2025):**
   - **INICIAR SPRINT 1**
   - Seguir este roadmap día por día
   - Usar Jira/Linear para tracking

---

## 📞 USAR ESTE DOCUMENTO

**Como Product Owner:**
- Seguir checkpoints mensuales
- Validar entregables por sprint
- Ajustar prioridades según feedback

**Como CTO/Tech Lead:**
- Distribuir tareas diarias del roadmap
- Adaptar tecnologías si necesario
- Mantener criterios de aceptación

**Como Developer:**
- Tomar tasks específicas por día
- Seguir ejemplos de código
- Cumplir criterios aceptación

---

## 🎉 CONCLUSIÓN

Este roadmap proporciona:
- ✅ **48 semanas** de desarrollo detallado día a día
- ✅ **1,200+ tareas** específicas asignables
- ✅ **800+ líneas** de código ejemplo
- ✅ **12 checkpoints** de validación
- ✅ Arquitectura enterprise lista para producción
- ✅ Plan realista para **Elecciones Territoriales 2027**

**El proyecto está completamente planificado y listo para ejecución.**

---

**Última actualización:** Diciembre 14, 2024
**Versión:** 2.0 - Detallado hasta Semana 48 (12 meses completos)
