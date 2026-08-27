import type { CapacitorConfig } from '@capacitor/cli';

// build-android.sh exporta CAPACITOR_BUILD_TYPE=release antes de `cap sync`.
// Sin esto, un APK de producción se compilaba con depuración remota (DevTools
// sobre USB) y contenido HTTP mixto permitidos, igual que un build debug.
const isRelease = process.env.CAPACITOR_BUILD_TYPE === 'release';

const config: CapacitorConfig = {
  appId: 'com.plataformaelectoral.testigos',
  appName: 'Testigos Electorales',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#2563eb',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Camera: {
      allowEditing: false,
      saveToGallery: false,
    },
  },
  android: {
    allowMixedContent: !isRelease,
    captureInput: true,
    webContentsDebuggingEnabled: !isRelease,
  },
};

export default config;
