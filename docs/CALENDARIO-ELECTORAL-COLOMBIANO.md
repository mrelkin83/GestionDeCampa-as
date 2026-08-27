# Guía: Calendario Electoral Colombiano

## 📅 Calendario Electoral Vigente (2026-2030)

Esta guía explica el calendario electoral colombiano y cómo configurar el sistema para cada tipo de elección.

### ⚠️ IMPORTANTE: Las elecciones NO son simultáneas

En Colombia, cada tipo de elección tiene su propia fecha según la Constitución y la Ley:

---

## 🗓️ Calendario Electoral 2026-2030

### 1. Elecciones Legislativas 2026

**📅 Fecha:** Primer domingo de marzo de 2026  
**Fecha exacta:** 8 de marzo de 2026

**🏛️ Periodo de gobierno:**
- **Inicio:** 20 de julio de 2026
- **Fin:** 20 de julio de 2030
- **Duración:** 4 años exactos

**📊 Cargos:**
- **Senado de la República**
  - 102 curules
  - Circunscripción: Nacional
  - Umbral electoral: 3%
  - Cupos especiales: Indígenas, comunidades negras

- **Cámara de Representantes**
  - 165 curules
  - 161 circunscripciones territoriales
  - 4 circunscripciones especiales

**✅ Estado:** REALIZADAS (8 de marzo de 2026)

---

### 2. Elecciones Presidenciales 2026

**📅 Fecha:** Último domingo de mayo de 2026  
**Fecha exacta:** 31 de mayo de 2026

**🏛️ Periodo de gobierno:**
- **Inicio:** 7 de agosto de 2026
- **Fin:** 7 de agosto de 2030
- **Duración:** 4 años exactos

**📊 Cargos:**
- **Presidente de la República**
- **Vicepresidente de la República**

**📋 Reglas:**
- Mayoría absoluta requerida (>50%)
- Si ningún candidato alcanza 50%, hay segunda vuelta
- Segunda vuelta: 3 semanas después

**⏳ Estado:** PRÓXIMAS (31 de mayo de 2026)

---

### 3. Elecciones Territoriales 2027

**📅 Fecha:** Último domingo de octubre de 2027  
**Fecha exacta:** 31 de octubre de 2027

**🏛️ Periodo de gobierno:**
- **Inicio:** 1 de enero de 2028
- **Fin:** 31 de diciembre de 2031
- **Duración:** 4 años exactos

**📊 Cargos:**

**A nivel Departamental (32 departamentos):**
- **Gobernador y Vicegobernador**
  - Mayoría absoluta (>50%)
  - Posible segunda vuelta

- **Asamblea Departamental**
  - Curules variables según población
  - Diferente número por departamento

**A nivel Municipal (1,102 municipios):**
- **Alcalde y Vicealcalde**
  - Mayoría absoluta (>50%)
  - Posible segunda vuelta

- **Concejo Municipal**
  - Curules variables según población
  - Voto preferente opcional

**📋 Estado:** PROGRAMADAS (31 de octubre de 2027)

---

## 📊 Comparación de Periodos

| Elección | Fecha | Inicio Periodo | Fin Periodo | Duración |
|----------|-------|----------------|-------------|----------|
| **Legislativas 2026** | 8 marzo 2026 | 20 julio 2026 | 20 julio 2030 | 4 años |
| **Presidenciales 2026** | 31 mayo 2026 | 7 agosto 2026 | 7 agosto 2030 | 4 años |
| **Territoriales 2027** | 31 oct 2027 | 1 enero 2028 | 31 dic 2031 | 4 años |

---

## ⚙️ Configuración del Sistema

### Paso 1: Ejecutar Seeder del Calendario

```bash
cd backend-core
php artisan db:seed --class=CalendarioElectoralColombiano2026_2030
```

Este seeder configura automáticamente:
- ✅ Fechas correctas según calendario colombiano
- ✅ Periodos de 4 años con fechas de inicio/fin específicas
- ✅ Cargos para cada tipo de elección
- ✅ Estados (realizadas, programadas, próximas)

### Paso 2: Verificar Configuración

```sql
-- Ver elecciones configuradas
SELECT 
    nombre,
    tipo,
    fecha,
    fecha_inicio_periodo,
    fecha_fin_periodo,
    estado
FROM elections
ORDER BY fecha;
```

**Resultado esperado:**
```
nombre                          | tipo          | fecha      | inicio     | fin        | estado
--------------------------------|---------------|------------|------------|------------|------------
Elecciones Legislativas 2026    | LEGISLATIVA   | 2026-03-08 | 2026-07-20 | 2030-07-20 | CERRADA
Elecciones Presidenciales 2026  | PRESIDENCIAL  | 2026-05-31 | 2026-08-07 | 2030-08-07 | PROGRAMADA
Elecciones Territoriales 2027   | TERRITORIAL   | 2027-10-31 | 2028-01-01 | 2031-12-31 | PROGRAMADA
```

---

## 📱 Uso en la PWA (Testigos)

### Principio Importante

**Cada elección es INDEPENDIENTE.** No se reportan múltiples elecciones simultáneamente porque las fechas son diferentes.

### Flujo por Tipo de Elección

#### Elecciones Legislativas (8 marzo 2026)

1. Abrir PWA el día de la elección
2. Seleccionar: "Elecciones Legislativas 2026"
3. Elegir cargo:
   - ✅ Senado de la República
   - ✅ Cámara de Representantes
4. **Nota:** En Colombia se vota por AMBOS cargos el mismo día
5. Reportar ambos cargos si aplica a la mesa

#### Elecciones Presidenciales (31 mayo 2026)

1. Abrir PWA el día de la elección
2. Seleccionar: "Elecciones Presidenciales 2026"
3. Elegir cargo: Presidente
4. Reportar resultados

#### Elecciones Territoriales (31 octubre 2027)

1. Abrir PWA el día de la elección
2. Seleccionar: "Elecciones Territoriales 2027"
3. Elegir cargos según la mesa:
   - Gobernador (todas las mesas del departamento)
   - Asamblea (todas las mesas del departamento)
   - Alcalde (mesas del municipio)
   - Concejo (mesas del municipio)

---

## 🏛️ Uso en Dashboard Web

### Visualización por Elección

El dashboard muestra UNA elección a la vez:

#### Durante Legislativas (8 marzo 2026):
- Resultados Senado (nacional)
- Resultados Cámara (por departamentos)
- Avance por mesas del país

#### Durante Presidenciales (31 mayo 2026):
- Resultados Presidente (nacional)
- Mapa de resultados por departamento
- Detección de necesidad de segunda vuelta

#### Durante Territoriales (31 octubre 2027):
- Resultados Gobernadores (32 departamentos)
- Resultados Alcaldes (por municipio)
- Resultados Asambleas y Concejos

### ⚠️ No hay Mezcla

El sistema NO muestra resultados de diferentes elecciones simultáneamente porque las fechas son diferentes.

---

## 🔄 Segunda Vuelta

### Presidencial

Si ningún candidato obtiene >50% el 31 de mayo 2026:

1. Segunda vuelta: 21 de junio 2026 (3 semanas después)
2. Solo los 2 candidatos más votados
3. Configurar nueva elección en el sistema:

```sql
INSERT INTO elections (
    nombre, 
    tipo, 
    fecha, 
    fecha_inicio_periodo,
    fecha_fin_periodo,
    estado,
    eleccion_anterior_id
) VALUES (
    'Segunda Vuelta Presidencial 2026',
    'PRESIDENCIAL_SEGUNDA_VUELTA',
    '2026-06-21',
    '2026-08-07',
    '2030-08-07',
    'PROGRAMADA',
    [ID de elección presidencial]
);
```

### Territoriales (Gobernadores y Alcaldes)

Regla similar:
- Si ningún candidato obtiene >50%
- Segunda vuelta 3 semanas después
- Solo los 2 más votados

---

## 📊 Ejemplos de Configuración

### Configurar Solo Elecciones Legislativas

```sql
-- Ya están configuradas en el seeder
-- Fecha: 8 de marzo de 2026
-- Estado: CERRADA (ya pasaron)

-- Para ver resultados históricos:
SELECT * FROM elections WHERE tipo = 'LEGISLATIVA';
```

### Configurar Elecciones Presidenciales (Próximas)

```sql
-- Ya están configuradas en el seeder
-- Fecha: 31 de mayo de 2026
-- Estado: PROGRAMADA

-- Activar cuando sea el día:
UPDATE elections 
SET estado = 'ACTIVA' 
WHERE fecha = '2026-05-31';
```

### Configurar Elecciones Territoriales

```sql
-- Ya están configuradas en el seeder
-- Fecha: 31 de octubre de 2027
-- Estado: PROGRAMADA

-- Se activarán automáticamente en 2027
```

---

## ⚠️ Notas Importantes

### 1. Periodos Son Diferentes

Cada elección tiene sus propias fechas de inicio y fin:
- **Legislativas:** 20 julio al 20 julio
- **Presidenciales:** 7 agosto al 7 agosto
- **Territoriales:** 1 enero al 31 diciembre

### 2. NO se Mezclan Elecciones

En Colombia:
- ❌ No hay elecciones legislativas + presidenciales el mismo día
- ❌ No hay elecciones presidenciales + territoriales el mismo día
- ✅ Cada una tiene su fecha específica

### 3. El Sistema Maneja una Elección a la Vez

La PWA y el Dashboard están diseñados para trabajar con UNA elección activa según la fecha.

---

## 🎯 Resumen del Calendario

```
2026:
├── 8 MARZO: ELECCIONES LEGISLATIVAS
│   ├── Senado (102 curules)
│   └── Cámara (165 curules)
│
└── 31 MAYO: ELECCIONES PRESIDENCIALES
    ├── Presidente
    └── Vicepresidente
    (Posible 2da vuelta: 21 junio)

2027:
└── 31 OCTUBRE: ELECCIONES TERRITORIALES
    ├── Gobernadores (32)
    ├── Asambleas (32)
    ├── Alcaldes (1,102)
    └── Concejos (1,102)
    (Posible 2da vuelta: 21 noviembre)
```

---

## 📞 Soporte

Para dudas sobre el calendario electoral colombiano:

- **Registraduría Nacional:** https://www.registraduria.gov.co
- **Soporte técnico:** soporte@plataformaelectoral.com

---

**Actualizado:** Julio 2026  
**Vigencia:** Calendario 2026-2030  
**Fuente:** Constitución Política de Colombia, Ley 403 de 1997 y reformas
