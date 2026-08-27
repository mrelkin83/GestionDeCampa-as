# E2E Testing con Detox

Esta carpeta contiene los tests end-to-end (E2E) para la aplicación móvil usando Detox.

## 📋 Requisitos

### Instalación

```bash
# Instalar Detox CLI globalmente
npm install -g detox-cli

# En la carpeta del proyecto
npm install -D detox
```

### Dependencias del Sistema

**macOS (iOS):**
```bash
# Xcode ya debe estar instalado
# Simuladores de iOS disponibles
```

**Android:**
```bash
# Android SDK configurado
# Emulador creado (recomendado: Pixel_7_API_34)

# Crear emulador si no existe
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64"
```

## 🚀 Configuración

El archivo `.detoxrc.js` en la raíz del proyecto contiene la configuración:

```javascript
module.exports = {
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Preconteo.app',
      build: 'xcodebuild -workspace ios/Preconteo.xcworkspace -scheme Preconteo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' }
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' }
    }
  }
};
```

## 🧪 Ejecutar Tests

### Build

```bash
# iOS
npm run build:e2e:ios
# o
detox build --configuration ios.sim.debug

# Android
npm run build:e2e:android
# o
detox build --configuration android.emu.debug
```

### Test

```bash
# iOS Debug
npm run test:e2e:ios
# o
detox test --configuration ios.sim.debug

# iOS Release
npm run test:e2e:ios:release

# Android Debug
npm run test:e2e:android
# o
detox test --configuration android.emu.debug

# Android Release
npm run test:e2e:android:release

# Con artefactos (screenshots/videos)
detox test --configuration ios.sim.debug --artifacts-location ./e2e/artifacts
```

### Test Específico

```bash
# Un archivo específico
detox test --configuration ios.sim.debug e2e/login.test.js

# Un test específico (por nombre)
detox test --configuration ios.sim.debug --testNamePattern="should login"
```

## 📁 Estructura de Tests

```
e2e/
├── firstTest.e2e.js          # Tests principales
├── login.test.js             # Tests de autenticación
├── actas.test.js             # Tests de registro de actas
├── sync.test.js              # Tests de sincronización
├── offline.test.js           # Tests offline
└── utils/
    ├── testData.js           # Datos de prueba
    ├── helpers.js            # Funciones auxiliares
    └── selectors.js          # Selectores de elementos
```

## 🎯 Tests Disponibles

### Login Flow
- ✅ Login con credenciales válidas
- ✅ Login con credenciales inválidas
- ✅ Validación de campos vacíos
- ✅ Persistencia de sesión

### Home/Dashboard
- ✅ Carga de estadísticas
- ✅ Navegación a formulario
- ✅ Navegación a pendientes

### Formulario de Acta
- ✅ Campos requeridos
- ✅ Validaciones (votos > votantes)
- ✅ Guardado exitoso
- ✅ Cancelar operación

### Cámara
- ✅ Abrir cámara
- ✅ Capturar foto
- ✅ Preview
- ✅ Confirmar/cancelar

### Sincronización
- ✅ Lista de pendientes
- ✅ Sync individual
- ✅ Sync batch
- ✅ Estados (enviando, enviado, error)

### Offline
- ✅ Modo avión
- ✅ Guardado local
- ✅ Sincronización al recuperar conexión

## 🐛 Debugging

### Ver logs del dispositivo

```bash
# iOS (simulador)
# Logs aparecen automáticamente en la consola

# Android
adb logcat | grep "ReactNative"
```

### Screenshots automáticas

Los tests capturan screenshots automáticamente en:
- Antes de cada test
- Al fallar un test
- Puntos definidos manualmente

```javascript
await device.takeScreenshot('nombre-screenshot');
```

### Verbosidad

```bash
# Más detalle
detox test --configuration ios.sim.debug --loglevel verbose

# Solo errores
detox test --configuration ios.sim.debug --loglevel error
```

## 📝 Escribir Nuevos Tests

### Ejemplo Básico

```javascript
describe('Nombre del Feature', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('debería hacer algo', async () => {
    // Interactuar con elementos
    await element(by.id('input-email')).typeText('test@example.com');
    await element(by.id('input-password')).typeText('password123');
    await element(by.id('btn-login')).tap();
    
    // Verificar resultado
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

### Selectores Disponibles

```javascript
// Por ID (recomendado)
by.id('login-button')

// Por texto
by.text('Iniciar Sesión')

// Por label (accesibilidad)
by.label('Botón de login')

// Por traits (iOS)
by.traits(['button'])

// Combinados
by.id('list-item').withDescendant(by.text('Título'))
```

### Acciones

```javascript
// Tap
await element(by.id('button')).tap();
await element(by.id('button')).multiTap(3);

// Text input
await element(by.id('input')).typeText('texto');
await element(by.id('input')).clearText();
await element(by.id('input')).replaceText('nuevo texto');

// Scroll
await element(by.id('scrollview')).scroll(100, 'down');
await element(by.id('scrollview')).scrollTo('bottom');

// Swipe
await element(by.id('item')).swipe('left', 'fast', 0.5);
await element(by.id('item')).swipe('right');

// Pinch (zoom)
await element(by.id('map')).pinchWithAngle('outward', 'fast', 0);
```

### Expectativas

```javascript
// Visibilidad
await expect(element(by.id('screen'))).toBeVisible();
await expect(element(by.id('screen'))).toBeNotVisible();
await expect(element(by.id('screen'))).toExist();

// Texto
await expect(element(by.id('label'))).toHaveText('Texto esperado');
await expect(element(by.id('label'))).toHaveLabel('Label accesibilidad');

// Atributos
await expect(element(by.id('toggle'))).toHaveToggleValue(true);

// Con timeout
await waitFor(element(by.id('loading')))
  .toBeNotVisible()
  .withTimeout(5000);
```

### Device API

```javascript
// Launch
await device.launchApp();
await device.launchApp({ newInstance: true });
await device.launchApp({ permissions: { camera: 'YES' } });

// Reload
await device.reloadReactNative();

// App lifecycle
await device.sendToHome();
await device.launchApp({ newInstance: false });
await device.terminateApp();

// Orientación
await device.setOrientation('landscape');
await device.setOrientation('portrait');

// Ubicación
await device.setLocation(4.711, -74.0721); // Bogotá

// Red
await device.setURLBlacklist(['.*']); // Offline
await device.setURLBlacklist([]); // Online

// Shake (iOS)
await device.shake();

// Press back (Android)
await device.pressBack();
```

## 🔧 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:e2e:ios
      - run: npm run test:e2e:ios
```

## 📊 Mejores Prácticas

1. **IDs únicos:** Usar testID en todos los elementos interactuables
2. **Tests independientes:** Cada test debe poder ejecutarse solo
3. **Limpiar estado:** Usar beforeEach para resetear
4. **Timeouts apropiados:** Esperar elementos, no tiempo fijo
5. **Selectores estables:** Evitar selectores por texto que cambia
6. **Screenshots:** Capturar en puntos críticos
7. **Mocking:** Usar mocks para servicios externos

## 🆘 Troubleshooting

### Detox no encuentra el emulador
```bash
# Listar emuladores disponibles
$ANDROID_HOME/emulator/emulator -list-avds

# Crear nuevo emulador
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n Pixel_7_API_34 -k "system-images;android-34;google_apis;x86_64"
```

### Build falla
```bash
# Limpiar y rebuild
cd android && ./gradlew clean
cd .. && npm run build:e2e:android
```

### Tests flaky (intermitentes)
- Aumentar timeouts
- Usar waitFor en lugar de sleep
- Verificar que elementos estén listos
- Usar matchers más específicos

## 📚 Recursos

- [Documentación Detox](https://wix.github.io/Detox/)
- [API Reference](https://wix.github.io/Detox/docs/api/device)
- [Matchers](https://wix.github.io/Detox/docs/api/matchers)
- [Actions](https://wix.github.io/Detox/docs/api/actions-on-element)

---

**Configurado:** Agosto 2026  
**Versión Detox:** 20.14.0
