# 🚀 GUÍA DE INICIO RÁPIDO

## ⚡ Inicio en 5 Minutos

### Requisitos
- **Docker Desktop** instalado y corriendo
- **Git** instalado
- Mínimo 8GB RAM disponible
- 20GB espacio en disco

### Paso 1: Verificar Docker
```bash
docker --version
docker-compose --version
```

### Paso 2: Iniciar Servicios
```bash
cd "C:\Gestion de Campañas"
docker-compose up -d postgres redis
```

Esperar ~30 segundos para que PostgreSQL inicialice.

### Paso 3: Verificar Base de Datos
```bash
docker-compose logs postgres
```

Deberías ver:
```
✅ Base de datos electoral_platform inicializada correctamente
✅ Schemas creados: electoral, crm, compliance, diad, communication, analytics
```

### Paso 4: Acceder a PgAdmin (Opcional)
1. Abrir: http://localhost:5050
2. Login: `admin@electoral.local` / `admin`
3. Conectar a servidor:
   - Host: `postgres`
   - Port: `5432`
   - Database: `electoral_platform`
   - Username: `postgres`
   - Password: `secret`

## 📊 Servicios Disponibles

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Backend Core (Laravel)** | http://localhost:8000 | - |
| **Backend Día D (NestJS)** | http://localhost:3000 | - |
| **Frontend Web** | http://localhost:5173 | - |
| **PWA Testigos** | http://localhost:5174 | - |
| **PgAdmin** | http://localhost:5050 | admin@electoral.local / admin |
| **Redis Commander** | http://localhost:8081 | - |
| **MailHog** | http://localhost:8025 | - |

## 🗄️ Conexión Directa a PostgreSQL

```bash
# Desde Docker
docker-compose exec postgres psql -U postgres -d electoral_platform

# O desde cliente local
psql -h localhost -p 5432 -U postgres -d electoral_platform
```

Contraseña: `secret`

### Queries Útiles
```sql
-- Ver schemas
\dn

-- Ver tablas en schema electoral
\dt electoral.*

-- Ver usuarios creados
SELECT * FROM public.users;

-- Ver roles
SELECT * FROM public.roles;
```

## 🔧 Comandos Docker Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver solo logs de un servicio
docker-compose logs -f postgres
docker-compose logs -f backend-core

# Reiniciar un servicio
docker-compose restart postgres

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ ELIMINA DATOS)
docker-compose down -v

# Ver estado de servicios
docker-compose ps
```

## 📝 Próximos Pasos

### Opción A: Desarrollo con Claude Code
Claude Code continuará el desarrollo automáticamente siguiendo el roadmap.

### Opción B: Desarrollo Manual

#### 1. Setup Laravel
```bash
cd backend-core
composer create-project laravel/laravel:^11.0 .
cp .env.example .env
php artisan key:generate
```

Editar `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=electoral_platform
DB_USERNAME=postgres
DB_PASSWORD=secret
```

#### 2. Setup NestJS
```bash
cd backend-diad
npm i -g @nestjs/cli
nest new . --skip-git
npm install @nestjs/typeorm typeorm pg redis socket.io
```

#### 3. Setup Frontend
```bash
cd frontend-web
npm create vite@latest . -- --template vanilla
npm install -D tailwindcss postcss autoprefixer alpinejs
npx tailwindcss init -p
```

## 🐛 Troubleshooting

### PostgreSQL no inicia
```bash
# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres

# Si persiste, eliminar volumen y recrear
docker-compose down -v
docker-compose up -d postgres
```

### Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :5432

# Cambiar puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar puerto 5433 en host
```

### Sin conexión a red Docker
```bash
# Recrear red
docker-compose down
docker network prune
docker-compose up -d
```

## 📚 Documentación Adicional

- **Arquitectura:** `docs/arquitectura/00-arquitectura-general.md`
- **Base de Datos:** `docs/database/schema.md`
- **APIs:** `docs/api/`
- **Roadmap:** `docs/plan-desarrollo/roadmap-semanal-detallado.md`

## ✅ Checklist Primera Vez

- [ ] Docker Desktop corriendo
- [ ] `docker-compose up -d postgres redis` ejecutado
- [ ] PgAdmin abierto y conectado
- [ ] Schemas verificados en base de datos
- [ ] 6 roles insertados verificados
- [ ] Listo para comenzar desarrollo

---

**¿Problemas?** Revisar logs con `docker-compose logs -f`

**Última actualización:** Diciembre 14, 2024
