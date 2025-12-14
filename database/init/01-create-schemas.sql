-- ============================================
-- PLATAFORMA ELECTORAL COLOMBIA
-- INICIALIZACIÓN BASE DE DATOS
-- ============================================

-- Habilitar extensión PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensión para crypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CREAR SCHEMAS
-- ============================================

-- Schema: Estructura Electoral
CREATE SCHEMA IF NOT EXISTS electoral;
COMMENT ON SCHEMA electoral IS 'Estructura electoral colombiana: departamentos, municipios, zonas, puestos, mesas, censo';

-- Schema: CRM Político
CREATE SCHEMA IF NOT EXISTS crm;
COMMENT ON SCHEMA crm IS 'CRM político: votantes, líderes, contactos, segmentos, eventos';

-- Schema: Compliance y Donaciones
CREATE SCHEMA IF NOT EXISTS compliance;
COMMENT ON SCHEMA compliance IS 'Donaciones, topes legales, reportes CNE';

-- Schema: Día D (Día de Elecciones)
CREATE SCHEMA IF NOT EXISTS diad;
COMMENT ON SCHEMA diad IS 'Módulo Día D: testigos, actas, conteo paralelo, alertas';

-- Schema: Comunicación Multicanal
CREATE SCHEMA IF NOT EXISTS communication;
COMMENT ON SCHEMA communication IS 'Campañas SMS, Email, WhatsApp, templates';

-- Schema: Analytics
CREATE SCHEMA IF NOT EXISTS analytics;
COMMENT ON SCHEMA analytics IS 'Métricas, reportes, vistas materializadas';

-- ============================================
-- TABLAS SISTEMA (PUBLIC SCHEMA)
-- ============================================

-- Tabla: users
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'brigadista',
    campanas_asignadas INTEGER[] DEFAULT '{}',
    activo BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    remember_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Usuarios del sistema con autenticación';
COMMENT ON COLUMN public.users.rol IS 'Roles: super_admin, admin_campana, director, coordinador, brigadista, testigo';

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_rol ON public.users(rol);

-- Tabla: roles
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'Roles y permisos RBAC';

-- Insertar roles base
INSERT INTO public.roles (nombre, descripcion, permisos) VALUES
('super_admin', 'Super Administrador - Acceso total', '{"*": true}'),
('admin_campana', 'Administrador de Campaña', '{"campanas": ["read", "write"], "votantes": ["read", "write"], "eventos": ["read", "write"]}'),
('director', 'Director de Campaña', '{"votantes": ["read", "write"], "eventos": ["read", "write"], "reportes": ["read"]}'),
('coordinador', 'Coordinador Territorial', '{"votantes": ["read"], "eventos": ["read"], "contactos": ["write"]}'),
('brigadista', 'Brigadista', '{"votantes": ["read"], "contactos": ["write"]}'),
('testigo', 'Testigo Electoral', '{"actas": ["write"], "mesas": ["read"]}')
ON CONFLICT (nombre) DO NOTHING;

-- Tabla: password_reset_tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    email VARCHAR(100) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: personal_access_tokens (Laravel Sanctum)
CREATE TABLE IF NOT EXISTS public.personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pat_tokenable ON public.personal_access_tokens(tokenable_type, tokenable_id);

-- Tabla: sessions
CREATE TABLE IF NOT EXISTS public.sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_last_activity ON public.sessions(last_activity);

-- ============================================
-- ESQUEMA ELECTORAL - TABLAS BÁSICAS
-- ============================================

-- Tabla: departamentos
CREATE TABLE IF NOT EXISTS electoral.departamentos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE electoral.departamentos IS '32 departamentos de Colombia + Bogotá DC';

-- Tabla: municipios
CREATE TABLE IF NOT EXISTS electoral.municipios (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL REFERENCES electoral.departamentos(id),
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20), -- 'municipio', 'distrito', 'corregimiento'
    poblacion INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE electoral.municipios IS '1,102 municipios de Colombia';

CREATE INDEX idx_municipios_departamento ON electoral.municipios(departamento_id);

-- Tabla: campanas
CREATE TABLE IF NOT EXISTS electoral.campanas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    tipo_eleccion VARCHAR(50) NOT NULL,
    candidato_principal VARCHAR(200),
    partido VARCHAR(100),
    color_campana VARCHAR(7),
    logo_url VARCHAR(500),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'activa',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE electoral.campanas IS 'Campañas políticas (multi-tenant)';
COMMENT ON COLUMN electoral.campanas.tipo_eleccion IS 'Tipos: senado, camara, gobernacion, alcaldia, asamblea, concejo, jal';

CREATE INDEX idx_campanas_estado ON electoral.campanas(estado);

-- ============================================
-- GRANTS Y PERMISOS
-- ============================================

-- Otorgar permisos al usuario postgres (ajustar según necesidad)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA electoral TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA crm TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA compliance TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA diad TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA communication TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO postgres;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA electoral TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA crm TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA compliance TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA diad TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA communication TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO postgres;

-- ============================================
-- CONFIRMACIÓN
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos electoral_platform inicializada correctamente';
    RAISE NOTICE '✅ Schemas creados: electoral, crm, compliance, diad, communication, analytics';
    RAISE NOTICE '✅ Extensiones PostGIS habilitadas';
    RAISE NOTICE '✅ Tablas sistema creadas (users, roles, sessions)';
    RAISE NOTICE '✅ Roles base insertados (6 roles)';
END $$;
