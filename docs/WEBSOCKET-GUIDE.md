# 🔌 WebSockets - Guía de Uso
## Sistema de Preconteo Electoral en Tiempo Real

**Namespace:** `/ws/preconteo`  
**Transport:** WebSocket / Polling (fallback)  
**Autenticación:** JWT Token (opcional en desarrollo)

---

## 📡 Eventos del Servidor

### Eventos de Conexión

#### `CONNECTED`
Confirmación de conexión establecida.

```json
{
  "socketId": "abc123",
  "timestamp": "2027-10-24T18:30:00.000Z",
  "message": "Conexión establecida con el servidor de preconteo"
}
```

#### `SUBSCRIBED`
Confirmación de suscripción a un room.

```json
{
  "room": "DEPARTAMENTO:5:1",
  "scope_type": "DEPARTAMENTO",
  "scope_id": 5,
  "election_position_id": 1,
  "message": "Suscrito a actualizaciones de DEPARTAMENTO 5"
}
```

---

### Eventos de Datos

#### `RESULTADOS_ACTUALIZADOS`
Se emite cuando hay nuevos resultados agregados.

**Cuándo:** Cada vez que se valida un acta.

```json
{
  "event": "RESULTADOS_ACTUALIZADOS",
  "timestamp": "2027-10-24T18:45:00.000Z",
  "scope_type": "DEPARTAMENTO",
  "scope_id": 5,
  "election_position_id": 1,
  "data": {
    "total_votos": 15420,
    "resultados": [
      {
        "candidate_id": 1,
        "candidate_nombre": "Carlos Rodríguez",
        "votos": 7895,
        "porcentaje": 51.20
      }
    ]
  }
}
```

---

#### `PROGRESO_MESAS`
Se emite periódicamente con el avance del reporte.

**Cuándo:** Cada 5 minutos o cuando cambia significativamente.

```json
{
  "event": "PROGRESO_MESAS",
  "timestamp": "2027-10-24T18:45:00.000Z",
  "election_position_id": 1,
  "data": {
    "total_mesas": 3200,
    "reportadas": 2845,
    "observadas": 123,
    "pendientes": 355,
    "porcentaje_avance": 88.91
  }
}
```

---

#### `ALERTA`
Se emite cuando hay alertas importantes.

**Cuándo:** Se detecta una inconsistencia en un acta.

```json
{
  "event": "ALERTA",
  "timestamp": "2027-10-24T18:45:00.000Z",
  "tipo": "SUMA_INVALIDA",
  "severidad": "CRITICAL",
  "mensaje": "Suma de votos (245) no coincide con sufragantes (250)",
  "data": {
    "mesa_id": 123,
    "record_id": 456
  }
}
```

**Severidades:**
- `INFO` - Información general
- `WARNING` - Advertencia, revisar
- `CRITICAL` - Crítico, requiere acción inmediata

---

#### `NUEVA_ACTA`
Se emite cuando se carga un acta.

```json
{
  "event": "NUEVA_ACTA",
  "timestamp": "2027-10-24T18:45:00.000Z",
  "scope_type": "MUNICIPIO",
  "scope_id": 5001,
  "election_position_id": 1,
  "data": {
    "record_id": 456,
    "mesa_id": 123,
    "estado": "REPORTADA"
  }
}
```

---

#### `ACTA_VALIDADA`
Se emite cuando un coordinador valida un acta.

```json
{
  "event": "ACTA_VALIDADA",
  "timestamp": "2027-10-24T18:45:00.000Z",
  "scope_type": "MUNICIPIO",
  "scope_id": 5001,
  "election_position_id": 1,
  "data": {
    "record_id": 456,
    "mesa_id": 123,
    "validada_por": 789
  }
}
```

---

## 📤 Eventos del Cliente

### `subscribe`
Suscribirse a un territorio específico.

```javascript
socket.emit('subscribe', {
  scope_type: 'DEPARTAMENTO',  // MESA, PUESTO, MUNICIPIO, DEPARTAMENTO
  scope_id: 5,                  // ID del territorio
  election_position_id: 1       // ID del cargo
});
```

---

### `unsubscribe`
Desuscribirse de un territorio.

```javascript
socket.emit('unsubscribe', {
  scope_type: 'DEPARTAMENTO',
  scope_id: 5,
  election_position_id: 1
});
```

---

### `ping`
Heartbeat para mantener conexión.

```javascript
socket.emit('ping');
// Respuesta: pong { timestamp: "..." }
```

---

### `get_stats`
Obtener estadísticas del servidor.

```javascript
socket.emit('get_stats', (response) => {
  console.log(response);
});
```

---

## 🔧 Ejemplos de Uso

### Conexión Básica (JavaScript)

```javascript
const socket = io('http://localhost:3000/ws/preconteo', {
  auth: {
    token: 'tu-jwt-token'
  }
});

// Eventos
socket.on('connect', () => {
  console.log('Conectado');
  
  // Suscribirse a Antioquia
  socket.emit('subscribe', {
    scope_type: 'DEPARTAMENTO',
    scope_id: 5,
    election_position_id: 1
  });
});

socket.on('RESULTADOS_ACTUALIZADOS', (data) => {
  console.log('Nuevos resultados:', data);
});
```

---

### React Hook

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function usePreconteo(scopeType, scopeId, cargoId) {
  const [resultados, setResultados] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io('/ws/preconteo', {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('subscribe', {
        scope_type: scopeType,
        scope_id: scopeId,
        election_position_id: cargoId
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('RESULTADOS_ACTUALIZADOS', (data) => {
      setResultados(data.data);
    });

    socket.on('PROGRESO_MESAS', (data) => {
      setProgreso(data.data);
    });

    return () => {
      socket.disconnect();
    };
  }, [scopeType, scopeId, cargoId]);

  return { resultados, progreso, connected };
}

// Uso en componente
function Dashboard() {
  const { resultados, progreso, connected } = usePreconteo('DEPARTAMENTO', 5, 1);
  
  return (
    <div>
      <div className={connected ? 'green' : 'red'}>
        {connected ? 'Conectado' : 'Desconectado'}
      </div>
      {progreso && (
        <div>Avance: {progreso.porcentaje_avance}%</div>
      )}
      {resultados && (
        <div>Total votos: {resultados.total_votos}</div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing con Postman

1. **Instalar extensión Socket.io de Postman**
   - Postman no soporta WebSockets nativamente
   - Usar: https://www.npmjs.com/package/socket.io-postman

2. **Conectar**
   ```
   URL: ws://localhost:3000/ws/preconteo
   Headers: { "Authorization": "Bearer tu-token" }
   ```

3. **Enviar mensajes**
   ```json
   // Subscribe
   {
     "event": "subscribe",
     "data": {
       "scope_type": "DEPARTAMENTO",
       "scope_id": 5,
       "election_position_id": 1
     }
   }
   ```

---

## 🖥️ Testing con CLI (Node.js)

```bash
# Instalar cliente
npm install socket.io-client

# Crear archivo test-ws.js
cat > test-ws.js << 'EOF'
const io = require('socket.io-client');

const socket = io('http://localhost:3000/ws/preconteo', {
  auth: { token: 'tu-token' }
});

socket.on('connect', () => {
  console.log('✅ Conectado');
  
  socket.emit('subscribe', {
    scope_type: 'DEPARTAMENTO',
    scope_id: 5,
    election_position_id: 1
  });
});

socket.on('RESULTADOS_ACTUALIZADOS', (data) => {
  console.log('📊 Resultados:', data.data.total_votos);
});

socket.on('PROGRESO_MESAS', (data) => {
  console.log('📈 Progreso:', data.data.porcentaje_avance + '%');
});
EOF

# Ejecutar
node test-ws.js
```

---

## 🔒 Autenticación

### En Desarrollo
- Token opcional
- Se permiten conexiones sin auth

### En Producción
- Token JWT requerido
- Desconexión automática si token inválido

```javascript
const socket = io('/ws/preconteo', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
```

---

## 🏗️ Arquitectura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Cliente 1     │     │   Cliente 2     │     │   Cliente 3     │
│   (Dashboard)   │     │   (Dashboard)   │     │   (Testigo)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ WebSocket             │ WebSocket             │ WebSocket
         └───────────┬───────────┴───────────┬───────────┘
                     │                       │
              ┌──────▼───────────────────────▼──────┐
              │         Load Balancer              │
              └──────┬──────────────────────┬──────┘
                     │                      │
         ┌───────────▼──────────┐  ┌────────▼──────────┐
         │  Servidor NestJS 1   │  │  Servidor NestJS 2 │
         │  (WebSocket Server)  │  │  (WebSocket Server)│
         └───────────┬──────────┘  └────────┬──────────┘
                     │                      │
                     └──────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │      Redis Pub/Sub    │
                    │   (Adapter Redis)     │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │    PostgreSQL +       │
                    │    PostGIS            │
                    └───────────────────────┘
```

**Redis Adapter:** Permite múltiples instancias del servidor compartir el mismo estado de WebSockets.

---

## ⚡ Performance

- **Rooms por scope:** Clientes solo reciben eventos de sus rooms suscritos
- **Broadcast eficiente:** Redis adapter distribuye mensajes entre instancias
- **Reconexión automática:** Clientes reconectan automáticamente si se pierde conexión
- **Heartbeat:** Ping/pong cada 30 segundos para detectar conexiones muertas

---

## 🐛 Troubleshooting

### No se reciben eventos
- Verificar suscripción: `socket.emit('subscribe', {...})`
- Revisar que el room sea correcto: `${scope_type}:${scope_id}:${election_position_id}`

### Conexión cae inmediatamente
- Verificar token JWT
- Revisar CORS en servidor

### Eventos duplicados
- Evitar múltiples suscripciones al mismo room
- Usar `socket.off()` antes de re-suscribir

### Latencia alta
- Usar `transports: ['websocket']` (sin polling)
- Verificar proximidad al servidor

---

**Documentación:** Mayo 2026  
**Versión:** 1.0.0  
**Socket.io:** v4.x
