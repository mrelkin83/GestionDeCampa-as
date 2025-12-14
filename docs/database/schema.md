# ESQUEMA COMPLETO DE BASE DE DATOS

## 🎯 Resumen

**Motor:** PostgreSQL 15 + PostGIS 3.3
**Schemas:** 5 schemas lógicos
**Total tablas:** ~45 tablas
**Características:** Versionado, geo-espacial, multi-tenant, auditoría

---

## 📐 Arquitectura de Schemas

```sql
-- Schemas lógicos
CREATE SCHEMA IF NOT EXISTS electoral;     -- Estructura electoral y censo
CREATE SCHEMA IF NOT EXISTS crm;           -- CRM político
CREATE SCHEMA IF NOT EXISTS compliance;    -- Donaciones y cumplimiento legal
CREATE SCHEMA IF NOT EXISTS diad;          -- Día D (conteo paralelo)
CREATE SCHEMA IF NOT EXISTS communication; -- Comunicación multicanal
```

---

## 🗳️ SCHEMA: electoral

### **departamentos**

```sql
CREATE TABLE electoral.departamentos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL,          -- Código DANE (ej: 25 = Cundinamarca)
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_departamentos_codigo ON electoral.departamentos(codigo);

-- Datos: 32 departamentos + Bogotá D.C.
```

### **municipios**

```sql
CREATE TABLE electoral.municipios (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL REFERENCES electoral.departamentos(id) ON DELETE RESTRICT,
    codigo VARCHAR(5) UNIQUE NOT NULL,          -- Código DANE (ej: 25001 = Bogotá)
    nombre VARCHAR(100) NOT NULL,
    dane_code VARCHAR(8) UNIQUE,                -- Código completo DANE
    poblacion INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_municipios_departamento ON electoral.municipios(departamento_id);
CREATE INDEX idx_municipios_codigo ON electoral.municipios(codigo);

-- Datos: 1,102 municipios Colombia
```

### **zonas_electorales**

```sql
CREATE TABLE electoral.zonas_electorales (
    id SERIAL PRIMARY KEY,
    municipio_id INTEGER NOT NULL REFERENCES electoral.municipios(id) ON DELETE RESTRICT,
    numero INTEGER NOT NULL,
    nombre VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(municipio_id, numero)
);

-- Índices
CREATE INDEX idx_zonas_municipio ON electoral.zonas_electorales(municipio_id);
```

### **puestos_votacion**

```sql
CREATE TABLE electoral.puestos_votacion (
    id SERIAL PRIMARY KEY,
    zona_electoral_id INTEGER NOT NULL REFERENCES electoral.zonas_electorales(id) ON DELETE RESTRICT,
    codigo VARCHAR(20) UNIQUE NOT NULL,         -- Código Registraduría
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    ubicacion GEOGRAPHY(POINT, 4326),           -- PostGIS: lat/lng
    tipo VARCHAR(50),                           -- 'Educativo', 'Comunitario', etc
    capacidad_mesas INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_puestos_zona ON electoral.puestos_votacion(zona_electoral_id);
CREATE INDEX idx_puestos_codigo ON electoral.puestos_votacion(codigo);
CREATE INDEX idx_puestos_ubicacion ON electoral.puestos_votacion USING GIST(ubicacion); -- PostGIS

-- Datos: ~100,000 puestos Colombia
```

### **mesas**

```sql
CREATE TABLE electoral.mesas (
    id SERIAL PRIMARY KEY,
    puesto_votacion_id INTEGER NOT NULL REFERENCES electoral.puestos_votacion(id) ON DELETE RESTRICT,
    numero VARCHAR(10) NOT NULL,
    tipo_mesa VARCHAR(20),                      -- 'Ordinaria', 'Especial', 'Carcel'
    potencial_votantes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(puesto_votacion_id, numero)
);

-- Índices
CREATE INDEX idx_mesas_puesto ON electoral.mesas(puesto_votacion_id);
CREATE INDEX idx_mesas_numero ON electoral.mesas(numero);

-- Datos: ~600,000 mesas Colombia
```

### **censo_electoral_versiones**

```sql
CREATE TABLE electoral.censo_electoral_versiones (
    id SERIAL PRIMARY KEY,
    fecha_corte DATE NOT NULL,
    fuente VARCHAR(100),                        -- 'Registraduría Nacional'
    total_registros INTEGER,
    archivo_original VARCHAR(255),              -- S3 path del CSV original
    activo BOOLEAN DEFAULT false,               -- Solo 1 versión activa
    procesado_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Constraint: Solo 1 versión activa
CREATE UNIQUE INDEX idx_censo_version_activa ON electoral.censo_electoral_versiones(activo) WHERE activo = true;
```

### **censo_electoral**

```sql
CREATE TABLE electoral.censo_electoral (
    id BIGSERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES electoral.censo_electoral_versiones(id) ON DELETE CASCADE,
    cedula VARCHAR(15) NOT NULL,
    primer_nombre VARCHAR(50),
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50),
    segundo_apellido VARCHAR(50),
    fecha_nacimiento DATE,
    genero VARCHAR(1) CHECK (genero IN ('M', 'F', 'O')),
    mesa_id INTEGER REFERENCES electoral.mesas(id) ON DELETE SET NULL,

    -- Denormalizado para performance
    puesto_codigo VARCHAR(20),
    zona_numero INTEGER,
    municipio_id INTEGER,
    departamento_id INTEGER,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(version_id, cedula)
);

-- Índices críticos (tabla grande: ~40M registros)
CREATE INDEX idx_censo_cedula ON electoral.censo_electoral(cedula);
CREATE INDEX idx_censo_version ON electoral.censo_electoral(version_id);
CREATE INDEX idx_censo_mesa ON electoral.censo_electoral(mesa_id);
CREATE INDEX idx_censo_municipio ON electoral.censo_electoral(municipio_id);
CREATE INDEX idx_censo_nombre ON electoral.censo_electoral(primer_apellido, primer_nombre);

-- Particionado por version_id (opcional, para performance extrema)
```

### **cargos_electorales**

```sql
CREATE TABLE electoral.cargos_electorales (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,                  -- 'gobernacion', 'alcaldia', 'senado', etc
    nombre VARCHAR(100),
    nivel VARCHAR(20) NOT NULL,                 -- 'nacional', 'departamental', 'municipal'
    duracion_anos INTEGER DEFAULT 4,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seeders
INSERT INTO electoral.cargos_electorales (tipo, nombre, nivel) VALUES
('senado', 'Senado de la República', 'nacional'),
('camara', 'Cámara de Representantes', 'nacional'),
('gobernacion', 'Gobernación', 'departamental'),
('alcaldia', 'Alcaldía', 'municipal'),
('asamblea', 'Asamblea Departamental', 'departamental'),
('concejo', 'Concejo Municipal', 'municipal'),
('jal', 'Junta Administradora Local', 'local');
```

### **campanas**

```sql
CREATE TABLE electoral.campanas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    cargo_electoral_id INTEGER NOT NULL REFERENCES electoral.cargos_electorales(id),
    candidato_principal VARCHAR(200),
    partido_politico VARCHAR(100),

    -- Alcance territorial
    departamento_id INTEGER REFERENCES electoral.departamentos(id),
    municipio_id INTEGER REFERENCES electoral.municipios(id),

    -- Fechas
    fecha_inicio DATE,
    fecha_eleccion DATE NOT NULL,
    fecha_fin DATE,

    -- Topes legales CNE
    tope_legal_gastos DECIMAL(15,2),
    tope_legal_donaciones DECIMAL(15,2),

    -- Estado
    estado VARCHAR(20) DEFAULT 'activa',        -- 'activa', 'finalizada', 'suspendida'

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_campanas_cargo ON electoral.campanas(cargo_electoral_id);
CREATE INDEX idx_campanas_municipio ON electoral.campanas(municipio_id);
CREATE INDEX idx_campanas_estado ON electoral.campanas(estado);
```

---

## 👥 SCHEMA: crm

### **votantes**

```sql
CREATE TABLE crm.votantes (
    id BIGSERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,
    censo_electoral_id BIGINT REFERENCES electoral.censo_electoral(id) ON DELETE SET NULL,

    -- Datos personales
    cedula VARCHAR(15) NOT NULL,
    nombre_completo VARCHAR(200),
    celular VARCHAR(15),
    telefono VARCHAR(15),
    email VARCHAR(100),
    direccion TEXT,
    ubicacion_real GEOGRAPHY(POINT, 4326),      -- Ubicación real (puede diferir de censo)

    -- Scoring y segmentación
    score_afinidad INTEGER DEFAULT 0 CHECK (score_afinidad BETWEEN 0 AND 100),
    probabilidad_voto DECIMAL(5,2) CHECK (probabilidad_voto BETWEEN 0 AND 1),
    intencion_voto VARCHAR(20),                 -- 'favorable', 'indeciso', 'opositor', 'desconocido'
    ultima_actualizacion_score TIMESTAMP,

    -- Segmentación
    tags TEXT[],                                -- Array PostgreSQL: ['joven', 'universitario', etc]

    -- Metadata
    origen VARCHAR(50),                         -- 'censo', 'evento', 'puerta_puerta', 'referido'
    notas TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(campana_id, cedula)
);

-- Índices
CREATE INDEX idx_votantes_campana ON crm.votantes(campana_id);
CREATE INDEX idx_votantes_cedula ON crm.votantes(cedula);
CREATE INDEX idx_votantes_censo ON crm.votantes(censo_electoral_id);
CREATE INDEX idx_votantes_score ON crm.votantes(score_afinidad DESC);
CREATE INDEX idx_votantes_intencion ON crm.votantes(intencion_voto);
CREATE INDEX idx_votantes_tags ON crm.votantes USING GIN(tags);
CREATE INDEX idx_votantes_ubicacion ON crm.votantes USING GIST(ubicacion_real);
```

### **lideres**

```sql
CREATE TABLE crm.lideres (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,
    votante_id BIGINT REFERENCES crm.votantes(id) ON DELETE SET NULL,

    -- Datos lider
    nombre_completo VARCHAR(200) NOT NULL,
    cedula VARCHAR(15),
    celular VARCHAR(15) NOT NULL,
    email VARCHAR(100),

    -- Nivel y alcance
    tipo VARCHAR(50),                           -- 'Mesa', 'Puesto', 'Zona', 'Municipal', 'Departamental'
    nivel_influencia INTEGER CHECK (nivel_influencia BETWEEN 1 AND 10),

    -- Asignaciones territoriales
    mesas_asignadas INTEGER[] DEFAULT '{}',     -- Array de IDs mesas
    zonas_asignadas INTEGER[] DEFAULT '{}',
    puestos_asignados INTEGER[] DEFAULT '{}',

    -- Estado
    activo BOOLEAN DEFAULT true,
    fecha_vinculacion DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lideres_campana ON crm.lideres(campana_id);
CREATE INDEX idx_lideres_votante ON crm.lideres(votante_id);
CREATE INDEX idx_lideres_tipo ON crm.lideres(tipo);
CREATE INDEX idx_lideres_activo ON crm.lideres(activo);
```

### **contactos**

```sql
CREATE TABLE crm.contactos (
    id BIGSERIAL PRIMARY KEY,
    votante_id BIGINT NOT NULL REFERENCES crm.votantes(id) ON DELETE CASCADE,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Datos contacto
    fecha TIMESTAMP DEFAULT NOW(),
    tipo VARCHAR(50) NOT NULL,                  -- 'llamada', 'visita', 'evento', 'mensaje'
    canal VARCHAR(50),                          -- 'telefono', 'puerta_puerta', 'whatsapp', 'email'

    -- Resultado
    resultado VARCHAR(100),                     -- 'compromiso_voto', 'indeciso', 'rechazo', 'no_contactado'
    intencion_voto_declarada VARCHAR(20),
    notas TEXT,

    -- Metadata
    usuario_registro VARCHAR(100),              -- Email usuario que registró
    lider_id INTEGER REFERENCES crm.lideres(id),
    ubicacion GEOGRAPHY(POINT, 4326),           -- GPS capturado en visita
    duracion_segundos INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_contactos_votante ON crm.contactos(votante_id);
CREATE INDEX idx_contactos_campana ON crm.contactos(campana_id);
CREATE INDEX idx_contactos_fecha ON crm.contactos(fecha DESC);
CREATE INDEX idx_contactos_tipo ON crm.contactos(tipo);
CREATE INDEX idx_contactos_resultado ON crm.contactos(resultado);
```

### **segmentos**

```sql
CREATE TABLE crm.segmentos (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,

    -- Criterios de segmentación (JSON dinámico)
    criterios JSONB NOT NULL,
    /*
    Ejemplo criterios:
    {
        "score_min": 70,
        "intencion_voto": ["favorable", "indeciso"],
        "municipios": [25001, 25019],
        "tags": ["joven", "universitario"],
        "edad_min": 18,
        "edad_max": 35
    }
    */

    -- Cache
    total_votantes INTEGER DEFAULT 0,
    ultima_actualizacion TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_segmentos_campana ON crm.segmentos(campana_id);
CREATE INDEX idx_segmentos_criterios ON crm.segmentos USING GIN(criterios);
```

### **scores_ia** (para modelos ML)

```sql
CREATE TABLE crm.scores_ia (
    id BIGSERIAL PRIMARY KEY,
    votante_id BIGINT NOT NULL REFERENCES crm.votantes(id) ON DELETE CASCADE,
    modelo_version VARCHAR(50),                 -- 'v1.2', 'v2.0'

    -- Scores
    score_predicho INTEGER,
    probabilidad_voto DECIMAL(5,2),
    probabilidad_asistencia DECIMAL(5,2),

    -- Features utilizadas (para debugging)
    features JSONB,

    calculado_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_scores_ia_votante ON crm.scores_ia(votante_id);
CREATE INDEX idx_scores_ia_modelo ON crm.scores_ia(modelo_version);
```

---

## 💰 SCHEMA: compliance

### **donantes**

```sql
CREATE TABLE compliance.donantes (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Datos
    tipo VARCHAR(20) NOT NULL,                  -- 'persona_natural', 'persona_juridica'
    identificacion VARCHAR(20) NOT NULL,        -- Cédula o NIT
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(15),
    direccion TEXT,

    -- Metadata
    verificado BOOLEAN DEFAULT false,
    fecha_verificacion TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(campana_id, identificacion)
);

-- Índices
CREATE INDEX idx_donantes_campana ON compliance.donantes(campana_id);
CREATE INDEX idx_donantes_identificacion ON compliance.donantes(identificacion);
```

### **donaciones**

```sql
CREATE TABLE compliance.donaciones (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,
    donante_id INTEGER NOT NULL REFERENCES compliance.donantes(id) ON DELETE RESTRICT,

    -- Donación
    fecha DATE NOT NULL,
    monto DECIMAL(15,2) NOT NULL CHECK (monto > 0),
    tipo VARCHAR(50),                           -- 'efectivo', 'transferencia', 'cheque', 'especie'
    concepto TEXT,

    -- Documentación
    documento_soporte VARCHAR(255),             -- S3 path
    recibo_generado VARCHAR(255),               -- PDF recibo

    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente',     -- 'pendiente', 'aprobada', 'rechazada'
    aprobado_por VARCHAR(100),
    fecha_aprobacion TIMESTAMP,
    motivo_rechazo TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_donaciones_campana ON compliance.donaciones(campana_id);
CREATE INDEX idx_donaciones_donante ON compliance.donaciones(donante_id);
CREATE INDEX idx_donaciones_fecha ON compliance.donaciones(fecha DESC);
CREATE INDEX idx_donaciones_estado ON compliance.donaciones(estado);
```

### **topes_legales_control**

```sql
CREATE TABLE compliance.topes_legales_control (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER UNIQUE NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Totales
    total_donaciones DECIMAL(15,2) DEFAULT 0,
    total_gastos DECIMAL(15,2) DEFAULT 0,

    -- Topes (desde campana, pero cacheado aquí)
    tope_donaciones DECIMAL(15,2),
    tope_gastos DECIMAL(15,2),

    -- Porcentajes
    porcentaje_donaciones DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN tope_donaciones > 0 THEN (total_donaciones / tope_donaciones * 100) ELSE 0 END
    ) STORED,
    porcentaje_gastos DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN tope_gastos > 0 THEN (total_gastos / tope_gastos * 100) ELSE 0 END
    ) STORED,

    -- Alertas
    alerta_activa BOOLEAN DEFAULT false,
    mensaje_alerta TEXT,

    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **reportes_regulatorios**

```sql
CREATE TABLE compliance.reportes_regulatorios (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Reporte
    tipo VARCHAR(100) NOT NULL,                 -- 'CNE_Donaciones', 'CNE_Gastos', 'Contraloria', etc
    periodo_inicio DATE,
    periodo_fin DATE,

    -- Archivo
    archivo_generado VARCHAR(255),              -- S3 path (PDF)
    hash_archivo VARCHAR(64),                   -- SHA-256 para integridad

    -- Envío
    enviado BOOLEAN DEFAULT false,
    enviado_fecha TIMESTAMP,
    enviado_por VARCHAR(100),
    destinatario VARCHAR(200),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reportes_campana ON compliance.reportes_regulatorios(campana_id);
CREATE INDEX idx_reportes_tipo ON compliance.reportes_regulatorios(tipo);
```

---

## ⚡ SCHEMA: diad (Día D)

### **testigos_electorales**

```sql
CREATE TABLE diad.testigos_electorales (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,
    votante_id BIGINT REFERENCES crm.votantes(id) ON DELETE SET NULL,

    -- Datos personales
    cedula VARCHAR(15) NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    celular VARCHAR(15) NOT NULL,
    email VARCHAR(100),

    -- Asignación
    mesa_asignada_id INTEGER REFERENCES electoral.mesas(id) ON DELETE SET NULL,
    backup_mesa_id INTEGER REFERENCES electoral.mesas(id) ON DELETE SET NULL,

    -- Credencial
    credencial_numero VARCHAR(50),
    credencial_pdf VARCHAR(255),                -- S3 path
    pin_acceso VARCHAR(6),                      -- PIN numérico para PWA

    -- Estado
    estado VARCHAR(20) DEFAULT 'asignado',      -- 'asignado', 'confirmado', 'en_puesto', 'reportando', 'finalizado'
    fecha_confirmacion TIMESTAMP,
    fecha_llegada_puesto TIMESTAMP,
    ubicacion_llegada GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(campana_id, cedula)
);

-- Índices
CREATE INDEX idx_testigos_campana ON diad.testigos_electorales(campana_id);
CREATE INDEX idx_testigos_mesa ON diad.testigos_electorales(mesa_asignada_id);
CREATE INDEX idx_testigos_estado ON diad.testigos_electorales(estado);
CREATE INDEX idx_testigos_cedula ON diad.testigos_electorales(cedula);
```

### **actas** (TABLA CRÍTICA)

```sql
CREATE TABLE diad.actas (
    id BIGSERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,
    mesa_id INTEGER NOT NULL REFERENCES electoral.mesas(id) ON DELETE RESTRICT,
    testigo_id INTEGER NOT NULL REFERENCES diad.testigos_electorales(id) ON DELETE RESTRICT,

    -- Metadata captura
    fecha_captura TIMESTAMP DEFAULT NOW(),
    hora_apertura TIME,
    hora_cierre TIME,
    ubicacion_captura GEOGRAPHY(POINT, 4326),

    -- Imagen acta (E-14)
    imagen_url VARCHAR(500) NOT NULL,           -- S3 path
    imagen_hash VARCHAR(64) NOT NULL,           -- SHA-256
    imagen_size_bytes INTEGER,

    -- Datos acta (ingreso manual testigo)
    total_votantes_habilitados INTEGER NOT NULL,
    total_votos_depositados INTEGER NOT NULL,
    votos_candidato_principal INTEGER NOT NULL,
    votos_otros JSONB,                          -- [{"candidato": "X", "votos": 100}, ...]
    votos_nulos INTEGER DEFAULT 0,
    votos_blancos INTEGER DEFAULT 0,

    -- OCR (procesamiento asíncrono)
    ocr_procesado BOOLEAN DEFAULT false,
    ocr_confianza DECIMAL(5,2),
    ocr_resultado JSONB,
    ocr_procesado_at TIMESTAMP,

    -- Validación
    validada BOOLEAN DEFAULT false,
    validada_por VARCHAR(100),
    validada_fecha TIMESTAMP,
    inconsistencias JSONB,                      -- [{"tipo": "suma_incorrecta", "detalle": "..."}]

    -- Sincronización
    sincronizado BOOLEAN DEFAULT false,
    sincronizado_at TIMESTAMP,
    offline_queue_id UUID,                      -- ID local PWA (para evitar duplicados)
    conflicto BOOLEAN DEFAULT false,
    conflicto_resuelto BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices críticos
CREATE INDEX idx_actas_campana ON diad.actas(campana_id);
CREATE INDEX idx_actas_mesa ON diad.actas(mesa_id);
CREATE INDEX idx_actas_testigo ON diad.actas(testigo_id);
CREATE INDEX idx_actas_sincronizado ON diad.actas(sincronizado);
CREATE INDEX idx_actas_validada ON diad.actas(validada);
CREATE INDEX idx_actas_fecha_captura ON diad.actas(fecha_captura DESC);
CREATE UNIQUE INDEX idx_actas_offline_queue ON diad.actas(offline_queue_id) WHERE offline_queue_id IS NOT NULL;

-- Constraint: Solo 1 acta validada por mesa por campaña
CREATE UNIQUE INDEX idx_actas_mesa_validada_unica ON diad.actas(campana_id, mesa_id) WHERE validada = true;
```

### **conteo_agregado** (TABLA TIEMPO REAL)

```sql
CREATE TABLE diad.conteo_agregado (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Nivel agregación
    nivel VARCHAR(20) NOT NULL,                 -- 'mesa', 'puesto', 'zona', 'municipio', 'departamento', 'nacional'
    entidad_id INTEGER,                         -- ID según nivel (mesa_id, municipio_id, etc)

    -- Cobertura
    total_mesas INTEGER NOT NULL,
    mesas_reportadas INTEGER DEFAULT 0,
    porcentaje_cobertura DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_mesas > 0 THEN (mesas_reportadas::DECIMAL / total_mesas * 100) ELSE 0 END
    ) STORED,

    -- Resultados
    votos_candidato_principal INTEGER DEFAULT 0,
    votos_competencia JSONB,                    -- {"candidato_1": 100, "candidato_2": 50}
    votos_total INTEGER DEFAULT 0,
    votos_nulos INTEGER DEFAULT 0,
    votos_blancos INTEGER DEFAULT 0,
    porcentaje_votos DECIMAL(5,2),

    -- Timestamp
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(campana_id, nivel, entidad_id)
);

-- Índices
CREATE INDEX idx_conteo_campana ON diad.conteo_agregado(campana_id);
CREATE INDEX idx_conteo_nivel ON diad.conteo_agregado(nivel);
CREATE INDEX idx_conteo_entidad ON diad.conteo_agregado(entidad_id);
```

### **alertas_diad**

```sql
CREATE TABLE diad.alertas_diad (
    id BIGSERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Tipo alerta
    tipo VARCHAR(50) NOT NULL,                  -- 'inconsistencia', 'fraude_potencial', 'testigo_ausente', 'retraso'
    severidad VARCHAR(20) NOT NULL,             -- 'baja', 'media', 'alta', 'critica'

    -- Contexto
    mesa_id INTEGER REFERENCES electoral.mesas(id),
    acta_id BIGINT REFERENCES diad.actas(id),
    testigo_id INTEGER REFERENCES diad.testigos_electorales(id),

    -- Descripción
    titulo VARCHAR(200),
    descripcion TEXT NOT NULL,
    datos JSONB,                                -- Datos adicionales específicos del tipo

    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente',     -- 'pendiente', 'revisando', 'resuelta', 'falsa_alarma'
    asignado_a VARCHAR(100),
    resolucion TEXT,
    resuelta_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alertas_campana ON diad.alertas_diad(campana_id);
CREATE INDEX idx_alertas_mesa ON diad.alertas_diad(mesa_id);
CREATE INDEX idx_alertas_severidad ON diad.alertas_diad(severidad);
CREATE INDEX idx_alertas_estado ON diad.alertas_diad(estado);
CREATE INDEX idx_alertas_created ON diad.alertas_diad(created_at DESC);
```

### **auditoria_diad** (APPEND-ONLY, INMUTABLE)

```sql
CREATE TABLE diad.auditoria_diad (
    id BIGSERIAL PRIMARY KEY,
    acta_id BIGINT REFERENCES diad.actas(id) ON DELETE RESTRICT,

    -- Acción
    accion VARCHAR(100) NOT NULL,               -- 'creada', 'modificada', 'validada', 'sincronizada'

    -- Usuario
    usuario VARCHAR(100),
    ip VARCHAR(45),
    user_agent TEXT,

    -- Datos
    datos_antes JSONB,
    datos_despues JSONB,

    -- Blockchain-like
    hash_anterior VARCHAR(64),
    hash_actual VARCHAR(64),                    -- SHA-256(id + accion + timestamp + hash_anterior)

    timestamp TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_auditoria_acta ON diad.auditoria_diad(acta_id);
CREATE INDEX idx_auditoria_timestamp ON diad.auditoria_diad(timestamp DESC);

-- IMPORTANTE: Esta tabla NO permite UPDATE ni DELETE
-- Implementar con permisos: GRANT INSERT, SELECT ON diad.auditoria_diad TO app_user;
```

---

## 📨 SCHEMA: communication

### **campanas_comunicacion**

```sql
CREATE TABLE communication.campanas_comunicacion (
    id SERIAL PRIMARY KEY,
    campana_politica_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Datos campaña
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL,                  -- 'email', 'sms', 'whatsapp'
    segmento_id INTEGER REFERENCES crm.segmentos(id) ON DELETE SET NULL,
    template_id INTEGER REFERENCES communication.templates(id),

    -- Programación
    programada_para TIMESTAMP,

    -- Estado
    estado VARCHAR(20) DEFAULT 'borrador',      -- 'borrador', 'programada', 'enviando', 'completada', 'cancelada'

    -- Métricas
    total_destinatarios INTEGER DEFAULT 0,
    total_enviados INTEGER DEFAULT 0,
    total_exitosos INTEGER DEFAULT 0,
    total_fallidos INTEGER DEFAULT 0,

    -- Timestamps
    iniciada_at TIMESTAMP,
    completada_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_campanas_com_politica ON communication.campanas_comunicacion(campana_politica_id);
CREATE INDEX idx_campanas_com_estado ON communication.campanas_comunicacion(estado);
CREATE INDEX idx_campanas_com_programada ON communication.campanas_comunicacion(programada_para);
```

### **mensajes**

```sql
CREATE TABLE communication.mensajes (
    id BIGSERIAL PRIMARY KEY,
    campana_comunicacion_id INTEGER NOT NULL REFERENCES communication.campanas_comunicacion(id) ON DELETE CASCADE,
    votante_id BIGINT REFERENCES crm.votantes(id) ON DELETE SET NULL,

    -- Destinatario
    canal VARCHAR(20) NOT NULL,                 -- 'email', 'sms', 'whatsapp'
    destinatario VARCHAR(200) NOT NULL,         -- email o teléfono

    -- Contenido
    asunto VARCHAR(200),                        -- Solo email
    contenido TEXT NOT NULL,

    -- Estado entrega
    estado VARCHAR(20) DEFAULT 'pendiente',     -- 'pendiente', 'enviado', 'entregado', 'leido', 'fallido'
    proveedor VARCHAR(50),                      -- 'twilio', 'ses', 'whatsapp'
    external_id VARCHAR(100),                   -- ID externo proveedor

    -- Timestamps
    fecha_envio TIMESTAMP,
    fecha_entrega TIMESTAMP,
    fecha_lectura TIMESTAMP,

    -- Error
    error TEXT,
    intentos INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_mensajes_campana ON communication.mensajes(campana_comunicacion_id);
CREATE INDEX idx_mensajes_votante ON communication.mensajes(votante_id);
CREATE INDEX idx_mensajes_estado ON communication.mensajes(estado);
CREATE INDEX idx_mensajes_canal ON communication.mensajes(canal);
CREATE INDEX idx_mensajes_fecha_envio ON communication.mensajes(fecha_envio DESC);

-- Particionado por fecha (opcional, para gran volumen)
```

### **templates**

```sql
CREATE TABLE communication.templates (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Template
    nombre VARCHAR(200) NOT NULL,
    canal VARCHAR(20) NOT NULL,                 -- 'email', 'sms', 'whatsapp'
    asunto VARCHAR(200),
    contenido TEXT NOT NULL,

    -- Variables dinámicas
    variables JSONB,                            -- {"nombre": "string", "mesa": "number", ...}
    /*
    Ejemplo contenido:
    "Hola {{nombre}}, recuerda votar en la mesa {{mesa}} el día {{fecha_eleccion}}"
    */

    -- Estado
    activo BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_templates_campana ON communication.templates(campana_id);
CREATE INDEX idx_templates_canal ON communication.templates(canal);
CREATE INDEX idx_templates_activo ON communication.templates(activo);
```

---

## 🎉 SCHEMA: events (Eventos)

### **eventos**

```sql
CREATE TABLE events.eventos (
    id SERIAL PRIMARY KEY,
    campana_id INTEGER NOT NULL REFERENCES electoral.campanas(id) ON DELETE CASCADE,

    -- Datos evento
    nombre VARCHAR(200) NOT NULL,
    tipo VARCHAR(50),                           -- 'reunion', 'marcha', 'puerta_puerta', 'capacitacion'
    descripcion TEXT,

    -- Ubicación
    direccion TEXT,
    ubicacion GEOGRAPHY(POINT, 4326),
    municipio_id INTEGER REFERENCES electoral.municipios(id),

    -- Fechas
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,

    -- Capacidad
    capacidad_estimada INTEGER,
    asistentes_confirmados INTEGER DEFAULT 0,
    asistentes_reales INTEGER DEFAULT 0,

    -- QR Check-in
    qr_code VARCHAR(255),                       -- S3 path imagen QR
    qr_token UUID DEFAULT gen_random_uuid(),    -- Token único para validación

    -- Estado
    estado VARCHAR(20) DEFAULT 'planificado',   -- 'planificado', 'en_curso', 'finalizado', 'cancelado'

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_eventos_campana ON events.eventos(campana_id);
CREATE INDEX idx_eventos_fecha ON events.eventos(fecha_inicio);
CREATE INDEX idx_eventos_estado ON events.eventos(estado);
CREATE INDEX idx_eventos_municipio ON events.eventos(municipio_id);
```

### **asistencia**

```sql
CREATE TABLE events.asistencia (
    id BIGSERIAL PRIMARY KEY,
    evento_id INTEGER NOT NULL REFERENCES events.eventos(id) ON DELETE CASCADE,
    votante_id BIGINT REFERENCES crm.votantes(id) ON DELETE SET NULL,

    -- Datos
    nombre_completo VARCHAR(200),
    cedula VARCHAR(15),
    celular VARCHAR(15),

    -- Check-in
    tipo_registro VARCHAR(20),                  -- 'manual', 'qr', 'lista_previa'
    fecha_registro TIMESTAMP DEFAULT NOW(),
    ubicacion_registro GEOGRAPHY(POINT, 4326),
    registrado_por VARCHAR(100),

    -- Confirmación
    confirmado BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_asistencia_evento ON events.asistencia(evento_id);
CREATE INDEX idx_asistencia_votante ON events.asistencia(votante_id);
CREATE INDEX idx_asistencia_fecha ON events.asistencia(fecha_registro);
```

---

## 👤 SCHEMA: users (Gestión usuarios sistema)

### **users**

```sql
CREATE TABLE users.users (
    id SERIAL PRIMARY KEY,

    -- Datos
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Roles
    rol VARCHAR(50) NOT NULL,                   -- 'super_admin', 'admin_campana', 'director', etc
    campanas_asignadas INTEGER[] DEFAULT '{}',  -- Array de IDs campañas

    -- Estado
    activo BOOLEAN DEFAULT true,
    email_verificado BOOLEAN DEFAULT false,
    ultimo_acceso TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_rol ON users.users(rol);
CREATE INDEX idx_users_activo ON users.users(activo);
```

### **sessions** (tokens Sanctum)

```sql
CREATE TABLE users.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) UNIQUE NOT NULL,

    -- Metadata
    ip VARCHAR(45),
    user_agent TEXT,

    -- Expiración
    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sessions_user ON users.sessions(user_id);
CREATE INDEX idx_sessions_token ON users.sessions(token_hash);
CREATE INDEX idx_sessions_expires ON users.sessions(expires_at);

-- Limpieza automática sesiones expiradas
CREATE OR REPLACE FUNCTION users.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM users.sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Ejecutar diariamente
-- SELECT cron.schedule('cleanup-sessions', '0 0 * * *', 'SELECT users.cleanup_expired_sessions()');
```

---

## 📈 VISTAS MATERIALIZADAS (Performance)

### **vista_votantes_completa**

```sql
CREATE MATERIALIZED VIEW crm.vista_votantes_completa AS
SELECT
    v.id,
    v.cedula,
    v.nombre_completo,
    v.celular,
    v.score_afinidad,
    v.intencion_voto,
    c.id as censo_id,
    m.id as mesa_id,
    m.numero as mesa_numero,
    p.nombre as puesto_nombre,
    mu.nombre as municipio_nombre,
    d.nombre as departamento_nombre,
    COUNT(ct.id) as total_contactos
FROM crm.votantes v
LEFT JOIN electoral.censo_electoral c ON v.censo_electoral_id = c.id
LEFT JOIN electoral.mesas m ON c.mesa_id = m.id
LEFT JOIN electoral.puestos_votacion p ON m.puesto_votacion_id = p.id
LEFT JOIN electoral.zonas_electorales z ON p.zona_electoral_id = z.id
LEFT JOIN electoral.municipios mu ON z.municipio_id = mu.id
LEFT JOIN electoral.departamentos d ON mu.departamento_id = d.id
LEFT JOIN crm.contactos ct ON v.id = ct.votante_id
GROUP BY v.id, c.id, m.id, p.id, mu.id, d.id;

CREATE UNIQUE INDEX idx_vista_votantes_id ON crm.vista_votantes_completa(id);
CREATE INDEX idx_vista_votantes_municipio ON crm.vista_votantes_completa(municipio_nombre);

-- Refrescar cada hora
-- REFRESH MATERIALIZED VIEW CONCURRENTLY crm.vista_votantes_completa;
```

---

## 🔒 PERMISOS Y SEGURIDAD

```sql
-- Rol aplicación
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';

-- Permisos normales
GRANT USAGE ON SCHEMA electoral, crm, compliance, diad, communication, events, users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA electoral, crm, compliance, communication, events TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA diad TO app_user;

-- Auditoría: Solo INSERT y SELECT (no UPDATE/DELETE)
GRANT SELECT, INSERT ON diad.auditoria_diad TO app_user;
REVOKE UPDATE, DELETE ON diad.auditoria_diad FROM app_user;

-- Sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA electoral, crm, compliance, diad, communication, events TO app_user;
```

---

## 📊 ESTADÍSTICAS ESTIMADAS

| Schema | Tablas | Registros Estimados |
|--------|--------|---------------------|
| electoral | 6 | ~41M (mayoría en censo) |
| crm | 6 | ~5M |
| compliance | 4 | ~500K |
| diad | 5 | ~10M (Día D) |
| communication | 3 | ~20M |
| events | 2 | ~100K |
| users | 2 | ~10K |
| **TOTAL** | **28** | **~76M registros** |

---

**Última actualización:** Diciembre 13, 2024
