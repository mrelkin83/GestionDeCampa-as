# Backend Día D - Plataforma Electoral Colombia

Backend de tiempo real para el día de elecciones, construido con NestJS.

## Características

- **WebSocket Real-Time**: Actualización en vivo de conteo de votos
- **OCR con AWS Textract**: Procesamiento automático de actas
- **Bull Queues**: Procesamiento asíncrono de tareas
- **TypeORM**: ORM para PostgreSQL
- **Redis**: Cache y mensajería

## Stack Tecnológico

- Node.js 20
- NestJS 10
- TypeORM 0.3
- Socket.io 4
- Bull (Redis Queues)
- AWS SDK (S3, Textract)

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar configuración
nano .env
```

## Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Modo debug
npm run start:debug

# Build de producción
npm run build

# Ejecutar producción
npm run start:prod
```

## Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

## Estructura del Proyecto

```
backend-diad/
├── src/
│   ├── modules/           # Módulos de funcionalidad
│   │   ├── actas/         # Gestión de actas
│   │   ├── conteo/        # Conteo en tiempo real
│   │   ├── alertas/       # Sistema de alertas
│   │   └── testigos/      # Gestión de testigos
│   ├── common/            # Código compartido
│   │   ├── decorators/    # Decoradores personalizados
│   │   ├── filters/       # Filtros de excepción
│   │   ├── guards/        # Guards de autenticación
│   │   ├── interceptors/  # Interceptores
│   │   └── pipes/         # Pipes de validación
│   ├── config/            # Configuración
│   ├── app.module.ts      # Módulo principal
│   └── main.ts            # Punto de entrada
├── test/                  # Tests e2e
├── docker-compose.yml     # Desarrollo local
└── Dockerfile             # Imagen Docker
```

## Endpoints Principales

### Health Check
```
GET /health
```

### Actas
```
POST /v1/actas/upload      # Subir acta (imagen)
GET  /v1/actas/:id         # Obtener acta
GET  /v1/actas/mesa/:id    # Actas por mesa
```

### Conteo Real-Time
```
WebSocket: /conteo
Events:
  - conteo:actualizado
  - conteo:mesa
  - conteo:departamento
```

### Alertas
```
GET  /v1/alertas           # Listar alertas
POST /v1/alertas           # Crear alerta
PUT  /v1/alertas/:id       # Actualizar alerta
```

## Variables de Entorno

Ver `.env.example` para la configuración completa.

### Principales
- `NODE_ENV`: development | production
- `PORT`: Puerto del servidor (default: 3000)
- `DB_HOST`: Host de PostgreSQL
- `DB_SCHEMA`: Schema de base de datos (diad)
- `REDIS_HOST`: Host de Redis
- `AWS_REGION`: Región de AWS
- `AWS_S3_BUCKET_ACTAS`: Bucket para actas

## Docker

```bash
# Build de imagen
docker build -t backend-diad .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env backend-diad

# Con docker-compose (recomendado)
docker-compose up backend-diad
```

## Arquitectura

### Módulos Principales

1. **ActasModule**: Gestión de actas electorales
   - Upload a S3
   - OCR con Textract
   - Validación y almacenamiento

2. **ConteoModule**: Conteo en tiempo real
   - WebSocket para actualizaciones
   - Agregación de resultados
   - Publicación a Redis

3. **AlertasModule**: Sistema de alertas
   - Detección de anomalías
   - Notificaciones en tiempo real
   - Escalamiento automático

4. **TestigosModule**: Gestión de testigos
   - Asignación a mesas
   - Tracking de actividad
   - Coordinación

### Bull Queues

- `ocr-processing`: Procesamiento OCR de actas
- `conteo-aggregation`: Agregación de conteos
- `notifications`: Envío de notificaciones

## Seguridad

- Validación con class-validator
- Guards de autenticación (JWT)
- Rate limiting
- CORS configurado
- Sanitización de inputs

## Monitoreo

- Health check endpoint: `/health`
- Logs estructurados (Winston)
- Métricas de performance
- Alertas automáticas

## Licencia

UNLICENSED - Uso privado
