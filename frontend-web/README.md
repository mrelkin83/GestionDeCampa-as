# Frontend Web - Plataforma Electoral Colombia

Frontend web construido con Vite, React, TypeScript y Tailwind CSS.

## Tecnologías

- **Vite** - Build tool ultra rápido
- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos

## Desarrollo Local

### Prerequisitos

- Node.js 20+
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Estructura de Carpetas

```
src/
├── components/         # Componentes reutilizables
│   ├── layout/        # Componentes de layout (Navbar, Sidebar, Footer)
│   └── ProtectedRoute.tsx
├── contexts/          # React Contexts (Auth, etc)
├── lib/              # Utilidades y configuración
│   ├── api.ts        # Cliente Axios y endpoints API
│   └── utils.ts      # Funciones helper
├── pages/            # Páginas/Vistas
│   ├── auth/         # Login, Register
│   └── Dashboard.tsx
├── App.tsx           # Componente principal
├── main.tsx          # Entry point
└── index.css         # Estilos globales + Tailwind
```

## Variables de Entorno

Crear archivo `.env` en la raíz con:

```env
VITE_API_URL=http://localhost:8000/api
```

## Build para Producción

```bash
# Build
npm run build

# Los archivos estarán en /dist
```

## Docker

### Desarrollo

```bash
# Usar docker-compose desde la raíz del proyecto
docker-compose up frontend-web
```

### Producción

```bash
# Build imagen de producción
docker build -t electoral-frontend:latest .

# Run contenedor
docker run -p 80:80 electoral-frontend:latest
```

## Conectar con Backend

El frontend se conecta al backend Laravel a través de la variable `VITE_API_URL`.

En desarrollo local:
- Backend: `http://localhost:8000/api`
- Frontend: `http://localhost:5173`

Con Docker:
- El proxy de Nginx maneja las peticiones `/api` automáticamente

## Autenticación

El sistema usa JWT tokens almacenados en `localStorage`:
- Token: `auth_token`
- Usuario: `user`

Las rutas protegidas verifican automáticamente la autenticación.

## Características Implementadas

- ✅ Layout responsivo con Navbar y Sidebar
- ✅ Sistema de autenticación (Login/Register)
- ✅ Rutas protegidas
- ✅ Dashboard con estadísticas
- ✅ Integración con API Laravel
- ✅ Manejo de errores y loading states
- ✅ Dark mode compatible
- ✅ Mobile-first design

## Próximas Características

- [ ] Módulo de Votantes (CRUD completo)
- [ ] Módulo de Eventos
- [ ] Módulo de Comunicación
- [ ] Módulo de Finanzas
- [ ] Mapa Electoral interactivo
- [ ] Reportes y Analytics
- [ ] Notificaciones en tiempo real
- [ ] Multi-idioma (i18n)

## Licencia

Propietario - Plataforma Electoral Colombia 2025
