# API BACKEND DÍA D (NestJS)

**Base URL:** `https://diad.plataforma-electoral.com/v1`
**Autenticación:** JWT (compartido con Laravel)
**Puerto interno:** 3000
**Formato:** JSON
**WebSocket:** Socket.io en `/ws`

---

## 🔐 AUTENTICACIÓN

Utiliza el mismo token JWT generado por Laravel.

**Headers todas las requests:**
```
Authorization: Bearer {token-jwt}
```

---

## 👤 TESTIGOS ELECTORALES

### **GET /testigos/campana/{campanaId}**

Lista todos los testigos de una campaña.

**Path params:**
- `campanaId`: ID de la campaña

**Query params:**
- `estado` (opcional): `asignado`, `confirmado`, `en_puesto`, `reportando`
- `municipio_id` (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "nombre_completo": "Carlos Ramírez",
      "cedula": "9876543210",
      "celular": "+573009876543",
      "mesa_asignada": {
        "id": 15234,
        "numero": "00123",
        "puesto": "Colegio Santa María",
        "municipio": "Bogotá D.C."
      },
      "estado": "en_puesto",
      "fecha_llegada_puesto": "2027-10-24T07:15:00Z",
      "acta_reportada": true
    }
  ],
  "total": 2847,
  "estadisticas": {
    "asignados": 2847,
    "confirmados": 2830,
    "en_puesto": 2795,
    "reportando": 1234
  }
}
```

---

### **POST /testigos**

Crea y asigna un testigo a una mesa.

**Request:**
```json
{
  "campana_id": 1,
  "cedula": "9876543210",
  "nombre_completo": "Carlos Ramírez",
  "celular": "+573009876543",
  "email": "carlos@example.com",
  "mesa_asignada_id": 15234,
  "backup_mesa_id": 15235
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Testigo asignado exitosamente",
  "data": {
    "id": 789,
    "pin_acceso": "712945",
    "credencial_pdf": "https://s3.../credencial-789.pdf",
    "mesa": {
      "numero": "00123",
      "puesto": "Colegio Santa María"
    }
  }
}
```

---

### **PUT /testigos/{id}/estado**

Actualiza el estado de un testigo.

**Request:**
```json
{
  "estado": "en_puesto",
  "ubicacion": {
    "lat": 4.6512,
    "lng": -74.0598
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Estado actualizado",
  "data": {
    "testigo_id": 789,
    "estado": "en_puesto",
    "fecha_cambio": "2027-10-24T07:15:00Z"
  }
}
```

---

### **GET /testigos/mesa/{mesaId}**

Obtiene testigo asignado a una mesa específica.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "nombre_completo": "Carlos Ramírez",
    "celular": "+573009876543",
    "estado": "reportando",
    "fecha_llegada": "2027-10-24T07:15:00Z",
    "acta_id": 987654
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "message": "No hay testigo asignado a esta mesa"
}
```

---

## 📄 ACTAS ELECTORALES

### **POST /actas**

Recibe y procesa un acta (desde PWA).

**Content-Type:** `multipart/form-data`

**Form data:**
```
campana_id: 1
mesa_id: 15234
testigo_id: 789
fecha_captura: 2027-10-24T18:35:12Z
hora_apertura: 08:00:00
hora_cierre: 16:00:00
ubicacion_captura[lat]: 4.6512
ubicacion_captura[lng]: -74.0598
total_votantes_habilitados: 342
total_votos_depositados: 287
votos_candidato_principal: 142
votos_otros: [{"candidato":"Competidor A","votos":98},{"candidato":"Competidor B","votos":45}]
votos_blancos: 1
votos_nulos: 1
offline_queue_id: uuid-local-456abc
imagen: [archivo.jpg]
```

**Response 201:**
```json
{
  "success": true,
  "message": "Acta procesada correctamente",
  "data": {
    "id": 987654,
    "mesa": {
      "numero": "00123",
      "puesto": "Colegio Santa María"
    },
    "validaciones": {
      "suma_correcta": true,
      "votos_vs_habilitados": true,
      "participacion_razonable": true,
      "consistencia_territorial": true
    },
    "imagen_url": "https://s3.../acta-987654.jpg",
    "estado": "validada",
    "created_at": "2027-10-24T18:35:15Z"
  }
}
```

**Response 422 (Validación fallida):**
```json
{
  "success": false,
  "message": "Acta con inconsistencias",
  "errors": {
    "suma_votos": "La suma de votos (303) no coincide con votos depositados (287)",
    "votos_exceden": false
  },
  "data": {
    "acta_id": 987654,
    "estado": "pendiente_revision",
    "alerta_generada": 4567
  }
}
```

**Response 409 (Conflicto - mesa ya reportada):**
```json
{
  "success": false,
  "message": "Esta mesa ya tiene un acta validada",
  "data": {
    "acta_existente_id": 987650,
    "acta_nueva_id": 987654,
    "timestamp_existente": "2027-10-24T18:20:00Z",
    "timestamp_nueva": "2027-10-24T18:35:12Z",
    "requiere_resolucion": true
  }
}
```

---

### **GET /actas/{id}**

Obtiene detalles de un acta específica.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 987654,
    "campana_id": 1,
    "mesa": {
      "id": 15234,
      "numero": "00123",
      "puesto": "Colegio Santa María",
      "municipio": "Bogotá D.C.",
      "zona": 5
    },
    "testigo": {
      "id": 789,
      "nombre_completo": "Carlos Ramírez",
      "cedula": "9876543210"
    },
    "captura": {
      "fecha": "2027-10-24T18:35:12Z",
      "hora_apertura": "08:00:00",
      "hora_cierre": "16:00:00",
      "ubicacion": {
        "lat": 4.6512,
        "lng": -74.0598
      }
    },
    "imagen": {
      "url": "https://s3.../acta-987654.jpg",
      "hash": "a3f5b8c2e1d9f4a7b6c8e2d1f5a9b3c7e4d8f2a6"
    },
    "datos_acta": {
      "votantes_habilitados": 342,
      "votos_depositados": 287,
      "participacion": 83.92,
      "votos_candidato_principal": 142,
      "porcentaje_candidato": 49.48,
      "votos_otros": [
        {"candidato": "Competidor A", "votos": 98},
        {"candidato": "Competidor B", "votos": 45}
      ],
      "votos_blancos": 1,
      "votos_nulos": 1
    },
    "validaciones": {
      "suma_correcta": true,
      "votos_vs_habilitados": true,
      "participacion_razonable": true,
      "consistencia_territorial": true
    },
    "ocr": {
      "procesado": true,
      "confianza": 0.95,
      "coincide_manual": true,
      "procesado_at": "2027-10-24T18:40:15Z"
    },
    "estado": "validada",
    "validada_por": "sistema",
    "validada_at": "2027-10-24T18:35:18Z",
    "created_at": "2027-10-24T18:35:15Z"
  }
}
```

---

### **GET /actas/mesa/{mesaId}**

Obtiene acta(s) de una mesa específica.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 987654,
      "estado": "validada",
      "testigo": "Carlos Ramírez",
      "fecha_captura": "2027-10-24T18:35:12Z",
      "votos_candidato_principal": 142,
      "total_votos": 287
    }
  ],
  "total": 1
}
```

---

### **PUT /actas/{id}/validar**

Valida o rechaza un acta manualmente (por admin).

**Request:**
```json
{
  "validada": true,
  "validada_por": "admin@campana.com",
  "notas": "Verificado contra E-24 oficial"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Acta validada",
  "data": {
    "acta_id": 987654,
    "estado": "validada",
    "validada_at": "2027-10-24T20:00:00Z"
  }
}
```

---

### **GET /actas/pendientes-sincronizacion**

Lista actas que fallan sincronización (para debugging).

**Query params:**
- `campana_id` (required)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "offline_queue_id": "uuid-local-789",
      "testigo_id": 790,
      "mesa_id": 15235,
      "intentos": 3,
      "ultimo_error": "Network timeout",
      "fecha_captura": "2027-10-24T18:45:00Z"
    }
  ],
  "total": 5
}
```

---

### **POST /actas/batch-sync**

Sincronización en batch (desde PWA con múltiples actas offline).

**Request:**
```json
{
  "dispositivo_id": "uuid-testigo-device-789",
  "testigo_id": 789,
  "timestamp_sincronizacion": "2027-10-24T19:15:00Z",
  "actas_pendientes": [
    {
      "offline_queue_id": "uuid-local-001",
      "mesa_id": 15234,
      "timestamp_captura": "2027-10-24T18:35:12Z",
      "imagen_base64": "data:image/jpeg;base64,...",
      "datos_acta": { /* ... */ }
    },
    {
      "offline_queue_id": "uuid-local-002",
      "mesa_id": 15235,
      "timestamp_captura": "2027-10-24T18:58:34Z",
      "imagen_base64": "data:image/jpeg;base64,...",
      "datos_acta": { /* ... */ }
    }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Sincronización completada",
  "data": {
    "procesadas": 2,
    "exitosas": 2,
    "fallidas": 0,
    "detalles": [
      {
        "offline_queue_id": "uuid-local-001",
        "acta_id": 987654,
        "status": "validada"
      },
      {
        "offline_queue_id": "uuid-local-002",
        "acta_id": 987655,
        "status": "alerta_inconsistencia",
        "alerta_id": 4567
      }
    ]
  }
}
```

---

## 📊 CONTEO PARALELO

### **GET /conteo/agregado/{campanaId}**

Obtiene conteo agregado por nivel.

**Query params:**
- `nivel`: `mesa`, `puesto`, `zona`, `municipio`, `departamento`, `nacional`
- `entidad_id` (opcional): ID según nivel

**Response 200 (nivel=municipio, entidad_id=25001):**
```json
{
  "success": true,
  "data": {
    "campana_id": 1,
    "nivel": "municipio",
    "entidad": {
      "id": 25001,
      "nombre": "Bogotá D.C."
    },
    "cobertura": {
      "total_mesas": 3120,
      "mesas_reportadas": 2989,
      "porcentaje": 95.80,
      "mesas_pendientes": 131
    },
    "resultados": {
      "votos_candidato_principal": 438267,
      "porcentaje_candidato": 48.92,
      "votos_competencia": [
        {"candidato": "Competidor A", "votos": 312456, "porcentaje": 34.88},
        {"candidato": "Competidor B", "votos": 143298, "porcentaje": 16.00}
      ],
      "votos_blancos": 1234,
      "votos_nulos": 1789,
      "total_votos": 897044
    },
    "tendencia": {
      "ultima_hora": "+0.3%",
      "ultimas_100_mesas": "+0.5%"
    },
    "updated_at": "2027-10-24T20:15:34Z"
  }
}
```

**Response 200 (nivel=nacional):**
```json
{
  "success": true,
  "data": {
    "campana_id": 1,
    "nivel": "nacional",
    "cargo": "Alcaldía Bogotá D.C.",
    "cobertura_global": {
      "total_mesas": 3120,
      "mesas_reportadas": 2989,
      "porcentaje": 95.80
    },
    "resultados": {
      "votos_candidato_principal": 438267,
      "porcentaje": 48.92,
      "votos_total": 897044
    },
    "desglose_territorial": [
      {
        "localidad": "Usaquén",
        "mesas_reportadas": 187,
        "mesas_totales": 195,
        "cobertura": 95.90,
        "votos_candidato": 28456,
        "porcentaje": 52.30
      },
      {
        "localidad": "Chapinero",
        "mesas_reportadas": 98,
        "mesas_totales": 102,
        "cobertura": 96.08,
        "votos_candidato": 14234,
        "porcentaje": 47.10
      }
    ]
  }
}
```

---

### **GET /conteo/tiempo-real/{campanaId}**

Stream de conteo en tiempo real (Server-Sent Events).

**Response:** Stream SSE

```
data: {"mesas_reportadas":2847,"votos_candidato":438267,"timestamp":"2027-10-24T20:15:00Z"}

data: {"mesas_reportadas":2848,"votos_candidato":438409,"timestamp":"2027-10-24T20:15:15Z"}

data: {"mesas_reportadas":2849,"votos_candidato":438556,"timestamp":"2027-10-24T20:15:30Z"}
```

---

### **GET /conteo/comparativa**

Compara conteo paralelo vs resultados oficiales.

**Query params:**
- `campana_id` (required)
- `nivel`: `mesa`, `municipio`, etc
- `vs_oficial`: `true`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campana_id": 1,
    "comparativa": {
      "conteo_paralelo": {
        "votos_candidato": 438267,
        "porcentaje": 48.92,
        "mesas": 2989
      },
      "resultados_oficiales": {
        "votos_candidato": 441234,
        "porcentaje": 49.15,
        "mesas": 3120
      },
      "diferencia": {
        "votos_absoluta": -2967,
        "porcentaje_absoluta": -0.23,
        "mesas_faltantes": 131,
        "confiabilidad": "alta"
      }
    },
    "discrepancias_por_mesa": [
      {
        "mesa_id": 15678,
        "numero": "00456",
        "delta_votos": 15,
        "delta_porcentaje": 5.2,
        "requiere_revision": true
      }
    ]
  }
}
```

---

## 🚨 ALERTAS

### **GET /alertas**

Lista alertas activas.

**Query params:**
- `campana_id` (required)
- `estado`: `pendiente`, `revisando`, `resuelta`, `falsa_alarma`
- `severidad`: `baja`, `media`, `alta`, `critica`
- `tipo` (opcional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 4567,
      "tipo": "inconsistencia_aritmetica",
      "severidad": "alta",
      "titulo": "Suma de votos no coincide",
      "descripcion": "La suma de votos no coincide con votos depositados",
      "mesa": {
        "id": 15678,
        "numero": "00456",
        "puesto": "Colegio Distrital San José",
        "municipio": "Bogotá D.C."
      },
      "acta_id": 987655,
      "datos": {
        "votos_depositados": 298,
        "suma_votos": 302,
        "diferencia": 4
      },
      "estado": "pendiente",
      "created_at": "2027-10-24T18:42:15Z"
    }
  ],
  "total": 13,
  "resumen_severidad": {
    "critica": 2,
    "alta": 5,
    "media": 4,
    "baja": 2
  }
}
```

---

### **POST /alertas**

Crea una alerta manual.

**Request:**
```json
{
  "campana_id": 1,
  "tipo": "testigo_ausente",
  "severidad": "alta",
  "mesa_id": 15679,
  "descripcion": "Testigo no se presentó al puesto"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Alerta creada",
  "data": {
    "id": 4568,
    "tipo": "testigo_ausente",
    "severidad": "alta",
    "created_at": "2027-10-24T09:00:00Z"
  }
}
```

---

### **PUT /alertas/{id}/estado**

Actualiza estado de una alerta.

**Request:**
```json
{
  "estado": "resuelta",
  "resolucion": "Testigo confirmó vía WhatsApp. Foto acta muestra suma correcta de 298 votos.",
  "asignado_a": "coordinador@campana.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Alerta actualizada",
  "data": {
    "alerta_id": 4567,
    "estado": "resuelta",
    "resuelta_at": "2027-10-24T19:00:00Z"
  }
}
```

---

### **GET /alertas/criticas**

Obtiene solo alertas críticas (atajo).

**Query params:**
- `campana_id` (required)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 4569,
      "tipo": "fraude_potencial",
      "severidad": "critica",
      "titulo": "Votos exceden votantes habilitados",
      "mesa": {
        "numero": "00789",
        "puesto": "Escuela Rural",
        "municipio": "Soacha"
      },
      "datos": {
        "votantes_habilitados": 250,
        "votos_depositados": 265,
        "exceso": 15
      },
      "estado": "pendiente",
      "created_at": "2027-10-24T17:30:00Z"
    }
  ],
  "total": 2
}
```

---

## 🔄 SINCRONIZACIÓN

### **POST /sync/queue**

Agrega acta a cola de sincronización (uso interno).

**Request:**
```json
{
  "testigo_id": 789,
  "offline_queue_id": "uuid-local-123",
  "data": { /* acta completa */ }
}
```

**Response 202:**
```json
{
  "success": true,
  "message": "Agregado a cola",
  "data": {
    "queue_position": 5,
    "estimated_wait": "15 seconds"
  }
}
```

---

### **GET /sync/status/{uuid}**

Consulta estado de sincronización.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "offline_queue_id": "uuid-local-123",
    "status": "completed",
    "acta_id": 987654,
    "processed_at": "2027-10-24T18:35:18Z"
  }
}
```

**Response 200 (pendiente):**
```json
{
  "success": true,
  "data": {
    "offline_queue_id": "uuid-local-123",
    "status": "pending",
    "queue_position": 3,
    "estimated_wait": "10 seconds"
  }
}
```

---

### **POST /sync/resolve-conflict**

Resuelve conflicto de sincronización (2 testigos misma mesa).

**Request:**
```json
{
  "acta_principal_id": 987654,
  "acta_descartada_id": 987650,
  "motivo": "Acta 987654 tiene timestamp más reciente y foto más clara",
  "resuelto_por": "admin@campana.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Conflicto resuelto",
  "data": {
    "acta_principal": 987654,
    "acta_descartada": 987650,
    "updated_at": "2027-10-24T20:30:00Z"
  }
}
```

---

## 🔍 OCR

### **POST /ocr/procesar-acta**

Procesa OCR de un acta (job asíncrono).

**Request:**
```json
{
  "acta_id": 987654
}
```

**Response 202:**
```json
{
  "success": true,
  "message": "OCR en cola",
  "data": {
    "job_id": "uuid-job-ocr-123",
    "status_url": "/ocr/resultado/987654",
    "estimated_time": "30 seconds"
  }
}
```

---

### **GET /ocr/resultado/{actaId}**

Obtiene resultado de OCR.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "acta_id": 987654,
    "ocr_procesado": true,
    "confianza": 0.95,
    "resultado": {
      "votantes_habilitados": 342,
      "votos_depositados": 287,
      "votos_candidato_principal": 142,
      "votos_nulos": 1,
      "votos_blancos": 1
    },
    "comparacion_manual": {
      "coincide": true,
      "diferencias": []
    },
    "procesado_at": "2027-10-24T18:40:15Z"
  }
}
```

**Response 200 (diferencias):**
```json
{
  "success": true,
  "data": {
    "acta_id": 987655,
    "ocr_procesado": true,
    "confianza": 0.82,
    "resultado": {
      "votos_candidato_principal": 145
    },
    "comparacion_manual": {
      "coincide": false,
      "diferencias": [
        {
          "campo": "votos_candidato_principal",
          "valor_manual": 142,
          "valor_ocr": 145,
          "diferencia": 3
        }
      ],
      "requiere_revision": true
    }
  }
}
```

---

## 📝 AUDITORÍA

### **GET /auditoria/acta/{actaId}**

Obtiene trail completo de auditoría de un acta.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10001,
      "accion": "creada",
      "usuario": "testigo-789",
      "ip": "186.85.123.45",
      "datos_despues": {
        "votos_candidato_principal": 142
      },
      "hash_actual": "abc123...xyz789",
      "timestamp": "2027-10-24T18:35:15Z"
    },
    {
      "id": 10002,
      "accion": "validada",
      "usuario": "sistema",
      "datos_antes": {
        "validada": false
      },
      "datos_despues": {
        "validada": true
      },
      "hash_anterior": "abc123...xyz789",
      "hash_actual": "def456...uvw012",
      "timestamp": "2027-10-24T18:35:18Z"
    }
  ],
  "integridad_cadena": true
}
```

---

### **GET /auditoria/mesa/{mesaId}**

Auditoría de todas las actas de una mesa (si hubo duplicados).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mesa_id": 15234,
    "actas_recibidas": 2,
    "actas": [
      {
        "acta_id": 987654,
        "testigo": "Carlos Ramírez",
        "timestamp_captura": "2027-10-24T18:35:12Z",
        "estado": "validada"
      },
      {
        "acta_id": 987650,
        "testigo": "Ana Martínez",
        "timestamp_captura": "2027-10-24T18:20:00Z",
        "estado": "descartada",
        "motivo": "Duplicado - timestamp anterior"
      }
    ]
  }
}
```

---

## 🔌 WEBSOCKETS (Socket.io)

### **Conexión**

```javascript
import io from 'socket.io-client';

const socket = io('https://diad.plataforma-electoral.com', {
  auth: {
    token: 'jwt-token-here'
  }
});
```

### **Eventos Cliente → Servidor**

```javascript
// Unirse a room de campaña
socket.emit('join:campana', { campana_id: 1 });

// Unirse a room de mesa
socket.emit('join:mesa', { mesa_id: 15234 });

// Heartbeat
socket.emit('ping');
```

### **Eventos Servidor → Cliente**

```javascript
// Nueva acta procesada
socket.on('acta:procesada', (data) => {
  console.log('Nueva acta:', data);
  /*
  {
    acta_id: 987654,
    mesa_id: 15234,
    votos_candidato_principal: 142,
    timestamp: '2027-10-24T18:35:15Z'
  }
  */
});

// Conteo actualizado
socket.on('conteo:actualizado', (data) => {
  console.log('Conteo:', data);
  /*
  {
    nivel: 'municipio',
    entidad_id: 25001,
    mesas_reportadas: 2848,
    votos_candidato: 438409,
    porcentaje: 48.95
  }
  */
});

// Nueva alerta
socket.on('alerta:nueva', (data) => {
  console.log('Alerta:', data);
  /*
  {
    alerta_id: 4567,
    tipo: 'inconsistencia_aritmetica',
    severidad: 'alta',
    mesa_id: 15678
  }
  */
});

// Estado sincronización
socket.on('sincronizacion:status', (data) => {
  console.log('Sync:', data);
  /*
  {
    offline_queue_id: 'uuid-local-123',
    status: 'completed',
    acta_id: 987654
  }
  */
});

// Testigo conectado/desconectado
socket.on('testigo:conectado', (data) => {
  /*
  {
    testigo_id: 789,
    mesa_id: 15234,
    timestamp: '2027-10-24T07:15:00Z'
  }
  */
});

// Pong (respuesta heartbeat)
socket.on('pong', () => {
  console.log('Server alive');
});
```

---

## 🔒 ENDPOINTS INTERNOS (comunicación Laravel ↔ NestJS)

Solo accesibles desde red interna.

### **GET /internal/validar-testigo**

Valida que un testigo está autorizado para reportar una mesa.

**Query params:**
- `testigo_id`
- `mesa_id`

**Response 200:**
```json
{
  "autorizado": true,
  "testigo": {
    "id": 789,
    "nombre": "Carlos Ramírez"
  }
}
```

---

## ⚡ PERFORMANCE Y LÍMITES

- **Rate Limiting:**
  - API: 200 req/min por IP
  - WebSocket: 2000 eventos/min por conexión

- **Concurrencia:**
  - Max 10,000 conexiones WebSocket simultáneas por instancia
  - Redis Adapter para múltiples instancias

- **Timeouts:**
  - API: 30 segundos
  - Upload acta: 2 minutos
  - WebSocket heartbeat: 30 segundos

---

## 📊 MÉTRICAS DE MONITOREO

Endpoints para health checks (no requieren auth):

### **GET /health**
```json
{
  "status": "ok",
  "timestamp": "2027-10-24T20:00:00Z",
  "version": "1.0.0"
}
```

### **GET /health/db**
```json
{
  "status": "ok",
  "latency_ms": 5,
  "connections": 45
}
```

### **GET /health/redis**
```json
{
  "status": "ok",
  "latency_ms": 2
}
```

---

**Última actualización:** Diciembre 13, 2024
