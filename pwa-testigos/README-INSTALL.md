# PWA Testigos - Guía de Instalación y Uso

## Descripción

Aplicación PWA para testigos electorales que permite registrar actas de escrutinio de forma offline, con sincronización automática cuando se recupera la conexión a internet.

## Características

- ✅ Funciona 100% offline
- ✅ Captura de evidencias fotográficas
- ✅ Sincronización automática
- ✅ Autenticación offline
- ✅ Diseño mobile-first
- ✅ PWA instalable

## Requisitos

### Para Desarrollo
- Node.js 18+
- npm o yarn
- Android Studio (para build Android)
- Git

### Para Uso
- Navegador moderno con soporte PWA
- O dispositivo Android 8.0+
- Cámara (para evidencias)

## Instalación

### 1. Clonar repositorio
```bash
git clone <repo-url>
cd pwa-testigos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=https://api.tudominio.com
VITE_WS_URL=wss://ws.tudominio.com
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5174`

## Build para Producción

### Build Web (PWA)
```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

### Build Android (APK)

#### Primera vez:
```bash
# Instalar Capacitor CLI globalmente
npm install -g @capacitor/cli

# Crear proyecto Android
npx cap add android

# Copiar archivos web a Android
npx cap sync

# Abrir en Android Studio
npx cap open android
```

#### Actualizaciones:
```bash
# Después de cambios en código web
npm run build
npx cap sync

# Luego abrir Android Studio y generar APK
npx cap open android
```

#### Generar APK firmada:
1. En Android Studio: Build → Generate Signed Bundle / APK
2. Seleccionar APK
3. Crear o seleccionar keystore
4. Generar release APK

## Uso de la Aplicación

### Primera vez

1. **Instalar PWA** (opcional pero recomendado):
   - En Chrome/Edge: Menú → Instalar aplicación
   - En Safari: Compartir → Agregar a pantalla de inicio

2. **Iniciar sesión**:
   - Conectarse a internet (primera vez obligatorio)
   - Ingresar email y contraseña
   - La sesión se guarda para uso offline

3. **Descargar datos**:
   - La app descarga automáticamente elecciones y candidatos

### Uso normal

1. **Registrar Acta**:
   - Ir a "Registrar Acta"
   - Seleccionar mesa
   - Ingresar votos por candidato
   - Tomar fotos del acta
   - Guardar

2. **Sincronizar**:
   - Las actas se guardan localmente
   - Cuando hay conexión, se sincronizan automáticamente
   - O ir a "Pendientes" y sincronizar manualmente

3. **Ver Pendientes**:
   - Lista de actas no sincronizadas
   - Sincronizar individual o todas

## Estructura de Datos

### IndexedDB Stores

- **usuarios**: Datos de autenticación
- **actas_pendientes**: Cola de actas para envío
- **evidencias**: Fotos en base64
- **cache**: Datos descargados del servidor
- **sync_log**: Historial de sincronizaciones

### Estados de Acta

- `PENDIENTE`: Lista para sincronizar
- `ENVIANDO`: En proceso de envío
- `ENVIADO`: Sincronizada exitosamente
- `ERROR`: Falló el envío, reintentará

## Testing

### Tests E2E con Cypress
```bash
# Modo interactivo
npm run test:e2e

# Modo headless
npm run test:e2e:ci
```

### Tests Unitarios
```bash
npm run test:unit
```

### Cobertura
```bash
npm run test:coverage
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build producción |
| `npm run preview` | Preview build |
| `npm run test:e2e` | Tests E2E Cypress |
| `npm run test:unit` | Tests unitarios |
| `npm run lint` | Linting |
| `npx cap sync` | Sync con Capacitor |
| `npx cap open android` | Abrir Android Studio |

## Solución de Problemas

### La app no funciona offline
1. Verificar que Service Worker esté registrado
2. Revisar consola por errores
3. Limpiar cache del navegador

### No se pueden tomar fotos
1. Verificar permisos de cámara
2. En Android: Configuración → Apps → Permisos → Cámara
3. Recargar la aplicación

### Sincronización falla
1. Verificar conexión a internet
2. Revisar logs en página "Pendientes"
3. Reintentar sincronización
4. Si persiste, contactar soporte

### Error de autenticación offline
1. Se requiere login online al menos una vez
2. Verificar que el token no haya expirado
3. Hacer login con conexión para renovar token

## Soporte

- Email: soporte@plataformaelectoral.com
- Documentación: [docs link]
- Reportar issues: [github issues]

## Licencia

Proyecto privado - Plataforma Electoral Colombia © 2027

## Changelog

### v1.0.0 (2026-07-08)
- ✅ Lanzamiento inicial
- ✅ Registro de actas offline
- ✅ Sincronización automática
- ✅ Captura de evidencias
- ✅ Autenticación offline
- ✅ PWA instalable
