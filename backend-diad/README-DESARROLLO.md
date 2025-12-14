# Backend Día D - Guía de Desarrollo

## 🏗️ Arquitectura

Sistema de tiempo real para el Día D electoral, construido con NestJS, TypeORM, WebSockets y Bull queues.

### Módulos Implementados

#### 1. ActasModule (`src/actas/`)
Gestión de actas electorales con captura de imágenes y procesamiento OCR.

**Endpoints:**
- `POST /v1/actas` - Crear acta con imagen
- `GET /v1/actas` - Listar actas (filtros: campaignId, estado, mesaId)
- `GET /v1/actas/:id` - Obtener acta
- `PUT /v1/actas/:id` - Actualizar acta
- `PUT /v1/actas/:id/validar` - Validar acta
- `PUT /v1/actas/:id/rechazar` - Rechazar acta
- `POST /v1/actas/:id/procesar-ocr` - Procesar OCR
- `GET /v1/actas/mesa/:mesaId` - Actas por mesa
- `GET /v1/actas/testigo/:testigoId` - Actas por testigo

**WebSocket Events (namespace: `/actas`):**
- `join-campaign` - Unirse a sala de campaña
- `acta:nueva` - Nueva acta creada
- `acta:actualizada` - Acta actualizada
- `acta:validada` - Acta validada
- `acta:rechazada` - Acta rechazada
- `acta:ocr-completado` - OCR completado

**Queue Jobs:**
- `process-ocr` - Procesar OCR con AWS Textract

#### 2. TestigosModule (`src/testigos/`)
Monitoreo de testigos en tiempo real con geolocalización.

**Endpoints:**
- `GET /v1/testigos` - Listar testigos
- `GET /v1/testigos/:id` - Obtener testigo
- `PUT /v1/testigos/:id/estado` - Actualizar estado
- `GET /v1/testigos/:id/actividad` - Actividad del testigo
- `POST /v1/testigos/:id/checkin` - Check-in con GPS
- `GET /v1/testigos/campaign/:campaignId/activos` - Testigos activos

**WebSocket Events (namespace: `/testigos`):**
- `join-campaign` - Unirse a sala de campaña
- `testigo:estado-cambio` - Estado cambiado
- `testigo:checkin` - Check-in realizado

#### 3. ConteoModule (`src/conteo/`)
Conteo paralelo en tiempo real con agregaciones.

**Endpoints:**
- `GET /v1/conteo/campaign/:campaignId/tiempo-real` - Resultados tiempo real
- `GET /v1/conteo/campaign/:campaignId/por-circunscripcion` - Por circunscripción
- `GET /v1/conteo/campaign/:campaignId/por-zona` - Por zona
- `GET /v1/conteo/campaign/:campaignId/resumen` - Resumen general
- `GET /v1/conteo/campaign/:campaignId/tendencias` - Tendencias temporales

**WebSocket Events (namespace: `/conteo`):**
- `join-campaign` - Unirse a sala de campaña
- `subscribe-circunscripcion` - Suscribirse a circunscripción
- `conteo:actualizado` - Conteo actualizado
- `conteo:mesa-reportada` - Mesa reportada

#### 4. AlertasModule (`src/alertas/`)
Sistema de alertas con niveles de severidad.

**Endpoints:**
- `POST /v1/alertas` - Crear alerta
- `GET /v1/alertas/campaign/:campaignId` - Alertas de campaña
- `GET /v1/alertas/:id` - Obtener alerta
- `PUT /v1/alertas/:id/resolver` - Resolver alerta
- `PUT /v1/alertas/:id/descartar` - Descartar alerta
- `GET /v1/alertas/campaign/:campaignId/criticas` - Alertas críticas

**WebSocket Events (namespace: `/alertas`):**
- `join-campaign` - Unirse a sala de campaña
- `alerta:nueva` - Nueva alerta
- `alerta:critica` - Alerta crítica (con sonido)
- `alerta:resuelta` - Alerta resuelta
- `alerta:descartada` - Alerta descartada

**Tipos de alerta:**
- `inconsistencia` - Datos inconsistentes
- `fraude_sospecha` - Sospecha de fraude
- `testigo_inactivo` - Testigo sin actividad
- `acta_duplicada` - Acta duplicada
- `conteo_anomalo` - Conteo anómalo

**Severidades:**
- `baja` - Informativa
- `media` - Atención requerida
- `alta` - Acción urgente
- `critica` - Acción inmediata

## 🛠️ Desarrollo Local

### Requisitos
- Node.js 18+
- PostgreSQL 15 con PostGIS
- Redis 7

### Setup

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar .env**
   ```bash
   cp .env.example .env
   # Editar valores según necesidad
   ```

3. **Iniciar desarrollo**
   ```bash
   npm run start:dev
   ```

4. **Verificar**
   ```bash
   curl http://localhost:3000
   ```

### Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Tests
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage
npm run test:e2e          # E2E tests

# Linting
npm run lint              # ESLint check
npm run format            # Prettier format
```

## 🧪 Testing

### Ejemplo de Test de Servicio
```typescript
// actas.service.spec.ts
import { Test } from '@nestjs/testing';
import { ActasService } from './actas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Acta } from './entities/acta.entity';

describe('ActasService', () => {
  let service: ActasService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ActasService,
        {
          provide: getRepositoryToken(Acta),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ActasService>(ActasService);
  });

  it('should create an acta', async () => {
    // Test implementation
  });
});
```

### Ejemplo de Test E2E
```typescript
// actas.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ActasController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/v1/actas (POST)', () => {
    return request(app.getHttpServer())
      .post('/v1/actas')
      .send({
        campaign_id: 'uuid',
        mesa_id: 'uuid',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 🔌 WebSocket Client Examples

### JavaScript/TypeScript
```typescript
import { io } from 'socket.io-client';

// Conectar a namespace de actas
const socket = io('http://localhost:3000/actas', {
  transports: ['websocket'],
});

// Unirse a campaña
socket.emit('join-campaign', { campaignId: 'uuid' });

// Escuchar eventos
socket.on('acta:nueva', (acta) => {
  console.log('Nueva acta:', acta);
});

socket.on('acta:validada', (acta) => {
  console.log('Acta validada:', acta);
});
```

### React Hook
```typescript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useActasSocket(campaignId: string) {
  const [actas, setActas] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3000/actas');

    socket.emit('join-campaign', { campaignId });

    socket.on('acta:nueva', (acta) => {
      setActas(prev => [acta, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [campaignId]);

  return { actas };
}
```

## 📁 Estructura de Archivos

```
src/
├── actas/
│   ├── dto/
│   │   ├── create-acta.dto.ts
│   │   ├── update-acta.dto.ts
│   │   └── query-actas.dto.ts
│   ├── entities/
│   │   └── acta.entity.ts
│   ├── processors/
│   │   └── acta.processor.ts
│   ├── actas.controller.ts
│   ├── actas.service.ts
│   ├── actas.gateway.ts
│   └── actas.module.ts
├── testigos/
│   ├── dto/
│   ├── entities/
│   ├── testigos.controller.ts
│   ├── testigos.service.ts
│   ├── testigos.gateway.ts
│   └── testigos.module.ts
├── conteo/
│   ├── entities/
│   ├── conteo.controller.ts
│   ├── conteo.service.ts
│   ├── conteo.gateway.ts
│   └── conteo.module.ts
├── alertas/
│   ├── dto/
│   ├── entities/
│   ├── alertas.controller.ts
│   ├── alertas.service.ts
│   ├── alertas.gateway.ts
│   └── alertas.module.ts
├── app.module.ts
└── main.ts
```

## 🚀 Deployment

### Docker
```bash
# Build
docker build -t backend-diad:latest .

# Run
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  backend-diad:latest
```

### Docker Compose
```bash
docker-compose up -d backend-diad
```

## 📊 Performance

- **Latencia objetivo:** < 300ms p95
- **WebSocket concurrentes:** 10,000+ conexiones
- **Throughput:** 1,000+ req/s
- **Queue processing:** < 2s por acta OCR

## 🔒 Seguridad

- [ ] Implementar JWT authentication
- [ ] Rate limiting por IP
- [ ] Input validation (class-validator)
- [ ] SQL injection prevention (TypeORM)
- [ ] CORS configurado
- [ ] Helmet headers
- [ ] Sanitización de uploads

## 📝 TODO

- [ ] Implementar AWS Textract OCR real
- [ ] Agregar autenticación JWT
- [ ] Tests unitarios completos
- [ ] Tests E2E completos
- [ ] Documentación OpenAPI/Swagger
- [ ] Logging estructurado (Winston)
- [ ] Métricas (Prometheus)
- [ ] Health checks detallados

---

**Última actualización:** Diciembre 14, 2024
