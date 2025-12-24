# API REST - Plataforma Electoral Colombia

## Información General

- **Base URL**: `http://localhost:8000/api`
- **Autenticación**: Bearer Token (Laravel Sanctum)
- **Formato**: JSON
- **Versión**: 1.0.0

## Autenticación

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@plataforma.com",
  "password": "Admin2024!"
}

Response 200:
{
  "success": true,
  "token": "1|abc123...",
  "user": { ... },
  "expires_at": "2024-12-24T10:00:00.000000Z"
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Nuevo Usuario",
  "email": "nuevo@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "role_id": 2
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@plataforma.com",
    "role": { "id": 1, "name": "super_admin" }
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

---

## Estructura Electoral

### Departamentos

#### Listar departamentos
```http
GET /electoral/departamentos?search=antio
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "05",
      "nombre": "Antioquia",
      "poblacion": 6407102,
      "capital": "Medellín"
    }
  ]
}
```

#### Ver departamento
```http
GET /electoral/departamentos/{id}
Authorization: Bearer {token}
```

#### Municipios del departamento
```http
GET /electoral/departamentos/{id}/municipios
Authorization: Bearer {token}
```

#### Estadísticas del departamento
```http
GET /electoral/departamentos/{id}/estadisticas
Authorization: Bearer {token}
```

### Municipios

#### Listar municipios
```http
GET /electoral/municipios?departamento_id=5&search=med
Authorization: Bearer {token}
```

#### Ver municipio
```http
GET /electoral/municipios/{id}
Authorization: Bearer {token}
```

#### Puestos del municipio
```http
GET /electoral/municipios/{id}/puestos
Authorization: Bearer {token}
```

### Puestos de Votación

#### Listar puestos
```http
GET /electoral/puestos?municipio_id=1&per_page=20
Authorization: Bearer {token}
```

#### Puestos cercanos (PostGIS)
```http
GET /electoral/puestos/cercanos?lat=6.2442&lon=-75.5812&radio_km=5
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Colegio San José",
      "direccion": "Calle 50 # 45-23",
      "distancia_metros": 1234.56,
      "total_mesas": 15
    }
  ]
}
```

---

## Campañas

#### Listar campañas
```http
GET /campanas?tipo=alcaldia&activas=true
Authorization: Bearer {token}
```

#### Crear campaña
```http
POST /campanas
Authorization: Bearer {token}
Content-Type: application/json

{
  "nombre": "Alcaldía Medellín 2027",
  "tipo": "alcaldia",
  "municipio_id": 1,
  "candidato_nombre": "Juan Pérez",
  "fecha_inicio": "2026-01-15",
  "fecha_eleccion": "2027-10-24"
}
```

#### Ver campaña
```http
GET /campanas/{id}
Authorization: Bearer {token}
```

#### Actualizar campaña
```http
PUT /campanas/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "estado": "activa",
  "slogan": "Por un futuro mejor"
}
```

#### Estadísticas de campaña
```http
GET /campanas/{id}/estadisticas
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totales": {
      "votantes": 15234,
      "eventos": 45,
      "donaciones": 125
    },
    "intencion_voto": {
      "a_favor": 8500,
      "en_contra": 2100,
      "indecisos": 4634
    }
  }
}
```

---

## CRM - Votantes

#### Listar votantes
```http
GET /crm/votantes?campana_id=1&intencion_voto=a_favor&municipio_id=1&per_page=50
Authorization: Bearer {token}

Filtros disponibles:
- search: Búsqueda por nombre, documento
- intencion_voto: a_favor, en_contra, indeciso, sin_definir
- municipio_id: ID del municipio
- scoring_min: Scoring mínimo (0-100)
- lideres: Solo líderes
- sort_by: Campo de ordenamiento
- sort_order: asc, desc
```

#### Crear votante
```http
POST /crm/votantes
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "documento": "1234567890",
  "tipo_documento": "CC",
  "nombres": "María",
  "apellidos": "González",
  "telefono": "3001234567",
  "email": "maria@example.com",
  "municipio_id": 1,
  "direccion": "Calle 50 # 45-23",
  "genero": "F",
  "fecha_nacimiento": "1985-03-15",
  "scoring": 75,
  "intencion_voto": "a_favor"
}
```

#### Ver votante
```http
GET /crm/votantes/{id}
Authorization: Bearer {token}
```

#### Actualizar votante
```http
PUT /crm/votantes/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "scoring": 85,
  "intencion_voto": "a_favor",
  "notas": "Muy comprometido con la campaña"
}
```

#### Registrar contacto
```http
POST /crm/votantes/{id}/contacto
Authorization: Bearer {token}
Content-Type: application/json

{
  "tipo_contacto": "llamada",
  "canal": "telefono",
  "resultado": "exitoso",
  "intencion_voto_despues": "a_favor",
  "notas": "Muy receptivo, asistirá al evento"
}
```

#### Estadísticas de votantes
```http
GET /crm/votantes/estadisticas?campana_id=1
Authorization: Bearer {token}
```

---

## CRM - Segmentos

#### Listar segmentos
```http
GET /crm/segmentos?campana_id=1&tipo=dinamico
Authorization: Bearer {token}
```

#### Crear segmento
```http
POST /crm/segmentos
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "nombre": "Votantes alto scoring Medellín",
  "descripcion": "Votantes con scoring > 70 en Medellín",
  "tipo": "dinamico",
  "criterios": {
    "scoring_minimo": 70,
    "municipio_id": 1,
    "intencion_voto": "a_favor"
  }
}
```

#### Agregar votantes (segmento estático)
```http
POST /crm/segmentos/{id}/agregar-votantes
Authorization: Bearer {token}
Content-Type: application/json

{
  "votantes_ids": [1, 2, 3, 4, 5]
}
```

#### Remover votantes (segmento estático)
```http
POST /crm/segmentos/{id}/remover-votantes
Authorization: Bearer {token}
Content-Type: application/json

{
  "votantes_ids": [1, 2]
}
```

#### Recalcular segmento dinámico
```http
POST /crm/segmentos/{id}/recalcular
Authorization: Bearer {token}
```

---

## Eventos

#### Listar eventos
```http
GET /eventos?campana_id=1&tipo=mitin&estado=planificado&proximos=true
Authorization: Bearer {token}

Tipos: mitin, reunion, puerta_puerta, capacitacion, movilizacion, otro
Estados: planificado, confirmado, en_curso, finalizado, cancelado, pospuesto
```

#### Crear evento
```http
POST /eventos
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "nombre": "Gran Mitin Central",
  "tipo": "mitin",
  "fecha_inicio": "2027-05-15 18:00:00",
  "fecha_fin": "2027-05-15 21:00:00",
  "ubicacion_nombre": "Parque de Berrío",
  "direccion": "Carrera 50 # 50-50",
  "municipio_id": 1,
  "capacidad_maxima": 5000,
  "meta_asistentes": 3000,
  "descripcion": "Gran evento de cierre de campaña"
}
```

#### Ver evento
```http
GET /eventos/{id}
Authorization: Bearer {token}

Response incluye:
- Datos del evento
- Asistencias confirmadas
- Estadísticas (tasa de asistencia, % de meta)
```

#### Confirmar asistencia
```http
POST /eventos/{id}/confirmar-asistencia
Authorization: Bearer {token}
Content-Type: application/json

{
  "votante_id": 123,
  "medio_confirmacion": "app"
}

Medios: app, sms, llamada, presencial, otro
```

#### Check-in con QR
```http
POST /eventos/checkin/{qrToken}
Authorization: Bearer {token}
Content-Type: application/json

{
  "votante_id": 123,
  "latitud": 6.2442,
  "longitud": -75.5812
}

Response 200:
{
  "success": true,
  "message": "Check-in registrado exitosamente",
  "data": {
    "evento": "Gran Mitin Central",
    "votante": "María González",
    "hora_checkin": "2027-05-15T18:30:00.000000Z"
  }
}
```

#### Estadísticas de evento
```http
GET /eventos/{id}/estadisticas
Authorization: Bearer {token}
```

---

## Donaciones y Donantes

### Donantes

#### Listar donantes
```http
GET /donantes?campana_id=1&tipo=persona_natural&categoria=mayor
Authorization: Bearer {token}

Categorías: menor, regular, mayor, frecuente
```

#### Crear donante persona natural
```http
POST /donantes
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "tipo": "persona_natural",
  "documento": "1234567890",
  "tipo_documento": "CC",
  "nombres": "Carlos",
  "apellidos": "Martínez",
  "email": "carlos@example.com",
  "telefono": "3001234567",
  "municipio_id": 1,
  "acepta_publicacion": true
}
```

#### Crear donante persona jurídica
```http
POST /donantes
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "tipo": "persona_juridica",
  "nit": "900123456-7",
  "razon_social": "Empresa XYZ S.A.S.",
  "representante_legal": "Juan Pérez",
  "email": "info@empresa.com",
  "telefono": "6045551234"
}
```

#### Historial de donaciones
```http
GET /donantes/{id}/historial
Authorization: Bearer {token}
```

### Donaciones

#### Listar donaciones
```http
GET /donaciones?campana_id=1&estado=confirmada&tipo=transferencia
Authorization: Bearer {token}

Estados: registrada, confirmada, rechazada, pendiente_validacion
Tipos: efectivo, transferencia, cheque, especie, servicio
```

#### Crear donación
```http
POST /donaciones
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "donante_id": 5,
  "monto": 5000000,
  "moneda": "COP",
  "tipo": "transferencia",
  "fecha_donacion": "2027-03-15",
  "concepto": "Apoyo a campaña",
  "numero_comprobante": "TRF-001234"
}

Response incluye warnings si excede tope individual:
{
  "success": true,
  "message": "Donación registrada pero requiere validación...",
  "data": { ... },
  "warnings": {
    "excede_tope_individual": true
  }
}
```

#### Confirmar donación
```http
POST /donaciones/{id}/confirmar
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_comprobante": "COMP-123",
  "recibo_url": "https://..."
}
```

#### Rechazar donación
```http
POST /donaciones/{id}/rechazar
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo": "Documentos incompletos"
}
```

#### Reportar al CNE
```http
POST /donaciones/{id}/reportar-cne
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_reporte_cne": "CNE-2027-001234"
}
```

#### Estadísticas de donaciones
```http
GET /donaciones/estadisticas?campana_id=1
Authorization: Bearer {token}

Response incluye:
- Total recaudado
- Número de donaciones
- Por tipo (efectivo, especie)
- Topes legales (%, alertas)
- Cumplimiento CNE
```

---

## Gastos

#### Listar gastos
```http
GET /gastos?campana_id=1&categoria=publicidad&estado=aprobado
Authorization: Bearer {token}

Categorías: publicidad, logistica, personal, eventos, materiales, servicios, transporte, otros
Estados: pendiente_aprobacion, aprobado, rechazado, requiere_validacion
```

#### Crear gasto
```http
POST /gastos
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "categoria": "publicidad",
  "subcategoria": "Vallas publicitarias",
  "descripcion": "10 vallas zona sur",
  "monto": 15000000,
  "moneda": "COP",
  "fecha_gasto": "2027-04-01",
  "proveedor": "Publicidad Total S.A.S.",
  "nit_proveedor": "900111222-3",
  "numero_factura": "FAC-001",
  "metodo_pago": "transferencia"
}
```

#### Aprobar gasto
```http
POST /gastos/{id}/aprobar
Authorization: Bearer {token}
```

#### Rechazar gasto
```http
POST /gastos/{id}/rechazar
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo": "Supera presupuesto asignado"
}
```

#### Reportar al CNE
```http
POST /gastos/{id}/reportar-cne
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_reporte_cne": "CNE-GASTO-2027-001"
}
```

#### Estadísticas de gastos
```http
GET /gastos/estadisticas?campana_id=1
Authorization: Bearer {token}

Response incluye:
- Total gastado
- Por categoría
- Por mes
- Topes legales
- Pendientes de aprobación
```

---

## Comunicación

### Templates

#### Listar templates
```http
GET /comunicacion/templates?campana_id=1&canal=sms&activos=true
Authorization: Bearer {token}

Canales: sms, email, whatsapp
```

#### Crear template
```http
POST /comunicacion/templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "nombre": "Invitación Evento",
  "canal": "sms",
  "contenido": "Hola {{nombre}}, te invitamos al evento el {{fecha}} en {{lugar}}",
  "variables_disponibles": ["nombre", "fecha", "lugar"]
}
```

#### Actualizar template
```http
PUT /comunicacion/templates/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "contenido": "Nuevo contenido...",
  "activo": true
}
```

### Campañas de Comunicación

#### Listar campañas
```http
GET /comunicacion/campanas?campana_id=1&estado=enviada&canal=whatsapp
Authorization: Bearer {token}

Estados: borrador, programada, enviando, enviada, cancelada
```

#### Crear campaña de comunicación
```http
POST /comunicacion/campanas
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "nombre": "Recordatorio Evento Mayo",
  "canal": "sms",
  "template_id": 5,
  "segmento_id": 3,
  "fecha_envio_programada": "2027-05-14 10:00:00"
}
```

#### Enviar campaña
```http
POST /comunicacion/campanas/{id}/enviar
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Campaña en proceso de envío. Los mensajes se están enviando en segundo plano."
}
```

#### Estadísticas de campaña
```http
GET /comunicacion/campanas/{id}/estadisticas
Authorization: Bearer {token}

Response incluye:
- Total destinatarios
- Enviados / Entregados / Fallidos
- Tasa de entrega
- Abiertos / Clicks
- Tasa de apertura
```

### Mensajes Individuales

#### Enviar mensaje individual
```http
POST /comunicacion/mensajes/individual
Authorization: Bearer {token}
Content-Type: application/json

{
  "campana_id": 1,
  "votante_id": 123,
  "canal": "whatsapp",
  "contenido": "Hola María, confirmamos tu asistencia al evento"
}
```

---

## Códigos de Respuesta

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Parámetros faltantes o incorrectos
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: Sin permisos para acceder al recurso
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (duplicado, ya procesado)
- **422 Unprocessable Entity**: Errores de validación
- **500 Internal Server Error**: Error del servidor

## Formato de Errores

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "errors": {
    "campo": ["El campo es requerido"]
  }
}
```

## Paginación

Todos los endpoints de listado soportan paginación:

```http
GET /crm/votantes?campana_id=1&per_page=50&page=2

Response:
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 1500,
    "per_page": 50,
    "current_page": 2,
    "last_page": 30
  }
}
```

## Resumen de Endpoints

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| Auth | 4 | Login, Register, Me, Logout |
| Electoral | 12 | Departamentos, Municipios, Puestos (con PostGIS) |
| Campañas | 5 | CRUD + Estadísticas |
| Votantes | 7 | CRUD + Contactos + Estadísticas |
| Segmentos | 8 | CRUD + Gestión dinámica/estática |
| Eventos | 7 | CRUD + Check-in QR + Asistencia |
| Donantes | 6 | CRUD + Historial |
| Donaciones | 7 | CRUD + CNE + Estadísticas |
| Gastos | 8 | CRUD + Aprobación + CNE |
| Comunicación | 8 | Templates + Campañas + Mensajes |

**Total: 72 endpoints REST funcionales**
