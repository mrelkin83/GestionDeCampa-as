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
--
-- NOTA: users/roles/password_reset_tokens/personal_access_tokens/sessions
-- y las tablas electoral.* que vivían aquí se eliminaron de este script.
-- Eran un modelo de datos distinto y ya abandonado (columnas en español,
-- "rol" como texto suelto en vez de FK a roles, tablas en un schema
-- "electoral" separado) que chocaba directamente con las migraciones
-- reales de Laravel (backend-core/database/migrations), las cuales usan
-- nombres/columnas distintos y viven todas en el schema public. Con este
-- script tal como estaba, "docker compose up" + "php artisan migrate"
-- fallaba siempre en un volumen nuevo con "relation already exists" en
-- la primera migración -- este era justamente el bloqueo que ya
-- documentaba PLAN-RECUPERACION.md ("Docker Compose no levanta servicios
-- correctamente"). Las migraciones de Laravel son la única fuente de
-- verdad del esquema; este script solo debe preparar extensiones y los
-- schemas adicionales que sí usa backend-diad (TypeORM, DB_SCHEMA=diad).

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
    RAISE NOTICE '✅ Extensiones y schemas preparados para electoral_platform';
    RAISE NOTICE '✅ Schemas creados: electoral, crm, compliance, diad, communication, analytics';
    RAISE NOTICE '✅ Extensiones PostGIS/uuid-ossp/pgcrypto habilitadas';
    RAISE NOTICE 'ℹ️  Tablas y datos: correr "php artisan migrate --seed" en backend-core';
END $$;
