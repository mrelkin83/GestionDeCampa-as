# Assets para App Store

Este directorio debe contener los siguientes assets para la publicación en las tiendas:

## Iconos

### icon.png
- Tamaño: 1024x1024 px
- Formato: PNG
- Fondo: Transparente
- Descripción: Icono principal de la app

### adaptive-icon.png (Android)
- Tamaño: 1024x1024 px
- Formato: PNG
- Fondo: Puede tener color de fondo
- Descripción: Icono adaptativo para Android

### favicon.png (Web)
- Tamaño: 48x48 px
- Formato: PNG

## Splash Screen

### splash.png
- Tamaño: 1242x2436 px (iPhone X)
- Formato: PNG
- Fondo: #2563eb (azul principal)
- Logo centrado

## Notificaciones

### notification-icon.png
- Tamaño: 96x96 px
- Formato: PNG
- Fondo: Transparente
- Color: #2563eb

## Screenshots para Stores

### Android

**Teléfono (16:9):**
- screenshot-1.png - Login
- screenshot-2.png - Dashboard
- screenshot-3.png - Formulario de acta
- screenshot-4.png - Captura de foto
- screenshot-5.png - Lista de pendientes

**Resoluciones:**
- 1080x1920 px (Full HD)
- 1080x2160 px (18:9)
- 1080x2400 px (20:9)

### iOS

**iPhone 6.5" (iPhone 11 Pro Max, XS Max):**
- screenshot-iphone-1.png - 1242x2688
- screenshot-iphone-2.png - 1242x2688
- screenshot-iphone-3.png - 1242x2688

**iPhone 5.5" (iPhone 8 Plus, 7 Plus):**
- screenshot-iphone-old-1.png - 1242x2208
- screenshot-iphone-old-2.png - 1242x2208

**iPad Pro 12.9":**
- screenshot-ipad-1.png - 2048x2732
- screenshot-ipad-2.png - 2048x2732

## Feature Graphic (Android)

### feature-graphic.png
- Tamaño: 1024x500 px
- Formato: PNG
- Fondo: #2563eb
- Texto: "Testigos Electorales - Sistema de Preconteo"

## Plantillas de Screenshots

### Guía de diseño:
1. Usar fondo limpio (blanco o gris claro)
2. Mostrar la app en uso real
3. Incluir texto explicativo breve
4. Destacar funcionalidades principales
5. Mantener consistencia visual

### Ejemplo de contenido:

**Screenshot 1 - Login:**
- Pantalla de login visible
- Texto: "Inicie sesión de forma segura"

**Screenshot 2 - Dashboard:**
- Dashboard con estadísticas
- Texto: "Monitoree el progreso en tiempo real"

**Screenshot 3 - Formulario:**
- Formulario de acta completo
- Texto: "Registre actas fácilmente"

**Screenshot 4 - Cámara:**
- Captura de evidencia
- Texto: "Adjunte fotos como evidencia"

**Screenshot 5 - Offline:**
- Lista de pendientes
- Texto: "Funciona 100% offline"

## Generación Automática

Para generar screenshots automáticamente:

```bash
# Usar fastlane snapshot (iOS)
cd ios
fastlane snapshot

# Usar screengrab (Android)
cd android
fastlane screengrab
```

## Herramientas Recomendadas

- **Figma** - Diseño de screenshots
- **App Store Screenshot Generator** - Plantillas
- **Mockup Generator** - Mockups de dispositivos
- **Fastlane** - Automatización de screenshots
