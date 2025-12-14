# API BACKEND CORE (Laravel)

**Base URL:** `https://api.plataforma-electoral.com/v1`
**Autenticación:** Laravel Sanctum (Bearer Token)
**Puerto interno:** 8000
**Formato:** JSON

---

## 🔐 AUTENTICACIÓN

### **POST /auth/login**

Inicia sesión y retorna token de acceso.

**Request:**
```json
{
  "email": "director@campana.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre_completo": "Juan Pérez",
      "email": "director@campana.com",
      "rol": "director",
      "campanas_asignadas": [1, 5]
    },
    "token": "1|abc123...xyz789",
    "expires_at": "2027-10-15T10:00:00Z"
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

---

### **POST /auth/logout**

Cierra sesión y revoca token.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### **GET /auth/me**

Obtiene información del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_completo": "Juan Pérez",
    "email": "director@campana.com",
    "rol": "director",
    "campanas_asignadas": [1, 5],
    "ultimo_acceso": "2027-10-14T15:30:00Z"
  }
}
```

---

## 🗳️ CENSO ELECTORAL

### **GET /censo/versiones**

Lista todas las versiones del censo electoral.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "fecha_corte": "2027-09-01",
      "total_registros": 39842156,
      "activo": true,
      "procesado_at": "2027-09-05T10:00:00Z"
    },
    {
      "id": 2,
      "fecha_corte": "2026-12-08",
      "total_registros": 39654321,
      "activo": false,
      "procesado_at": "2026-12-10T08:00:00Z"
    }
  ]
}
```

---

### **POST /censo/versiones**

Importa una nueva versión del censo (archivo CSV/Excel).

**Request:** `multipart/form-data`

```
fecha_corte: "2027-09-01"
archivo: [archivo.csv]
```

**Response 202 (Accepted):**
```json
{
  "success": true,
  "message": "Importación iniciada",
  "data": {
    "version_id": 4,
    "job_id": "uuid-job-123",
    "status_url": "/censo/versiones/4/status"
  }
}
```

---

### **GET /censo/votantes**

Busca votante por cédula.

**Query params:**
- `cedula` (required): Número de cédula

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 12345678,
    "cedula": "1234567890",
    "nombre_completo": "María García López",
    "fecha_nacimiento": "1995-05-15",
    "genero": "F",
    "mesa": {
      "id": 15234,
      "numero": "00123",
      "puesto": {
        "codigo": "E0525001005",
        "nombre": "Colegio Santa María",
        "direccion": "Calle 45 #12-34",
        "municipio": "Bogotá D.C."
      }
    }
  }
}
```

---

### **GET /censo/mesa/{mesaId}/votantes**

Lista votantes habilitados en una mesa.

**Path params:**
- `mesaId`: ID de la mesa

**Query params:**
- `page` (opcional): Página (default: 1)
- `per_page` (opcional): Por página (default: 50, max: 100)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mesa": {
      "id": 15234,
      "numero": "00123",
      "puesto": "Colegio Santa María"
    },
    "votantes": [
      {
        "cedula": "1001234567",
        "nombre_completo": "Ana Martínez"
      },
      {
        "cedula": "1001234568",
        "nombre_completo": "Carlos Rodríguez"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total": 342,
      "total_pages": 7
    }
  }
}
```

---

## 📍 ESTRUCTURA ELECTORAL

### **GET /electoral/departamentos**

Lista todos los departamentos de Colombia.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "codigo": "05", "nombre": "Antioquia"},
    {"id": 2, "codigo": "08", "nombre": "Atlántico"},
    {"id": 25, "codigo": "25", "nombre": "Cundinamarca"}
  ]
}
```

---

### **GET /electoral/municipios**

Lista municipios, opcionalmente filtrados por departamento.

**Query params:**
- `departamento_id` (opcional): Filtrar por departamento

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "25001",
      "nombre": "Bogotá D.C.",
      "departamento": "Cundinamarca",
      "poblacion": 7181469
    }
  ]
}
```

---

### **GET /electoral/puestos**

Lista puestos de votación.

**Query params:**
- `municipio_id` (opcional)
- `zona_id` (opcional)
- `search` (opcional): Búsqueda por nombre
- `bbox` (opcional): Bounding box geográfico (formato: `sw_lat,sw_lng,ne_lat,ne_lng`)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5001,
      "codigo": "E0525001005",
      "nombre": "Colegio Santa María",
      "direccion": "Calle 45 #12-34",
      "ubicacion": {
        "lat": 4.6512,
        "lng": -74.0598
      },
      "zona": 5,
      "municipio": "Bogotá D.C.",
      "total_mesas": 15
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 156
  }
}
```

---

### **GET /electoral/mesas/{id}**

Obtiene detalles de una mesa específica.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 15234,
    "numero": "00123",
    "tipo_mesa": "Ordinaria",
    "potencial_votantes": 342,
    "puesto": {
      "id": 5001,
      "codigo": "E0525001005",
      "nombre": "Colegio Santa María",
      "direccion": "Calle 45 #12-34",
      "ubicacion": {
        "lat": 4.6512,
        "lng": -74.0598
      }
    },
    "zona": {
      "id": 125,
      "numero": 5,
      "municipio": "Bogotá D.C."
    }
  }
}
```

---

## 🗺️ GEORREFERENCIACIÓN

### **GET /geo/puestos/bbox**

Obtiene puestos dentro de un área geográfica.

**Query params:**
- `sw_lat`, `sw_lng`: Esquina suroeste
- `ne_lat`, `ne_lng`: Esquina noreste
- `campana_id` (opcional): Filtrar por campaña

**Response 200:**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "id": 5001,
          "nombre": "Colegio Santa María",
          "total_mesas": 15,
          "mesas_cubiertas": 12
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-74.0598, 4.6512]
        }
      }
    ]
  }
}
```

---

### **GET /geo/mesas/heatmap**

Genera heatmap por tipo (intención voto, cobertura, etc).

**Query params:**
- `campana_id` (required)
- `tipo`: `intencion_voto`, `cobertura`, `participacion`
- `municipio_id` (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "mesa_id": 15234,
          "valor": 78.5,
          "intensidad": "alta"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-74.0598, 4.6512]
        }
      }
    ]
  }
}
```

---

## 👥 CRM VOTANTES

### **GET /votantes**

Lista votantes con filtros y paginación.

**Query params:**
- `campana_id` (required)
- `page`, `per_page`
- `filtros[mesa_id]` (opcional)
- `filtros[municipio_id]` (opcional)
- `filtros[score_min]` (opcional): 0-100
- `filtros[score_max]` (opcional)
- `filtros[intencion_voto]` (opcional): `favorable`, `indeciso`, `opositor`
- `filtros[tags]` (opcional): array de tags
- `search` (opcional): Buscar por nombre/cédula

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123456,
      "cedula": "1234567890",
      "nombre_completo": "Juan Pérez García",
      "celular": "+573001234567",
      "score_afinidad": 78,
      "intencion_voto": "favorable",
      "tags": ["joven", "universitario"],
      "mesa": {
        "numero": "00123",
        "puesto": "Colegio Santa María"
      },
      "total_contactos": 3,
      "ultimo_contacto": "2027-09-15T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 1542,
    "total_pages": 78
  }
}
```

---

### **POST /votantes**

Crea un nuevo votante.

**Request:**
```json
{
  "campana_id": 1,
  "cedula": "1234567890",
  "nombre_completo": "Juan Pérez García",
  "celular": "+573001234567",
  "email": "juan@example.com",
  "direccion": "Carrera 7 #32-16",
  "ubicacion_real": {
    "lat": 4.6097,
    "lng": -74.0817
  },
  "tags": ["joven", "universitario"]
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Votante creado exitosamente",
  "data": {
    "id": 123457,
    "cedula": "1234567890",
    "nombre_completo": "Juan Pérez García",
    "score_afinidad": 0,
    "created_at": "2027-09-20T14:00:00Z"
  }
}
```

---

### **GET /votantes/{id}**

Obtiene detalles completos de un votante.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 123456,
    "cedula": "1234567890",
    "nombre_completo": "Juan Pérez García",
    "celular": "+573001234567",
    "email": "juan@example.com",
    "direccion": "Carrera 7 #32-16",
    "ubicacion_real": {
      "lat": 4.6097,
      "lng": -74.0817
    },
    "scoring": {
      "score_afinidad": 78,
      "probabilidad_voto": 0.82,
      "intencion_voto": "favorable",
      "ultima_actualizacion": "2027-09-15T10:00:00Z"
    },
    "tags": ["joven", "universitario", "contacto_telefono"],
    "censo": {
      "mesa_numero": "00123",
      "puesto": "Colegio Santa María",
      "municipio": "Bogotá D.C."
    },
    "lider_asignado": {
      "id": 456,
      "nombre": "María López",
      "celular": "+573009876543"
    }
  }
}
```

---

### **PUT /votantes/{id}**

Actualiza votante.

**Request:**
```json
{
  "celular": "+573001111111",
  "email": "nuevo@example.com",
  "tags": ["joven", "universitario", "lider_natural"]
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Votante actualizado",
  "data": {
    "id": 123456,
    "updated_at": "2027-09-20T15:00:00Z"
  }
}
```

---

### **POST /votantes/{id}/contacto**

Registra un contacto con el votante.

**Request:**
```json
{
  "tipo": "llamada",
  "canal": "telefono",
  "resultado": "compromiso_voto",
  "intencion_voto_declarada": "favorable",
  "notas": "Confirma asistencia a evento del 25/09",
  "usuario_registro": "coordinador@campana.com"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Contacto registrado",
  "data": {
    "id": 789123,
    "votante_id": 123456,
    "fecha": "2027-09-20T15:30:00Z",
    "tipo": "llamada",
    "resultado": "compromiso_voto"
  }
}
```

---

### **GET /votantes/{id}/historial**

Obtiene historial completo de contactos de un votante.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789123,
      "fecha": "2027-09-20T15:30:00Z",
      "tipo": "llamada",
      "canal": "telefono",
      "resultado": "compromiso_voto",
      "notas": "Confirma asistencia a evento",
      "usuario": "coordinador@campana.com"
    },
    {
      "id": 789122,
      "fecha": "2027-09-10T10:15:00Z",
      "tipo": "puerta_puerta",
      "resultado": "indeciso",
      "lider": "María López"
    }
  ],
  "total": 2
}
```

---

### **PATCH /votantes/{id}/score**

Actualiza el score de afinidad de un votante.

**Request:**
```json
{
  "score_afinidad": 85,
  "probabilidad_voto": 0.90,
  "intencion_voto": "favorable"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Score actualizado",
  "data": {
    "votante_id": 123456,
    "score_anterior": 78,
    "score_nuevo": 85,
    "actualizado_at": "2027-09-20T16:00:00Z"
  }
}
```

---

## 🎯 SEGMENTACIÓN

### **GET /segmentos**

Lista segmentos de la campaña.

**Query params:**
- `campana_id` (required)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Jóvenes Bogotá Centro",
      "descripcion": "Votantes 18-35 años en Bogotá centro",
      "total_votantes": 1542,
      "criterios": {
        "municipio_id": 25001,
        "edad_min": 18,
        "edad_max": 35,
        "score_min": 60,
        "tags": ["joven"]
      },
      "created_at": "2027-08-01T10:00:00Z"
    }
  ]
}
```

---

### **POST /segmentos**

Crea un nuevo segmento.

**Request:**
```json
{
  "campana_id": 1,
  "nombre": "Indecisos Alto Score",
  "descripcion": "Votantes indecisos pero con alta afinidad",
  "criterios": {
    "score_min": 70,
    "intencion_voto": ["indeciso"],
    "municipios": [25001, 25019]
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Segmento creado",
  "data": {
    "id": 5,
    "nombre": "Indecisos Alto Score",
    "total_votantes": 234,
    "created_at": "2027-09-20T17:00:00Z"
  }
}
```

---

### **POST /segmentos/preview**

Previsualiza un segmento sin guardarlo.

**Request:**
```json
{
  "campana_id": 1,
  "criterios": {
    "score_min": 80,
    "municipios": [25001]
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_votantes": 456,
    "muestra": [
      {
        "id": 123,
        "nombre_completo": "Juan Pérez",
        "score_afinidad": 85
      }
    ],
    "distribucion_municipios": {
      "25001": 456
    }
  }
}
```

---

## 💰 DONACIONES

### **GET /donaciones**

Lista donaciones.

**Query params:**
- `campana_id` (required)
- `estado` (opcional): `pendiente`, `aprobada`, `rechazada`
- `fecha_desde`, `fecha_hasta` (opcional)
- `donante_id` (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "donante": {
        "id": 45,
        "nombre_completo": "Carlos Gómez",
        "identificacion": "1234567890"
      },
      "fecha": "2027-09-15",
      "monto": 5000000,
      "tipo": "transferencia",
      "estado": "aprobada",
      "documento_soporte": "https://s3.../donacion-123.pdf"
    }
  ],
  "resumen": {
    "total_donaciones": 45000000,
    "total_aprobadas": 40000000,
    "total_pendientes": 5000000
  }
}
```

---

### **POST /donaciones**

Registra nueva donación.

**Request:** `multipart/form-data`

```
campana_id: 1
donante_id: 45
fecha: 2027-09-20
monto: 2000000
tipo: transferencia
concepto: Donación campaña
documento_soporte: [archivo.pdf]
```

**Response 201:**
```json
{
  "success": true,
  "message": "Donación registrada",
  "data": {
    "id": 124,
    "monto": 2000000,
    "estado": "pendiente",
    "created_at": "2027-09-20T18:00:00Z"
  }
}
```

---

### **GET /donaciones/topes/{campanaId}**

Obtiene estado de topes legales.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campana_id": 1,
    "topes": {
      "donaciones": {
        "tope_legal": 50000000,
        "total_actual": 40000000,
        "porcentaje": 80.0,
        "disponible": 10000000
      },
      "gastos": {
        "tope_legal": 100000000,
        "total_actual": 75000000,
        "porcentaje": 75.0,
        "disponible": 25000000
      }
    },
    "alerta_activa": true,
    "mensaje_alerta": "Donaciones al 80% del tope legal"
  }
}
```

---

## 📨 COMUNICACIÓN

### **GET /comunicacion/campanas**

Lista campañas de comunicación.

**Query params:**
- `campana_id` (required)
- `tipo` (opcional): `email`, `sms`, `whatsapp`
- `estado` (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "nombre": "Recordatorio Día D",
      "tipo": "sms",
      "estado": "completada",
      "segmento": "Jóvenes Bogotá Centro",
      "total_destinatarios": 1542,
      "total_exitosos": 1520,
      "total_fallidos": 22,
      "completada_at": "2027-10-23T20:00:00Z"
    }
  ]
}
```

---

### **POST /comunicacion/campanas**

Crea campaña de comunicación.

**Request:**
```json
{
  "campana_politica_id": 1,
  "nombre": "Invitación Evento 25/09",
  "tipo": "whatsapp",
  "segmento_id": 1,
  "template_id": 5,
  "programada_para": "2027-09-24T10:00:00Z"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Campaña creada",
  "data": {
    "id": 11,
    "estado": "programada",
    "total_destinatarios": 1542,
    "programada_para": "2027-09-24T10:00:00Z"
  }
}
```

---

### **POST /comunicacion/campanas/{id}/enviar**

Inicia envío de campaña (si no estaba programada).

**Response 200:**
```json
{
  "success": true,
  "message": "Envío iniciado",
  "data": {
    "campana_id": 11,
    "estado": "enviando",
    "iniciada_at": "2027-09-20T19:00:00Z"
  }
}
```

---

## 🎉 EVENTOS

### **GET /eventos**

Lista eventos.

**Query params:**
- `campana_id` (required)
- `estado` (opcional)
- `fecha_desde`, `fecha_hasta` (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "nombre": "Marcha por la ciudad",
      "tipo": "marcha",
      "fecha_inicio": "2027-10-15T14:00:00Z",
      "ubicacion": {
        "lat": 4.6097,
        "lng": -74.0817,
        "direccion": "Plaza de Bolívar"
      },
      "capacidad_estimada": 5000,
      "asistentes_confirmados": 3200,
      "estado": "planificado"
    }
  ]
}
```

---

### **POST /eventos**

Crea un evento.

**Request:**
```json
{
  "campana_id": 1,
  "nombre": "Reunión líderes zona norte",
  "tipo": "reunion",
  "fecha_inicio": "2027-10-20T18:00:00Z",
  "fecha_fin": "2027-10-20T21:00:00Z",
  "direccion": "Calle 100 #15-20",
  "ubicacion": {
    "lat": 4.6817,
    "lng": -74.0540
  },
  "capacidad_estimada": 100
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Evento creado",
  "data": {
    "id": 16,
    "qr_token": "uuid-qr-token-123",
    "qr_code": "https://s3.../qr-evento-16.png"
  }
}
```

---

### **POST /eventos/{id}/checkin**

Registra asistencia (con QR o manual).

**Request:**
```json
{
  "qr_token": "uuid-qr-token-123",
  "votante_id": 123456,
  "nombre_completo": "Juan Pérez",
  "cedula": "1234567890",
  "celular": "+573001234567"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Asistencia registrada",
  "data": {
    "asistencia_id": 5678,
    "evento": "Reunión líderes zona norte",
    "fecha_registro": "2027-10-20T18:15:00Z"
  }
}
```

---

## 📊 DASHBOARDS

### **GET /dashboard/kpis/{campanaId}**

Obtiene KPIs generales de la campaña.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "votantes": {
      "total": 15420,
      "con_score": 12350,
      "favorables": 7890,
      "indecisos": 3200,
      "opositor": 1330
    },
    "contactos": {
      "total": 45230,
      "ultimos_7_dias": 1240
    },
    "eventos": {
      "realizados": 15,
      "planificados": 8,
      "asistentes_total": 8500
    },
    "donaciones": {
      "total": 40000000,
      "porcentaje_tope": 80.0
    },
    "comunicaciones": {
      "mensajes_enviados": 125000,
      "tasa_exito": 98.5
    }
  }
}
```

---

## 🔄 RATE LIMITING

Todas las APIs tienen límites:
- **General:** 100 requests/minuto por IP
- **Login:** 5 intentos/15 minutos
- **Importaciones:** 1 concurrente por campaña

**Response 429 (Too Many Requests):**
```json
{
  "success": false,
  "message": "Demasiadas solicitudes. Intenta en 60 segundos.",
  "retry_after": 60
}
```

---

## ❌ ERRORES COMUNES

### **400 Bad Request**
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": {
    "cedula": ["El campo cédula es obligatorio"],
    "celular": ["El formato del celular es inválido"]
  }
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "message": "No autenticado"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "message": "No tienes permisos para esta acción"
}
```

### **404 Not Found**
```json
{
  "success": false,
  "message": "Recurso no encontrado"
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error_id": "uuid-error-log"
}
```

---

**Última actualización:** Diciembre 13, 2024
