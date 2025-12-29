# 🗳️ Plataforma Electoral Colombia

**Sistema completo de gestión de campañas electorales para Colombia**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev)

---

## 🎯 Descripción

Plataforma Electoral Colombia es un sistema completo de gestión de campañas electorales diseñado para las elecciones territoriales de Colombia.

### Características Principales

✅ **CRM de Votantes** - Base de datos con scoring político
✅ **Comunicación Masiva** - SMS, Email, WhatsApp
✅ **Eventos** - Check-in QR + Geolocalización  
✅ **Donaciones** - Compliance CNE automático
✅ **Gastos** - Control presupuestario
✅ **Segmentación** - Filtros dinámicos avanzados
✅ **Analytics** - Dashboard en tiempo real

---

## 🚀 Quick Start

```bash
# 1. Setup automático
./scripts/setup.sh

# 2. Iniciar servicios
docker-compose up -d
cd backend-core && php artisan serve &
cd frontend-web && npm run dev &
cd backend-core && php artisan queue:work &

# 3. Acceder
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
```

---

## 📂 Estructura del Proyecto

```
plataforma-electoral/
├── backend-core/     # Laravel 11 - API REST
├── frontend-web/     # React 19 + Vite
├── backend-diad/     # NestJS - Día D (futuro)
├── pwa-testigos/     # PWA Testigos (futuro)  
├── docs/             # Documentación completa
└── scripts/          # Setup & Deploy scripts
```

---

## 🛠️ Stack Tecnológico

**Backend:** Laravel 11, PostgreSQL 15 + PostGIS, Redis, Twilio, AWS SES, WhatsApp API

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS

**Infra:** Docker, AWS (RDS, EC2, S3), Nginx, Supervisor

---

## 📖 Documentación

- [API Documentation](docs/API-DOCUMENTATION.md) - 72 endpoints
- [Integraciones](docs/INTEGRACIONES-COMUNICACION.md) - Twilio, SES, WhatsApp
- [Deployment](docs/DEPLOYMENT-GUIDE.md) - Guía completa
- [Arquitectura](docs/ARQUITECTURA-DISEÑO.md) - Diseño del sistema

---

## ⚙️ Configuración

Ver `.env.example` en `backend-core/` y `frontend-web/`

Servicios requeridos:
- Twilio (SMS)
- AWS SES (Email)  
- WhatsApp Business API

---

## 🧪 Testing

```bash
# Backend
cd backend-core && ./vendor/bin/phpunit

# Frontend  
cd frontend-web && npm run test

# Integraciones
cd backend-core && php artisan test:integrations

# Todo
./scripts/test.sh
```

---

## 🚢 Deployment

```bash
./scripts/deploy.sh production master
```

Ver `docs/DEPLOYMENT-GUIDE.md` para más detalles.

---

## 📊 Estado del Proyecto

**MVP:** 80% Completo ✅  
**Backend Core:** 50% (API funcional)  
**Frontend Web:** 40% (UI completa)  
**Integraciones:** 100% (Twilio, SES, WhatsApp) ✅

**Próximo hito:** Deployment AWS - Marzo 2026

---

## 👥 Usuarios Iniciales

| Email | Password | Rol |
|-------|----------|-----|
| admin@plataforma.com | admin123 | Super Admin |
| coordinador@plataforma.com | coord123 | Coordinador |

⚠️ **Cambiar contraseñas en producción**

---

## 📝 Licencia

Copyright © 2025 Plataforma Electoral Colombia. Propietario.

---

**Desarrollado con ❤️ para Colombia** 🇨🇴

**Versión:** 1.0.0  
**Última actualización:** 28 Diciembre 2025
