# 🚀 Quick Start - Plataforma Electoral Colombia

Guía rápida para levantar el proyecto en tu máquina local.

---

## ⚡ Inicio Rápido (5 minutos)

### Prerrequisitos

- **Docker** y **Docker Compose** instalados
- **Git** instalado
- Al menos **4GB RAM** disponible

### Paso 1: Clonar el repositorio

```bash
git clone <repository-url>
cd Gestion\ de\ Campañas
```

### Paso 2: Levantar servicios con Docker

```bash
docker-compose up -d
```

Esto levantará:
- PostgreSQL 15 + PostGIS (puerto 5432)
- Redis 7 (puerto 6379)
- Backend Core Laravel (puerto 8000)
- Backend Día D NestJS (puerto 3001)

### Paso 3: Instalar dependencias del Backend Core

```bash
# Entrar al contenedor
docker-compose exec backend-core bash

# Dentro del contenedor
composer install
cp .env.example .env
php artisan key:generate
```

### Paso 4: Ejecutar migrations y seeders

```bash
# Dentro del contenedor backend-core
php artisan migrate:fresh --seed
```

Esto creará:
- ✅ Todas las tablas de la base de datos
- ✅ 6 roles con permisos
- ✅ 33 departamentos de Colombia
- ✅ ~50 municipios principales
- ✅ 5 usuarios de ejemplo

### Paso 5: Verificar instalación

```bash
# Health check del API
curl http://localhost:8000/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Plataforma Electoral Colombia - Backend Core API",
  "version": "1.0.0"
}
```

---

## 👤 Usuarios de Prueba

Después de correr los seeders, tendrás estos usuarios disponibles:

| Email | Password | Rol |
|-------|----------|-----|
| admin@plataforma.com | Admin2024! | Super Admin |
| director@campana.com | Director2024! | Admin Campaña |
| coordinador@campana.com | Coordinador2024! | Coordinador |
| operador@campana.com | Operador2024! | Operador Call Center |
| testigo@campana.com | Testigo2024! | Testigo |

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción.

---

## 🔑 Hacer Login

### Via API (Postman/Insomnia)

**POST** `http://localhost:8000/api/auth/login`

```json
{
  "email": "admin@plataforma.com",
  "password": "Admin2024!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@plataforma.com",
      "full_name": "Super Administrador",
      "role": "super_admin",
      "role_display_name": "Super Administrador"
    },
    "token": "1|abc123..."
  }
}
```

### Usar el token en requests

Agregar header en todas las peticiones autenticadas:
```
Authorization: Bearer 1|abc123...
```

---

## 📡 Endpoints Disponibles

### Públicos
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro (solo admin)

### Autenticados (requieren token)
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Logout
- `GET /api/electoral/departamentos` - Listar departamentos
- `GET /api/electoral/municipios` - Listar municipios
- `GET /api/electoral/puestos` - Listar puestos de votación
- `GET /api/campanas` - Listar campañas
- `POST /api/campanas` - Crear campaña

Ver documentación completa en: `docs/api/backend-core.md`

---

## 🗄️ Acceder a la Base de Datos

### Vía Docker

```bash
docker-compose exec postgres psql -U postgres -d electoral_platform
```

### Vía herramienta GUI

- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Password**: postgres_secret_2024
- **Base de datos**: electoral_platform

Recomendados: DBeaver, pgAdmin, TablePlus

---

## 🛠️ Comandos Útiles

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend-core
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Detener todo
```bash
docker-compose down
```

### Limpiar todo (⚠️ borra datos)
```bash
docker-compose down -v
```

### Ejecutar comandos Artisan
```bash
docker-compose exec backend-core php artisan [comando]
```

### Ejecutar tests
```bash
docker-compose exec backend-core php artisan test
```

---

## 🔧 Troubleshooting

### Error: "Connection refused" en PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Error: "Class not found"

```bash
# Regenerar autoload
docker-compose exec backend-core composer dump-autoload
```

### Error: Migrations ya existen

```bash
# Borrar y recrear todo
docker-compose exec backend-core php artisan migrate:fresh --seed
```

### Puerto 8000 ya en uso

Editar `docker-compose.yml`:
```yaml
backend-core:
  ports:
    - "8001:8000"  # Cambiar puerto externo
```

---

## 📚 Próximos Pasos

1. **Revisar documentación completa**
   - `README.md` - Resumen ejecutivo
   - `docs/` - Documentación técnica completa
   - `PROXIMOS-PASOS.md` - Plan de acción

2. **Importar datos completos**
   - 1102 municipios de Colombia (CSV)
   - Censo electoral de prueba
   - Crear campaña de ejemplo

3. **Desarrollar Frontend**
   - Setup Vite + Tailwind
   - Login UI
   - Dashboard principal

4. **Testing**
   - Tests unitarios
   - Tests de integración
   - Tests E2E

---

## 🆘 Ayuda

- **Issues**: [GitHub Issues](https://github.com/tu-repo/issues)
- **Documentación**: Ver carpeta `docs/`
- **Email**: soporte@plataforma.com

---

**Última actualización**: Diciembre 23, 2024
