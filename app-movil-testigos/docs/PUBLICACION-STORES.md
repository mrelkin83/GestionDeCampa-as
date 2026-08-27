# Guía de Publicación - App Móvil Nativa

## 📱 Publicación en Google Play Store (Android)

### Paso 1: Crear Cuenta de Desarrollador

1. Ir a [Google Play Console](https://play.google.com/console)
2. Pagar tarifa de registro ($25 USD único)
3. Completar información de la cuenta

### Paso 2: Generar Keystore (Firma Digital)

```bash
# Generar keystore (solo una vez)
keytool -genkey -v \
  -keystore preconteo-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias preconteo

# Información requerida:
# - Contraseña: [guardar en lugar seguro]
# - Nombre: Plataforma Electoral
# - Organización: Plataforma Electoral Colombia
# - Ciudad: Bogotá
# - Estado: Cundinamarca
# - País: CO
```

**⚠️ IMPORTANTE:** Guardar el keystore en lugar seguro. Si se pierde, no se podrán actualizar la app.

### Paso 3: Configurar EAS Build

```json
// eas.json ya configurado
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Paso 4: Subir Keystore a EAS

```bash
# Configurar keystore en Expo
npx eas credentials

# Seleccionar:
# - Platform: Android
# - Build profile: production
# - Keystore: Importar existente
# - Subir archivo: preconteo-keystore.jks
```

### Paso 5: Generar Build de Producción

```bash
# Generar Android App Bundle (AAB)
npx eas build --platform android --profile production

# O generar APK para pruebas
npx eas build --platform android --profile preview
```

### Paso 6: Crear App en Play Console

1. **Crear aplicación:**
   - Nombre: "Testigos Electorales"
   - Idioma predeterminado: Español

2. **Configurar:**
   - Política de privacidad
   - Acceso a la app
   - Anuncios (no aplica)
   - Clasificación de contenido

3. **Información de la tienda:**
   - Título: "Testigos Electorales - Preconteo"
   - Descripción corta: "App para testigos electorales"
   - Descripción completa: [ver metadata]
   - Gráficos: screenshots, feature graphic, icono

### Paso 7: Subir AAB

1. Ir a "Producción" → "Crear versión"
2. Subir archivo `.aab` generado
3. Revisar y confirmar
4. Enviar a revisión

---

## 🍎 Publicación en App Store (iOS)

### Paso 1: Cuenta Apple Developer

1. Inscribirse en [Apple Developer](https://developer.apple.com)
2. Pagar tarifa anual ($99 USD)
3. Verificar identidad (DNI/pasaporte)

### Paso 2: Configurar Certificados

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
npx eas login

# Configurar credenciales iOS
npx eas credentials

# Seleccionar:
# - Platform: iOS
# - Build profile: production
# - Generar nuevos certificados
```

### Paso 3: Generar Build iOS

```bash
# Generar IPA
npx eas build --platform ios --profile production

# Para pruebas internas
npx eas build --platform ios --profile preview
```

### Paso 4: App Store Connect

1. Ir a [App Store Connect](https://appstoreconnect.apple.com)
2. Crear nueva app:
   - Nombre: "Testigos Electorales"
   - SKU: com.plataformaelectoral.testigos
   - Bundle ID: com.plataformaelectoral.testigos

3. **Información de la app:**
   - Subtitulo: "Sistema de Preconteo"
   - Categoría: Utilidades
   - Licencia: Proprietaria

4. **Precios:**
   - Precio: Gratis
   - Disponibilidad: Colombia

5. **App Privacy:**
   - Datos recolectados: Ubicación, Fotos
   - Enlace a política de privacidad

### Paso 5: Subir IPA

1. EAS sube automáticamente el IPA
2. En App Store Connect, seleccionar el build
3. Completar información:
   - Preview (screenshots)
   - Información de contacto
   - Notas de revisión
4. Enviar a revisión

---

## 📸 Assets Requeridos

### Android

**Icono:**
- 512x512 px
- PNG o JPEG
- Fondo transparente

**Feature Graphic:**
- 1024x500 px
- PNG o JPEG
- Sin transparencia

**Screenshots:**
- Teléfono: 2-8 screenshots
  - Resoluciones: 1080x1920, 1080x2160, etc.
- Tablet: 2-8 screenshots
  - 2048x2732 (iPad), 2560x1600 (Android)

### iOS

**Icono:**
- 1024x1024 px
- Sin transparencia
- Sin esquinas redondeadas

**Screenshots:**
- iPhone 6.5" (1242x2688)
- iPhone 5.5" (1242x2208)
- iPad Pro 12.9" (2048x2732)
- Mínimo 1 screenshot por tamaño

---

## 📋 Metadata para Stores

### Título
```
Testigos Electorales - Preconteo
```

### Subtítulo (iOS) / Descripción Corta (Android)
```
App oficial para testigos electorales en Colombia
```

### Descripción Completa
```
Testigos Electorales es la aplicación oficial para el registro de actas de escrutinio durante las elecciones en Colombia.

CARACTERÍSTICAS PRINCIPALES:

✅ Funciona 100% Offline
Registre actas sin conexión a internet. Los datos se guardan en el dispositivo.

📸 Captura de Evidencias
Tome fotos del acta directamente desde la app con la cámara nativa.

🔄 Sincronización Automática
Cuando haya internet, los datos se sincronizan automáticamente con el sistema central.

📍 Mapa de Mesas
Visualice la ubicación de las mesas de votación cercanas.

✓ Validaciones Automáticas
El sistema detecta anomalías como diferencias entre votantes y votos.

📊 Resultados en Tiempo Real
Los coordinadores pueden ver los resultados actualizados instantáneamente.

SEGURIDAD:
• Datos encriptados en el dispositivo
• Autenticación segura
• Auditoría completa de cada acta
• Cumplimiento con normativa electoral colombiana

REQUISITOS:
• Android 8.0+ / iOS 14+
• Cámara funcional
• GPS (opcional, para mapa)

DESARROLLADO POR:
Plataforma Electoral Colombia © 2027

Para soporte: soporte@plataformaelectoral.com
```

### Palabras Clave
```
elecciones, preconteo, votación, testigos, colombia, actas, escrutinio, democracia
```

### URL de Soporte
```
https://plataformaelectoral.com/soporte
```

### URL de Política de Privacidad
```
https://plataformaelectoral.com/privacidad
```

---

## 🔐 Seguridad y Privacidad

### Permisos Android

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### Justificación de Permisos

**Cámara:**
"Necesitamos acceso a la cámara para que pueda capturar fotos del acta de escrutinio como evidencia."

**Ubicación:**
"Usamos su ubicación para mostrarle las mesas de votación cercanas y mejorar la precisión del registro."

**Internet:**
"Necesario para sincronizar los datos con el servidor cuando haya conexión disponible."

---

## ✅ Checklist Pre-Publicación

### Android
- [ ] Keystore generado y guardado
- [ ] AAB generado exitosamente
- [ ] Política de privacidad publicada
- [ ] Screenshots subidos
- [ ] Icono y feature graphic listos
- [ ] Descripción completa
- [ ] Categoría seleccionada
- [ ] Clasificación de contenido
- [ ] Precio configurado (Gratis)
- [ ] Países seleccionados (Colombia)

### iOS
- [ ] Certificados generados
- [ ] IPA generado exitosamente
- [ ] App Store Connect configurado
- [ ] Screenshots para todos los tamaños
- [ ] Icono de app listo
- [ ] Información de privacidad completa
- [ ] Categoría seleccionada
- [ ] Precio configurado (Gratis)
- [ ] Territorios seleccionados
- [ ] Información de contacto

### General
- [ ] Versión actualizada
- [ ] Changelog actualizado
- [ ] Pruebas en dispositivos reales
- [ ] No hay crashes conocidos
- [ ] Cumple políticas de cada store

---

## 🚀 Comandos Rápidos

```bash
# Android
npx eas build --platform android --profile production
npx eas submit --platform android

# iOS
npx eas build --platform ios --profile production
npx eas submit --platform ios

# Actualizar (OTA - Over The Air)
npx eas update --channel production --message "Update description"
```

---

## 📞 Soporte

**Google Play:** [Centro de Ayuda](https://support.google.com/googleplay/android-developer)  
**Apple App Store:** [Developer Support](https://developer.apple.com/support/)

**Equipo de Desarrollo:** soporte@plataformaelectoral.com

---

**Actualizado:** Agosto 2026
