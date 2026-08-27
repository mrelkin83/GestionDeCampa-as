# App Móvil Nativa - Testigos Electorales

## React Native con Expo

Aplicación nativa para Android e iOS desarrollada con React Native y Expo.

### 🚀 Características Nativas

- ✅ **Android & iOS** - Apps nativas para ambas plataformas
- ✅ **Offline completo** - SQLite local
- ✅ **Cámara nativa** - Captura de evidencias
- ✅ **GPS y Mapas** - Ubicación de mesas
- ✅ **Notificaciones Push** - Alertas en tiempo real
- ✅ **Background Sync** - Sincronización automática
- ✅ **Diseño nativo** - UI/UX adaptada a cada plataforma

### 📱 Tecnologías

- **React Native 0.73**
- **Expo SDK 50**
- **TypeScript**
- **Redux Toolkit** - State management
- **React Native Paper** - UI components
- **React Navigation** - Navegación
- **Expo Modules** - Plugins nativos

### 🔧 Requisitos

- Node.js 18+
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS, solo Mac)
- EAS CLI (para builds en la nube)

### 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar en desarrollo
npm start        # Expo development server
npm run android  # Android emulator
npm run ios      # iOS simulator (solo Mac)
```

### 🏗️ Builds

#### Desarrollo
```bash
# Android APK de desarrollo
npx eas build --profile development --platform android

# iOS (requiere cuenta Apple Developer)
npx eas build --profile development --platform ios
```

#### Producción
```bash
# Android App Bundle (para Play Store)
npx eas build --profile production --platform android

# iOS (para App Store)
npx eas build --profile production --platform ios
```

#### Subir a tiendas
```bash
# Android Play Store
npx eas submit --platform android

# iOS App Store
npx eas submit --platform ios
```

### 📱 Funcionalidades Nativas

#### Cámara
```typescript
import { Camera } from 'expo-camera';

// Captura de evidencias
const takePicture = async () => {
  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.8,
    base64: true,
  });
  // Guardar evidencia
};
```

#### GPS y Ubicación
```typescript
import * as Location from 'expo-location';

// Obtener ubicación
const { coords } = await Location.getCurrentPositionAsync({});
// coords.latitude, coords.longitude
```

#### Notificaciones Push
```typescript
import * as Notifications from 'expo-notifications';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Enviar notificación local
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Acta sincronizada',
    body: 'Los datos se enviaron correctamente',
  },
  trigger: null,
});
```

#### Background Sync
```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

// Registrar tarea de sincronización
TaskManager.defineTask('SYNC_ACTAS', async () => {
  // Sincronizar actas pendientes
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Programar cada 15 minutos
BackgroundFetch.registerTaskAsync('SYNC_ACTAS', {
  minimumInterval: 15 * 60, // 15 minutos
});
```

### 🗄️ SQLite Offline

```typescript
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('preconteo.db');

// Crear tablas
db.transaction(tx => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS actas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      local_id TEXT,
      mesa_id INTEGER,
      votos TEXT,
      estado TEXT
    )`
  );
});
```

### 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Linting
npm run lint
```

### 📲 Distribución

#### Android (Play Store)
1. Generar AAB (Android App Bundle)
2. Subir a Google Play Console
3. Configurar firma
4. Publicar en producción

#### iOS (App Store)
1. Generar IPA con EAS
2. Subir a App Store Connect
3. Configurar certificados
4. Enviar para revisión

### 📋 Checklist Pre-Release

- [ ] Tests pasando
- [ ] Iconos y splash screens
- [ ] Permisos configurados
- [ ] Variables de entorno
- [ ] Analytics configurado
- [ ] Crash reporting
- [ ] Versión actualizada
- [ ] Changelog actualizado

### 🆘 Troubleshooting

**Problema: Error en build de iOS**
```bash
# Limpiar caché
npx expo prebuild --clean
npx eas build --platform ios
```

**Problema: App no sincroniza en background**
- Verificar permisos de batería (Android)
- Configurar Background Fetch correctamente
- Revisar logs en dispositivo

### 📄 Licencia

Proyecto privado - Plataforma Electoral Colombia © 2027

---

**Versión:** 1.0.0  
**Expo SDK:** 50  
**React Native:** 0.73
