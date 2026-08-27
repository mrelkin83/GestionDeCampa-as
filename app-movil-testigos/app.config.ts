import { ExpoConfig, ConfigContext } from 'expo/config';

// Configuración para producción
// Actualizar valores según el ambiente

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const API_URL = IS_PRODUCTION 
  ? 'https://api.plataformaelectoral.com' 
  : 'https://api-staging.plataformaelectoral.com';
const WS_URL = IS_PRODUCTION
  ? 'wss://ws.plataformaelectoral.com'
  : 'wss://ws-staging.plataformaelectoral.com';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Testigos Electorales',
  slug: 'testigos-electorales',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  
  // Splash screen
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#2563eb'
  },
  
  // Asset patterns
  assetBundlePatterns: [
    '**/*'
  ],
  
  // iOS Configuration
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.plataformaelectoral.testigos',
    buildNumber: '1.0.0',
    infoPlist: {
      // Camera permission
      NSCameraUsageDescription: 'Esta app necesita acceso a la cámara para capturar evidencias fotográficas de los actas electorales. Las fotos se adjuntan a los reportes de escrutinio.',

      // Location: sin declarar -ninguna pantalla usa expo-location todavía
      // (ver nota equivalente en la sección android). Re-agregar cuando el
      // mapa de mesas cercanas se implemente de verdad.

      // Background modes
      UIBackgroundModes: [
        'fetch',
        'remote-notification'
      ],
      
      // App capabilities
      LSApplicationQueriesSchemes: ['mailto', 'tel'],
      
      // Security
      ITSAppUsesNonExemptEncryption: false
    },
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
    }
  },
  
  // Android Configuration
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2563eb'
    },
    package: 'com.plataformaelectoral.testigos',
    versionCode: 1,
    // ACCESS_FINE/COARSE/BACKGROUND_LOCATION se quitaron: ninguna pantalla
    // usa expo-location todavía ("Mapa de Mesas" es un placeholder, ver
    // MapaMesasScreen.tsx). Pedir ubicación en segundo plano sin usarla es
    // motivo típico de rechazo en revisión de Google Play/App Store y un
    // permiso innecesario de cara a privacidad. Volver a agregarlos cuando
    // esa función se implemente de verdad.
    permissions: [
      'CAMERA',
      'RECEIVE_BOOT_COMPLETED',
      'SCHEDULE_EXACT_ALARM',
      'WAKE_LOCK',
      'VIBRATE',
      'INTERNET',
      'ACCESS_NETWORK_STATE'
    ],
    softwareKeyboardLayoutMode: 'pan',
    intentFilters: [
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'https',
            host: '*.plataformaelectoral.com',
            pathPrefix: '/testigos'
          }
        ],
        category: ['BROWSABLE', 'DEFAULT']
      }
    ]
  },
  
  // Web Configuration
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  },
  
  // Plugins
  plugins: [
    [
      'expo-camera',
      {
        cameraPermission: 'Permitir que Testigos Electorales acceda a la cámara para capturar evidencias fotográficas.',
        microphonePermission: false
      }
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#2563eb',
        sounds: ['./assets/notification-sound.wav'],
        mode: 'production'
      }
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Permitir que Testigos Electorales use Face ID para autenticación biométrica.'
      }
    ],
    [
      'expo-sqlite',
      {
        enableFTS: true,
        enableJSON: true
      }
    ]
  ],
  
  // EAS Configuration
  extra: {
    eas: {
      projectId: 'your-eas-project-id' // Actualizar con ID real de EAS
    },
    apiUrl: API_URL,
    wsUrl: WS_URL
  },
  
  // OTA Updates
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/your-eas-project-id' // Actualizar con ID real
  },
  
  // Runtime Version
  runtimeVersion: {
    policy: 'sdkVersion'
  },
  
  // JS Engine
  jsEngine: 'hermes',
  
  // Experiments
  experiments: {
    tsconfigPaths: true
  }
});
