# 📡 API Preconteo Electoral - Documentación

## Endpoints Disponibles

### 🔓 Endpoints Públicos (No requieren autenticación)

#### 1. Listar Elecciones
```http
GET /api/preconteo/elecciones
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "year": 2027,
      "tipo": "territorial",
      "fecha": "2027-10-24",
      "nombre": "Elecciones Territoriales 2027"
    }
  ]
}
```

---

#### 2. Obtener Cargos por Elección
```http
GET /api/preconteo/elecciones/{id}/cargos
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "alcaldia",
      "nombre": "Alcaldía",
      "nivel": "municipal"
    },
    {
      "id": 2,
      "tipo": "concejo",
      "nombre": "Concejo Municipal",
      "nivel": "municipal"
    }
  ]
}
```

---

#### 3. Obtener Resultados Agregados
```http
GET /api/preconteo/resultados?election_position_id={cargo_id}&scope_type={scope}&scope_id={id}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| election_position_id | integer | Sí | ID del cargo electoral |
| scope_type | string | Sí | Nivel: MESA, PUESTO, MUNICIPIO, DEPARTAMENTO |
| scope_id | integer | Sí | ID del scope |

**Ejemplo:**
```http
GET /api/preconteo/resultados?election_position_id=1&scope_type=DEPARTAMENTO&scope_id=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scope": "DEPARTAMENTO",
    "scope_id": 5,
    "scope_nombre": "Antioquia",
    "election_position_id": 1,
    "total_votos": 15420,
    "total_mesas": 3200,
    "mesas_reportadas": 2845,
    "porcentaje_avance": 88.91,
    "resultados": [
      {
        "candidate_id": 1,
        "candidate_nombre": "Carlos Rodríguez",
        "votos": 7895,
        "porcentaje": 51.20,
        "es_ganador": true
      },
      {
        "candidate_id": 2,
        "candidate_nombre": "María González",
        "votos": 5432,
        "porcentaje": 35.23,
        "es_ganador": false
      }
    ],
    "ganador": {
      "candidate_id": 1,
      "candidate_nombre": "Carlos Rodríguez",
      "votos": 7895,
      "porcentaje": 51.20
    }
  }
}
```

---

#### 4. Obtener Progreso de Reporte
```http
GET /api/preconteo/progreso?election_position_id={cargo_id}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| election_position_id | integer | Sí | ID del cargo electoral |
| municipality_id | integer | No | Filtrar por municipio |
| departamento_id | integer | No | Filtrar por departamento |

**Response:**
```json
{
  "success": true,
  "data": {
    "election_position_id": 1,
    "total_mesas": 3200,
    "reportadas": 2845,
    "observadas": 123,
    "validadas": 2722,
    "pendientes": 355,
    "porcentaje_avance": 88.91
  }
}
```

---

### 🔒 Endpoints Internos (Requieren autenticación)

#### 5. Cargar Acta de Preconteo
```http
POST /api/internal/preconteo/acta
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "polling_table_id": 123,
  "election_position_id": 1,
  "total_sufragantes": 250,
  "votos_nulos": 3,
  "votos_no_marcados": 2,
  "resultados": [
    {"candidate_id": 1, "votos": 120},
    {"candidate_id": 2, "votos": 85},
    {"candidate_id": 3, "votos": 40}
  ],
  "observaciones": "Sin novedades",
  "imagen_acta": "base64_encoded_image...",
  "gps": {
    "lat": 6.2442,
    "lng": -75.5812
  },
  "offline": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Acta registrada exitosamente",
  "data": {
    "record_id": 456,
    "version": 1,
    "estado": "REPORTADA",
    "alertas": []
  }
}
```

**Response (Con alertas):**
```json
{
  "success": true,
  "message": "Acta registrada exitosamente",
  "data": {
    "record_id": 456,
    "version": 1,
    "estado": "OBSERVADA",
    "alertas": [
      {
        "id": 1,
        "tipo": "SUMA_INVALIDA",
        "severidad": "CRITICAL",
        "mensaje": "Suma de votos (245) no coincide con sufragantes (250)"
      }
    ]
  }
}
```

---

#### 6. Listar Actas
```http
GET /api/internal/preconteo/actas?estado={estado}&election_position_id={cargo_id}
Authorization: Bearer {token}
```

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| estado | string | CARGADA, OBSERVADA, VALIDADA |
| election_position_id | integer | Filtrar por cargo |
| municipality_id | integer | Filtrar por municipio |

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 456,
        "polling_table_id": 123,
        "election_position_id": 1,
        "version": 1,
        "total_sufragantes": 250,
        "votos_nulos": 3,
        "votos_no_marcados": 2,
        "estado": "REPORTADA",
        "created_at": "2027-10-24T18:30:00.000000Z",
        "votes": [...],
        "metadata": {...},
        "validations": [...]
      }
    ],
    "per_page": 50,
    "total": 150
  }
}
```

---

#### 7. Validar Acta
```http
POST /api/internal/preconteo/acta/{id}/validar
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "accion": "VALIDAR",
  "comentario": "Acta verificada correctamente"
}
```

**O para observar:**
```json
{
  "accion": "OBSERVAR",
  "comentario": "Revisar fotografía borrosa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Acta validada",
  "data": {
    "record_id": 456,
    "estado": "VALIDADA"
  }
}
```

---

## Estados del Sistema

### Estados de Acta (PrecountRecord)
| Estado | Descripción |
|--------|-------------|
| CARGADA | Acta recién cargada, pendiente de revisión |
| OBSERVADA | Tiene alertas que requieren atención |
| VALIDADA | Verificada y aprobada por coordinador |

### Estados de Mesa-Cargo (MesaCargoStatus)
| Estado | Descripción |
|--------|-------------|
| PENDIENTE | Mesa aún no reporta |
| REPORTADA | Tiene acta cargada |
| OBSERVADA | Acta tiene alertas |
| VALIDADA | Acta validada oficialmente |

### Tipos de Validaciones
| Tipo | Severidad | Descripción |
|------|-----------|-------------|
| SUMA_INVALIDA | CRITICAL | Suma de votos ≠ sufragantes |
| VOTOS_SUPERAN_SUFRAGANTES | CRITICAL | Votos candidatos > sufragantes |
| ACTA_ILEGIBLE | WARNING | Imagen no legible |
| MESA_DUPLICADA | WARNING | Mesa ya tiene acta validada |
| VERSION_DUPLICADA | WARNING | Versión ya existe |

---

## Flujo de Trabajo

### 1. Captura de Acta (Testigo)
```
POST /api/internal/preconteo/acta
→ Estado: CARGADA u OBSERVADA (si hay alertas)
→ MesaCargoStatus: REPORTADA u OBSERVADA
```

### 2. Revisión (Coordinador)
```
GET /api/internal/preconteo/actas?estado=OBSERVADA
→ Revisa alertas e imagen

POST /api/internal/preconteo/acta/{id}/validar
  Body: {"accion": "VALIDAR"}
→ Estado: VALIDADA
→ Se recalculan agregados automáticamente
```

### 3. Consulta Pública
```
GET /api/preconteo/resultados?scope_type=DEPARTAMENTO&scope_id=5
→ Muestra resultados agregados en tiempo real
```

---

## Testing con Postman

### Colección Recomendada

1. **Setup**
   - POST /api/auth/login → Obtener token
   - Guardar token en variable `{{auth_token}}`

2. **Públicos**
   - GET /api/preconteo/elecciones
   - GET /api/preconteo/elecciones/1/cargos
   - GET /api/preconteo/progreso?election_position_id=1
   - GET /api/preconteo/resultados?election_position_id=1&scope_type=DEPARTAMENTO&scope_id=5

3. **Internos**
   - POST /api/internal/preconteo/acta (Authorization: Bearer {{auth_token}})
   - GET /api/internal/preconteo/actas (Authorization: Bearer {{auth_token}})
   - POST /api/internal/preconteo/acta/1/validar (Authorization: Bearer {{auth_token}})

---

## Códigos de Error

| Código | Significado | Ejemplo |
|--------|-------------|---------|
| 200 | Éxito | Operación completada |
| 201 | Creado | Acta registrada |
| 422 | Validación fallida | Datos incompletos |
| 401 | No autenticado | Token inválido |
| 403 | No autorizado | Sin permisos |
| 404 | No encontrado | Mesa no existe |
| 500 | Error servidor | Exception no manejada |

---

## Ejecutar Demo

```bash
# 1. Migrar base de datos
php artisan migrate:fresh

# 2. Seeders básicos
php artisan db:seed

# 3. Demo completo de preconteo
php artisan db:seed --class=DemoPreconteoSeeder

# 4. Probar endpoints
curl http://localhost:8000/api/preconteo/elecciones
curl http://localhost:8000/api/preconteo/progreso?election_position_id=1
```

---

**Documentación creada:** Mayo 2026  
**Versión API:** 1.0.0  
**Base URL:** `/api`
