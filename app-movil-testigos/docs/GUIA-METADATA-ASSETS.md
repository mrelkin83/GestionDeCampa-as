# Guía de Metadata y Assets para Tiendas

Esta guía detalla todos los assets gráficos y metadata necesarios para publicar la app en Google Play Store y Apple App Store.

---

## 🎨 Assets Gráficos

### 1. Icono de Aplicación

**Especificaciones:**

| Plataforma | Tamaño | Formato | Fondo | Archivo |
|------------|--------|---------|-------|---------|
| Android | 512 x 512 px | PNG/JPEG | Transparente | `icon.png` |
| iOS | 1024 x 1024 px | PNG/JPEG | Sólido (no transparente) | `app-icon-1024.jpg` |

**Diseño:**
- Forma: Cuadrado (Android lo enmascara, iOS redondea esquinas)
- Estilo: Material Design (Android) / Flat (iOS)
- Colores: Azul primario (#2563eb), blanco
- Elementos: Urna/urna electoral + checkmark
- Sin texto en el icono (excepto si es parte del logo)

**Herramientas recomendadas:**
- Figma
- Adobe Illustrator
- Sketch (macOS)

---

### 2. Splash Screen / Launch Screen

**Android (Splash):**
- Tamaño: 1242 x 2436 px (ratio 9:19.5)
- Formato: PNG
- Fondo: #2563eb (azul primario)
- Contenido: Logo centrado + texto "Testigos Electorales"
- Archivo: `splash.png`

**iOS (Launch Screen):**
- Configurar en Xcode
- Usar LaunchScreen.storyboard
- Fondo: #2563eb
- Logo centrado

---

### 3. Feature Graphic (Android exclusivo)

**Especificaciones:**
- Tamaño: 1024 x 500 px
- Formato: PNG/JPEG
- Fondo: #2563eb o gradiente
- Sin transparencia
- Archivo: `feature-graphic.png`

**Contenido sugerido:**
```
[Logo grande]          [Mockup de app]
                        mostrando dashboard

"Sistema de Preconteo Electoral"
"Para Testigos en Colombia"
```

**Texto:**
- Título: "Testigos Electorales"
- Subtítulo: "Sistema de Preconteo"
- Fuente: Sans-serif, legible
- Colores: Blanco sobre azul

---

### 4. Screenshots

#### Android Screenshots

**Resoluciones aceptadas:**
- 1080 x 1920 (16:9)
- 1080 x 2160 (18:9)
- 1080 x 2400 (20:9)
- 1080 x 2340 (19.5:9)

**Cantidad:** 2-8 por tipo de dispositivo

**Screenshots recomendados:**

1. **Login Screen**
   - Muestra pantalla de login
   - Texto overlay: "Inicie sesión de forma segura"

2. **Dashboard/Home**
   - Estadísticas visibles
   - Texto overlay: "Monitoree el progreso en tiempo real"

3. **Formulario de Acta**
   - Formulario completo con datos
   - Texto overlay: "Registre actas fácilmente"

4. **Cámara**
   - Vista de cámara capturando acta
   - Texto overlay: "Capture evidencias fotográficas"

5. **Lista de Pendientes**
   - Lista con estados
   - Texto overlay: "Funciona 100% offline"

6. **Mapa de Mesas** (opcional)
   - Mapa con marcadores
   - Texto overlay: "Encuentre mesas cercanas"

#### iOS Screenshots

**Resoluciones requeridas:**

| Dispositivo | Resolución | Aspect Ratio | Mínimo |
|-------------|------------|----------------|--------|
| iPhone 6.7" | 1290 x 2796 | 19.5:9 | 1 |
| iPhone 6.5" | 1242 x 2688 | 19.5:9 | 1 |
| iPhone 5.5" | 1242 x 2208 | 16:9 | 1 |
| iPad Pro 12.9" | 2048 x 2732 | 4:3 | 0 |

**Contenido de screenshots:**
Mismo contenido que Android, pero adaptado a ratio de iPhone.

**Generación de screenshots:**
```bash
# Opción 1: Capturar en simulador
# iOS Simulator: Device → Screenshot
# Android Emulator: Extended Controls → Screenshot

# Opción 2: Fastlane (automatizado)
# iOS: fastlane snapshot
# Android: fastlane screengrab

# Opción 3: Generar con Figma/Photoshop
# Crear mockups con screenshots integrados
```

**Herramientas para mockups:**
- Figma (plantillas gratuitas)
- AppLaunchpad
- ShotBot
- Screenshot Builder

---

### 5. Video Promocional (Opcional)

**Android (YouTube):**
- Resolución: 1920 x 1080 (Full HD)
- Duración: 30-120 segundos
- Formato: YouTube
- Audio: Opcional

**iOS:**
- Resolución: 1920 x 1080
- Duración: 15-30 segundos
- Formato: H.264, .mov o .m4v
- Audio: Opcional
- Sin audio de fondo si usa música con derechos

**Contenido del video:**
```
0:00 - 0:05  Logo + Tagline
0:05 - 0:15  Demo del login rápido
0:15 - 0:30  Navegación fluida entre pantallas
0:30 - 0:45  Registro de acta (destacar cámara)
0:45 - 1:00  Sync automático + notificaciones
1:00 - 1:15  Dashboard con resultados en tiempo real
1:15 - 1:30  CTA: "Descarga gratis"
```

**Herramientas:**
- After Effects
- Premiere Pro
- Final Cut Pro
- Canva (opciones simples)

---

### 6. Iconos de Notificación

**Android:**
- Tamaño: 96 x 96 px
- Formato: PNG
- Color: #2563eb
- Fondo: Transparente
- Archivo: `notification-icon.png`

**iOS:**
- Configurar en proyecto Xcode
- Tamaños: 20pt, 24pt, 28pt (@2x, @3x)
- Formato: PNG
- Archivo: `AppIcon.appiconset`

---

## 📝 Metadata

### 1. Títulos

**Google Play Store:**
```
Testigos Electorales - Preconteo
```
(30 caracteres - límite: 50)

**Apple App Store:**
```
Testigos Electorales
```
(18 caracteres - límite: 30)

### 2. Subtítulos

**iOS exclusivo (30 caracteres):**
```
Sistema de Preconteo Electoral
```

### 3. Descripciones

**Google Play - Descripción corta (80 caracteres):**
```
App oficial para testigos electorales en Colombia. Registre actas offline.
```

**Descripción completa (4000 caracteres máximo):**
```
Testigos Electorales es la aplicación oficial para el registro de actas de escrutinio durante las elecciones en Colombia.

CARACTERÍSTICAS PRINCIPALES:

✅ Funciona 100% Offline
Registre actas sin conexión a internet. Los datos se guardan en el dispositivo y se sincronizan automáticamente cuando hay conexión.

📸 Captura de Evidencias
Tome fotos del acta directamente desde la app con la cámara nativa. Las imágenes se adjuntan como evidencia del registro.

🔄 Sincronización Automática
Cuando haya internet disponible, los datos se sincronizan automáticamente con el sistema central para análisis en tiempo real.

📍 Mapa de Mesas
Visualice la ubicación de las mesas de votación cercanas en un mapa interactivo. Encuentre su mesa asignada fácilmente.

✓ Validaciones Automáticas
El sistema detecta automáticamente anomalías como diferencias entre votantes y votos, alertando sobre posibles errores.

📊 Resultados en Tiempo Real
Los coordinadores pueden ver los resultados actualizados instantáneamente a través del dashboard web.

🔒 SEGURIDAD Y PRIVACIDAD:
• Datos encriptados en el dispositivo
• Autenticación segura con JWT
• Auditoría completa de cada acta registrada
• Cumplimiento con normativa electoral colombiana
• Sin compartir datos con terceros

📱 REQUISITOS:
• Android 8.0+ / iOS 14+
• Cámara funcional para evidencias
• GPS opcional para funcionalidad de mapa
• Conexión a internet para sincronización (no requerida para uso básico)

🗳️ COMPATIBILIDAD:
La app está diseñada específicamente para el sistema electoral colombiano y es compatible con:
• Elecciones Presidenciales
• Elecciones Legislativas
• Elecciones Territoriales

DESARROLLADO POR:
Plataforma Electoral Colombia © 2027

Para soporte técnico o consultas:
📧 soporte@plataformaelectoral.com
🌐 https://plataformaelectoral.com

Versión 1.0.0 - Agosto 2026
```

**iOS - Descripción:**
```
Testigos Electorales es la aplicación oficial para el registro de actas de escrutinio durante las elecciones en Colombia.

CARACTERÍSTICAS:

• Funciona 100% sin conexión a internet
• Captura de evidencias fotográficas integrada
• Sincronización automática cuando hay conexión
• Mapa de mesas de votación cercanas
• Validaciones en tiempo real de datos
• Resultados actualizados para coordinadores

Segura, rápida y confiable para testigos electorales registrados.

Desarrollado por Plataforma Electoral Colombia © 2027
```

### 4. Palabras Clave (Keywords)

**iOS (100 caracteres máximo):**
```
elecciones,preconteo,votación,testigos,colombia,actas,escrutinio,democracia
```

**Google Play (etiquetas):**
```
elecciones, preconteo, votación, testigos, colombia, actas, escrutinio, democracia, electoral, urna, mesa, votante, candidato, partido, resultado
```

### 5. URLs

**Sitio web:**
```
https://plataformaelectoral.com
```

**Soporte:**
```
https://plataformaelectoral.com/soporte
```

**Marketing (iOS):**
```
https://plataformaelectoral.com/testigos
```

**Política de privacidad:**
```
https://plataformaelectoral.com/privacidad
```

### 6. Textos Promocionales

**iOS - Promotional Text (170 caracteres):**
```
¡Nueva versión! Mejor rendimiento offline, sincronización más rápida y soporte para múltiples tipos de elecciones.
```

**Google Play - What's New:**
```
Versión 1.0.0:
• Registro de actas offline completo
• Captura de evidencias fotográficas
• Sincronización automática
• Mapa de mesas de votación
• Validaciones en tiempo real
• Mejoras de rendimiento y estabilidad
```

### 7. Información de Contacto

**Nombre del desarrollador:**
```
Plataforma Electoral Colombia
```

**Email:**
```
soporte@plataformaelectoral.com
```

**Teléfono:**
```
+57 [número de contacto]
```

**Dirección:**
```
[Calle/Carrera]
[Ciudad], [Departamento]
Colombia
```

---

## 📁 Estructura de Archivos

```
assets/
├── icon.png                          # 512x512 - Android/iOS
├── adaptive-icon.png                 # 1024x1024 - Android
├── app-icon-1024.jpg                 # 1024x1024 - iOS
├── splash.png                        # 1242x2436 - Splash
├── notification-icon.png             # 96x96 - Notificaciones
├── favicon.png                       # 48x48 - Web
├── feature-graphic.png               # 1024x500 - Android
│
├── screenshots/
│   ├── android/
│   │   ├── phone/
│   │   │   ├── screenshot-1.png      # Login
│   │   │   ├── screenshot-2.png      # Dashboard
│   │   │   ├── screenshot-3.png      # Formulario
│   │   │   ├── screenshot-4.png      # Cámara
│   │   │   └── screenshot-5.png      # Pendientes
│   │   └── tablet/                   # Opcional
│   │
│   └── ios/
│       ├── iphone-67-inch/           # 1290x2796
│       │   ├── screenshot-1.png
│       │   ├── screenshot-2.png
│       │   └── screenshot-3.png
│       ├── iphone-65-inch/           # 1242x2688
│       │   ├── screenshot-1.png
│       │   ├── screenshot-2.png
│       │   └── screenshot-3.png
│       ├── iphone-55-inch/           # 1242x2208
│       │   ├── screenshot-1.png
│       │   ├── screenshot-2.png
│       │   └── screenshot-3.png
│       └── ipad-pro-129/             # 2048x2732 (opcional)
│
└── video/
    ├── promo-android.mp4             # YouTube
    └── promo-ios.mp4                 # H.264

metadata/
├── android/
│   ├── title.txt
│   ├── short_description.txt
│   ├── full_description.txt
│   └── video-url.txt
│
└── ios/
    ├── title.txt
    ├── subtitle.txt
    ├── description.txt
    ├── keywords.txt
    ├── promotional_text.txt
    ├── support_url.txt
    ├── marketing_url.txt
    └── privacy_url.txt
```

---

## 🎨 Guía de Diseño

### Paleta de Colores

**Colores principales:**
- Primario: #2563eb (Azul eléctrico)
- Primario oscuro: #1d4ed8
- Primario claro: #3b82f6

**Colores secundarios:**
- Éxito: #22c55e (Verde)
- Advertencia: #f59e0b (Ámbar)
- Error: #ef4444 (Rojo)
- Info: #3b82f6 (Azul)

**Colores neutrales:**
- Fondo: #ffffff (Blanco)
- Texto principal: #1f2937 (Gris oscuro)
- Texto secundario: #6b7280 (Gris medio)
- Borde: #e5e7eb (Gris claro)

### Tipografía

**Android:**
- Fuente: Roboto
- Títulos: Bold, 20-24sp
- Cuerpo: Regular, 16sp
- Caption: Regular, 12sp

**iOS:**
- Fuente: San Francisco (SF Pro)
- Títulos: Bold, 20-28pt
- Cuerpo: Regular, 15-17pt
- Caption: Regular, 12-13pt

### Estilo de Screenshots

**Diseño consistente:**
- Fondo limpio y profesional
- Dispositivo real o mockup de alta calidad
- Texto explicativo breve y claro
- Flechas o highlights para destacar features
- Consistencia en fuentes y colores

**Plantilla sugerida:**
```
┌─────────────────────────────┐
│                             │
│    [Mockup del dispositivo] │
│                             │
│                             │
│  "Título del feature"       │
│  Descripción breve          │
│                             │
└─────────────────────────────┘
```

---

## ✅ Checklist de Assets

### Iconos
- [ ] icon.png (512x512)
- [ ] adaptive-icon.png (1024x1024)
- [ ] app-icon-1024.jpg (1024x1024)
- [ ] splash.png (1242x2436)
- [ ] notification-icon.png (96x96)
- [ ] favicon.png (48x48)
- [ ] feature-graphic.png (1024x500)

### Screenshots
- [ ] Android: 2-8 screenshots de teléfono
- [ ] iOS iPhone 6.7": 1-10 screenshots
- [ ] iOS iPhone 6.5": 1-10 screenshots
- [ ] iOS iPhone 5.5": 1-10 screenshots
- [ ] iOS iPad 12.9": 0-10 screenshots

### Video
- [ ] Video Android (YouTube) - Opcional
- [ ] Video iOS (H.264) - Opcional

### Metadata
- [ ] Títulos definidos
- [ ] Descripciones completas
- [ ] Palabras clave
- [ ] URLs configuradas
- [ ] Textos promocionales

---

## 🛠️ Herramientas Recomendadas

### Diseño
- **Figma:** Diseño colaborativo, plantillas gratuitas
- **Adobe Illustrator:** Diseño vectorial profesional
- **Sketch:** Diseño UI (macOS)

### Mockups de Screenshots
- **AppLaunchpad:** Generador automático
- **ShotBot:** Mockups para App Store
- **Screenshot Builder:** Figma plugin
- **Smartmockups:** Biblioteca grande

### Video
- **After Effects:** Animaciones profesionales
- **Premiere Pro:** Edición de video
- **Final Cut Pro:** Edición (macOS)
- **Canva:** Opciones simples y rápidas

### Optimización
- **ImageOptim:** Compresión PNG/JPEG
- **Squoosh:** Compresión web
- **TinyPNG:** Compresión online

---

**Documento creado:** 20 Agosto 2026  
**Versión:** 1.0
