# Guía: Elecciones Legislativas y Territoriales

Esta guía explica cómo configurar y usar el sistema para elecciones legislativas (Senado y Cámara) y territoriales (Gobernadores, Alcaldes, Asambleas y Concejos).

## 🗳️ Tipos de Elección Soportados

### 1. Elecciones Legislativas

**Fecha típica:** Marzo (un mes antes de territoriales)

#### Cargos:
- **Senado de la República**
  - 102 curules a nivel nacional
  - Votación con listas cerradas
  - Umbral electoral: 3%
  - Circunscripción: Nacional
  - Cupos especiales: Indígenas, afrodescendientes

- **Cámara de Representantes**
  - 165 curules
  - 161 circunscripciones territoriales (departamentos)
  - 4 circunscripciones especiales
  - Votación con listas cerradas

### 2. Elecciones Territoriales

**Fecha típica:** Octubre

#### Cargos:

**A nivel Departamental:**
- **Gobernador y Vicegobernador**
  - Mayoría absoluta (>50%)
  - Si no hay mayoría: segunda vuelta
  - Uno por cada uno de los 32 departamentos

- **Asamblea Departamental**
  - Curules variables según censo
  - Listas cerradas
  - Diferente número por departamento

**A nivel Municipal:**
- **Alcalde y Vicealcalde**
  - Mayoría absoluta (>50%)
  - Segunda vuelta si aplica
  - Uno por cada uno de los 1,102 municipios

- **Concejo Municipal**
  - Curules variables según población
  - Listas abiertas (voto preferente opcional)
  - Diferente número por municipio

---

## ⚙️ Configuración del Sistema

### Paso 1: Crear Elección Legislativa

```bash
cd backend-core
php artisan db:seed --class=EleccionesLegislativasTerritorialesSeeder
```

O manualmente en la base de datos:

```sql
-- Elección Legislativa
INSERT INTO elections (nombre, tipo, fecha, estado, descripcion) 
VALUES (
  'Elecciones Legislativas 2027', 
  'LEGISLATIVA', 
  '2027-03-14', 
  'ACTIVA',
  'Senado y Cámara de Representantes'
);

-- Obtener ID
SET @eleccion_legislativa = LAST_INSERT_ID();

-- Cargos
INSERT INTO election_positions (election_id, nombre, nivel_territorial, numero_curules, configuracion)
VALUES 
  (@eleccion_legislativa, 'Senado de la República', 'NACIONAL', 102, '{"umbral": 3}'),
  (@eleccion_legislativa, 'Cámara de Representantes', 'TERRITORIAL', 165, '{"circunscripciones": 165}');
```

### Paso 2: Crear Elección Territorial

```sql
-- Elección Territorial
INSERT INTO elections (nombre, tipo, fecha, estado, descripcion) 
VALUES (
  'Elecciones Territoriales 2027', 
  'TERRITORIAL', 
  '2027-10-27', 
  'ACTIVA',
  'Gobernadores, Alcaldes, Asambleas y Concejos'
);

SET @eleccion_territorial = LAST_INSERT_ID();

-- Cargos
INSERT INTO election_positions (election_id, nombre, nivel_territorial, numero_curules, configuracion)
VALUES 
  (@eleccion_territorial, 'Gobernador', 'DEPARTAMENTAL', 1, '{"segunda_vuelta": true}'),
  (@eleccion_territorial, 'Asamblea Departamental', 'DEPARTAMENTAL', NULL, '{}'),
  (@eleccion_territorial, 'Alcalde', 'MUNICIPAL', 1, '{"segunda_vuelta": true}'),
  (@eleccion_territorial, 'Concejo Municipal', 'MUNICIPAL', NULL, '{"voto_preferente": true}');
```

### Paso 3: Crear Candidatos

```sql
-- Ejemplo: Candidatos al Senado
SET @cargo_senado = (SELECT id FROM election_positions WHERE nombre = 'Senado de la República' LIMIT 1);

INSERT INTO candidates (election_position_id, nombre, partido_politico, numero, estado)
VALUES 
  (@cargo_senado, 'Juan Pérez', 'Partido Centro Democrático', 1, 'ACTIVO'),
  (@cargo_senado, 'María García', 'Partido Liberal', 2, 'ACTIVO'),
  (@cargo_senado, 'Carlos López', 'Pacto Histórico', 3, 'ACTIVO');

-- Ejemplo: Candidatos a Gobernador (Boyacá)
SET @cargo_gobernador = (SELECT id FROM election_positions WHERE nombre = 'Gobernador' LIMIT 1);

INSERT INTO candidates (election_position_id, nombre, partido_politico, numero, departamento_id, estado)
VALUES 
  (@cargo_gobernador, 'Pedro Martínez', 'Partido Conservador', 1, 15, 'ACTIVO'), -- 15 = Boyacá
  (@cargo_gobernador, 'Ana Rodríguez', 'Partido de la U', 2, 15, 'ACTIVO');
```

### Paso 4: Asignar Cargos a Mesas

```sql
-- Todas las mesas votan por Senado (nacional)
INSERT INTO mesa_cargo_status (mesa_id, cargo_id, estado)
SELECT m.id, @cargo_senado, 'PENDIENTE'
FROM mesas m;

-- Las mesas votan por Gobernador según su departamento
INSERT INTO mesa_cargo_status (mesa_id, cargo_id, estado)
SELECT m.id, @cargo_gobernador, 'PENDIENTE'
FROM mesas m
JOIN puestos p ON m.puesto_id = p.id
WHERE p.departamento_id = 15; -- Boyacá
```

---

## 📱 Uso en la PWA (Testigos)

### Escenario 1: Solo Elecciones Legislativas

1. Abrir la PWA
2. Seleccionar "Reportar Acta"
3. Seleccionar elección: "Elecciones Legislativas 2027"
4. Ver opciones:
   - ✅ Senado de la República
   - ✅ Cámara de Representantes
5. Reportar ambos cargos (o solo uno si así se requiere)

### Escenario 2: Solo Elecciones Territoriales

1. Seleccionar elección: "Elecciones Territoriales 2027"
2. Según el municipio de la mesa, se mostrarán:
   - Gobernador (del departamento)
   - Asamblea Departamental
   - Alcalde (del municipio)
   - Concejo Municipal
3. Reportar los cargos correspondientes

### Escenario 3: Múltiples Elecciones Simultáneas

Si hay elecciones legislativas Y territoriales el mismo día:

1. Usar "Reportar Múltiples Cargos"
2. Seleccionar TODOS los cargos que apliquen:
   - ✅ Senado
   - ✅ Cámara
   - ✅ Gobernador
   - ✅ Asamblea
   - ✅ Alcalde
   - ✅ Concejo
3. Llenar cada formulario por separado
4. Guardar todos de una vez

---

## 🏛️ Uso en Dashboard Web (Coordinadores)

### Ver Resultados por Tipo

#### Resultados Legislativos:

**Senado:**
- Nivel: Nacional (todo el país)
- Agregación: Por departamento, municipio
- Umbral: 3% para obtener curules
- Visualización: Listado con porcentaje y curules obtenidos

**Cámara:**
- Nivel: Por circunscripción territorial
- Agregación: Por departamento
- Visualización: Por departamento y lista

#### Resultados Territoriales:

**Gobernador:**
- Nivel: Departamental
- Mayoría absoluta requerida
- Segunda vuelta si ninguno supera 50%
- Visualización: Mapa departamental

**Alcalde:**
- Nivel: Municipal
- Mayoría absoluta requerida
- Visualización: Por municipio

**Asambleas y Concejos:**
- Listas con curules variables
- Visualización: Por lista y preferentes (si aplica)

---

## 📊 Ejemplos de Reportes

### Reporte Legislativo - Senado

```
ELECCIÓN: Legislativas 2027
CARGO: Senado de la República
NIVEL: Nacional

RESULTADOS:
├─ Partido Centro Democrático: 28% (29 curules)
├─ Partido Liberal: 18% (18 curules)
├─ Pacto Histórico: 22% (22 curules)
├─ Partido Conservador: 15% (15 curules)
├─ Partido de la U: 12% (12 curules)
└─ Otros: 5% (6 curules)

Umbral 3%: ✅ Todos los partidos principales superan umbral

DESGLOSE TERRITORIAL:
├─ Bogotá: ...
├─ Antioquia: ...
└─ ...
```

### Reporte Territorial - Gobernador

```
ELECCIÓN: Territoriales 2027
CARGO: Gobernador
DEPARTAMENTO: Boyacá

RESULTADOS:
├─ Pedro Martínez (Conservador): 52% ✅ GANADOR
└─ Ana Rodríguez (U): 48%

Mayoría absoluta: SÍ (>50%)
Segunda vuelta: NO REQUERIDA

MESAS REPORTADAS: 1,245 / 1,300 (96%)
```

### Reporte Territorial - Concejo

```
ELECCIÓN: Territoriales 2027
CARGO: Concejo Municipal
MUNICIPIO: Tunja

RESULTADOS:
├─ Partido Centro Democrático: 25% (5 curules)
├─ Partido Liberal: 20% (4 curules)
├─ Partido Conservador: 18% (3 curules)
└─ ...

Total curules: 19

VOTO PREFERENTE (top 3):
1. Juan Pérez (Centro Democrático): 8,234 votos
2. María García (Liberal): 7,123 votos
3. Carlos López (Conservador): 6,987 votos
```

---

## ⚠️ Consideraciones Especiales

### 1. Segunda Vuelta

**Gobernadores y Alcaldes:**
- Si ningún candidato obtiene >50% de votos válidos
- Se programa segunda vuelta entre los 2 más votados
- El sistema marca automáticamente "Requiere Segunda Vuelta"

**Configuración:**
```json
{
  "segunda_vuelta": true,
  "umbral_segunda_vuelta": 50.01
}
```

### 2. Umbral Electoral (Senado)

- Partidos deben obtener mínimo 3% de votos válidos a nivel nacional
- Si no alcanzan el umbral, no obtienen curules
- El sistema calcula automáticamente

### 3. Voto Preferente

**Concejos Municipales:**
- Ciertos municipios permiten voto preferente
- Los votantes pueden marcar un candidato específico de la lista
- El sistema registra votos a lista y a candidato

### 4. Circunscripciones Especiales

**Cámara:**
- 4 curules para circunscripciones especiales:
  - 2 para comunidades indígenas
  - 1 para negritudes
  - 1 para Raizales de San Andrés y rom
- Se reportan como cargo separado

---

## 🔧 Configuración Avanzada

### Agregar Nuevo Departamento

```sql
INSERT INTO departamentos (nombre, codigo_dane) 
VALUES ('Nuevo Departamento', '99');

-- Actualizar candidatos a gobernador
INSERT INTO candidates (election_position_id, nombre, partido_politico, departamento_id)
SELECT id, 'Candidato', 'Partido', 99 
FROM election_positions 
WHERE nombre = 'Gobernador';
```

### Configurar Segunda Vuelta

Si hay segunda vuelta:

```sql
-- Crear nueva "elección" para segunda vuelta
INSERT INTO elections (nombre, tipo, fecha, estado, descripcion)
VALUES (
  'Segunda Vuelta - Gobernador Boyacá 2027',
  'SEGUNDA_VUELTA',
  '2027-11-10',
  'ACTIVA',
  'Segunda vuelta gobernador'
);

-- Solo los 2 candidatos más votados
INSERT INTO candidates (...) VALUES (...);
```

---

## 📞 Soporte

Para configuración específica de elecciones legislativas o territoriales:

- Email: soporte@plataformaelectoral.com
- Documentación: https://docs.plataformaelectoral.com/legislativas-territoriales

---

**Nota:** Este sistema cumple con la normativa colombiana (Ley 403 de 1997 y reformas) para elecciones legislativas y territoriales.

*Actualizado: Julio 2026*
