# 🚀 Instrucciones de Setup - Plataforma Electoral

## Prerrequisitos

### 1. Instalar Docker Desktop
- **Windows:** https://docs.docker.com/desktop/install/windows-install/
- **Requisitos mínimos:**
  - Windows 10 64-bit: Pro, Enterprise o Education (Build 19041+)
  - WSL 2 habilitado
  - 8GB RAM (recomendado 16GB)
  - 20GB espacio en disco

### 2. Verificar Instalación
```bash
docker --version
# Debe mostrar: Docker version 24.x.x o superior

docker-compose --version
# Debe mostrar: Docker Compose version v2.x.x o superior
```

## 🎯 Inicio Rápido (5 minutos)

### Paso 1: Iniciar Servicios Base
```bash
cd "C:\Gestion de Campañas"

# Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis
```

Esperar ~30 segundos para que PostgreSQL inicialice los schemas.

### Paso 2: Verificar Servicios
```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Deberías ver:
# ✅ Schemas creados: electoral, crm, compliance, diad, communication, analytics
# ✅ 6 roles insertados

# Ver logs de Redis
docker-compose logs redis

# Verificar estado
docker-compose ps
```

### Paso 3: Instalar Dependencias Backend Día D
```bash
cd backend-diad
npm install
```

### Paso 4: Iniciar Backend Día D
```bash
# Opción A: Con Docker
docker-compose up -d backend-diad

# Opción B: Local (requiere Node.js 18+)
cd backend-diad
npm run start:dev
```

### Paso 5: Verificar Backend Día D
```bash
# Health check
curl http://localhost:3000/v1/health

# O abrir en navegador:
# http://localhost:3000
```

## 📊 Servicios Disponibles

| Servicio | URL | Estado |
|----------|-----|--------|
| **Backend Día D (NestJS)** | http://localhost:3000 | ⏳ Requiere npm install |
| **Backend Core (Laravel)** | http://localhost:8000 | ⏳ Requiere composer install |
| **Frontend Web** | http://localhost:5173 | ⏳ Próximo sprint |
| **PWA Testigos** | http://localhost:5174 | ⏳ Próximo sprint |
| **PostgreSQL** | localhost:5432 | ✅ Listo |
| **Redis** | localhost:6379 | ✅ Listo |
| **PgAdmin** | http://localhost:5050 | ✅ Listo |
| **Redis Commander** | http://localhost:8081 | ✅ Listo |
| **MailHog** | http://localhost:8025 | ✅ Listo |

## 🗄️ Acceso a Base de Datos

### Desde Docker
```bash
docker-compose exec postgres psql -U postgres -d electoral_platform
```

### Desde Cliente Local
```bash
psql -h localhost -p 5432 -U postgres -d electoral_platform
# Password: secret
```

### Desde PgAdmin
1. Abrir: http://localhost:5050
2. Login: `admin@electoral.local` / `admin`
3. Agregar servidor:
   - Host: `postgres`
   - Port: `5432`
   - Database: `electoral_platform`
   - Username: `postgres`
   - Password: `secret`

## 🔧 Comandos Útiles

### Docker
```bash
# Ver todos los servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend-diad

# Reiniciar un servicio
docker-compose restart postgres

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ ELIMINA DATOS)
docker-compose down -v

# Reconstruir un servicio
docker-compose build backend-diad
docker-compose up -d backend-diad
```

### Backend Día D (NestJS)
```bash
cd backend-diad

# Desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Tests
npm run test
npm run test:watch
npm run test:cov

# Linting
npm run lint
```

## 🐛 Troubleshooting

### PostgreSQL no inicia
```bash
# Ver logs detallados
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres

# Si persiste, eliminar volumen y recrear
docker-compose down -v
docker-compose up -d postgres
```

### Puerto ya en uso
```bash
# Windows: Ver qué proceso usa el puerto 5432
netstat -ano | findstr :5432

# Cambiar puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar puerto 5433 en host
```

### Backend Día D no inicia
```bash
# Verificar que .env existe
ls -la backend-diad/.env

# Verificar node_modules
cd backend-diad
rm -rf node_modules
npm install

# Verificar conexión a PostgreSQL
docker-compose exec postgres psql -U postgres -c "\dn"
```

### Sin conexión entre servicios
```bash
# Verificar red Docker
docker network ls
docker network inspect gestion-de-campañas_electoral_network

# Recrear red
docker-compose down
docker network prune
docker-compose up -d
```

## ✅ Checklist de Verificación

Después del setup, verifica:

- [ ] Docker Desktop corriendo
- [ ] `docker-compose ps` muestra postgres y redis como "Up"
- [ ] PgAdmin accesible en http://localhost:5050
- [ ] Schemas verificados: `\dn` muestra 6 schemas
- [ ] Redis accesible: `redis-cli -h localhost ping` → PONG
- [ ] Backend Día D: http://localhost:3000 responde
- [ ] 6 roles en DB: `SELECT * FROM roles;`

## 🎯 Próximos Pasos

Una vez verificado el setup:

1. **Instalar Backend Core (Laravel)**
   ```bash
   cd backend-core
   composer install
   php artisan key:generate
   php artisan migrate
   ```

2. **Crear primer usuario**
   ```bash
   php artisan tinker
   >>> User::factory()->create(['email' => 'admin@test.com'])
   ```

3. **Probar APIs**
   - Backend Core: http://localhost:8000/api/v1/health
   - Backend Día D: http://localhost:3000/v1/health

## 📚 Recursos Adicionales

- **Arquitectura:** `docs/arquitectura/00-arquitectura-general.md`
- **Base de Datos:** `docs/database/schema.md`
- **APIs Backend Core:** `docs/api/backend-core.md`
- **APIs Backend Día D:** `docs/api/backend-diad.md`
- **Roadmap:** `docs/plan-desarrollo/roadmap-semanal-detallado.md`

## ⚠️ Notas Importantes

1. **Seguridad:** Los passwords por defecto son para desarrollo. Cambiarlos en producción.
2. **Volúmenes:** Los datos persisten en volúmenes Docker. Usar `docker-compose down -v` solo si quieres eliminar todos los datos.
3. **Logs:** Revisar siempre los logs con `docker-compose logs -f` si algo falla.
4. **Performance:** Backend Día D puede tardar ~30 segundos en iniciar la primera vez (compila TypeScript).

---

**Última actualización:** Diciembre 14, 2024
