# Guía de Registro - Apple Developer Program

## 📋 Información General

**URL:** https://developer.apple.com  
**Costo:** $99 USD/año (renovable anualmente)  
**Tiempo de aprobación:** 24-48 horas (verificación de identidad)  
**Requisitos:** Apple ID, tarjeta de crédito, identificación oficial

---

## 🚀 Proceso de Registro Paso a Paso

### Paso 1: Crear Apple ID

Si no tienes un Apple ID:
1. Ve a https://appleid.apple.com/account
2. Completa el formulario:
   - Nombre completo
   - Fecha de nacimiento
   - Email (recomendado: corporativo)
   - Contraseña segura
   - Preguntas de seguridad
3. Verificar email
4. Configurar autenticación de dos factores (2FA)

**Para organizaciones:**
- Usar email corporativo
- Configurar 2FA en un dispositivo Apple físico (requerido)

---

### Paso 2: Verificar Apple ID

**Requisitos obligatorios:**
- ✅ Autenticación de dos factores activada
- ✅ Fecha de nacimiento actualizada
- ✅ Información de pago válida
- ✅ Dirección de facturación actualizada

**Configurar en dispositivo Apple:**
1. En iPhone/iPad: Ajustes → [Tu Nombre] → Contraseña y seguridad
2. Activar "Autenticación de dos factores"
3. Agregar número de teléfono confiable

---

### Paso 3: Enrolarse en Apple Developer Program

1. Ve a https://developer.apple.com/programs
2. Haz clic en "Enroll" (Inscribirse)
3. Lee y acepta el acuerdo de licencia
4. Seleccionar tipo de cuenta:
   - **Individual:** Nombre del desarrollador aparece
   - **Organización:** Nombre de la empresa aparece (recomendado)

**Para Organizaciones:**

Requisitos adicionales:
- D-U-N-S Number (Dun & Bradstreet)
- Sitio web público
- Autorización legal

**Obtener D-U-N-S Number (gratis):**
1. Ir a https://www.dnb.com/duns-number.html
2. Solicitar número para Colombia
3. Tiempo: 1-5 días hábiles
4. Verificar en: https://developer.apple.com/enroll/duns-lookup

---

### Paso 4: Información de la Organización

**Nombre de la organización:**
```
Plataforma Electoral Colombia
```

**D-U-N-S Number:**
```
[Solicitar previamente]
```

**Sitio web:**
```
https://plataformaelectoral.com
```

**Teléfono principal:**
```
+57 [Número de contacto]
```

**Dirección:**
```
[Calle/Carrera]
[Ciudad], [Departamento], [Código postal]
Colombia
```

**Correo de contacto:**
```
desarrollo@plataformaelectoral.com
```

---

### Paso 5: Verificación de Identidad

Apple requiere verificación de identidad para organizaciones:

**Documentos requeridos:**
- ✅ Cámara de comercio (persona jurídica)
- ✅ Certificado de existencia y representación legal
- ✅ Documento de identidad del representante legal

**Proceso:**
1. Subir documentos en el portal
2. Apple revisa documentación (24-48 horas)
3. Puede requerir información adicional
4. Aprobación por email

**Nota:** Para individuos, la verificación es más rápida (solo documento de identidad).

---

### Paso 6: Pago de Membresía

**Monto:** $99 USD/año  
**Renovación:** Automática anual  
**Métodos de pago:**
- Tarjeta de crédito (Visa, Mastercard, Amex)
- Débito (ciertos países)
- Facturación (para grandes organizaciones)

**Proceso:**
1. Ingresar datos de pago
2. Confirmar transacción
3. Guardar recibo

**Renovación:**
- Automática a menos que se cancele
- Email de recordatorio 30 días antes
- Si expira, la app se remueve de la App Store

---

## 📱 App Store Connect

Una vez aprobado, acceder a:
https://appstoreconnect.apple.com

### Paso 1: Crear Aplicación

1. Ir a "My Apps" (Mis Apps)
2. Haz clic en "+" → "New App"
3. Completar información:

**Plataformas:**
- ✅ iOS

**Nombre:**
```
Testigos Electorales
```

**Idioma primario:**
```
Español (México) o Español (España)
```

**Bundle ID:**
```
com.plataformaelectoral.testigos
```

**SKU:**
```
PRECONTEO-2026-001
```

**Acceso de usuario:**
- Limitado (acceso completo) / Público

---

### Paso 2: Información de la App

**Subtítulo (30 caracteres):**
```
Sistema de Preconteo Electoral
```

**Categoría primaria:**
```
Utilidades
```

**Categoría secundaria (opcional):**
```
Productividad
```

**Licencia:**
```
Proprietary (Propietaria)
```

**Precio:**
```
Gratis
```

**Disponibilidad:**
```
Colombia (o más países si aplica)
```

---

### Paso 3: Información de Privacidad

**Obligatorio:** Configurar en App Store Connect

**Datos recolectados:**

| Dato | Uso | Vinculado a usuario | Rastreo |
|------|-----|---------------------|---------|
| Ubicación precisa | Mostrar mesas cercanas | Sí | No |
| Fotos | Evidencias de actas | Sí | No |
| Identificadores de dispositivo | Analytics | No | No |
| Datos de uso | Mejoras | No | No |

**URL de política de privacidad:**
```
https://plataformaelectoral.com/privacidad
```

---

### Paso 4: Preparar Assets

**Icono de App:**
- Tamaño: 1024 x 1024 px
- Formato: JPG o PNG
- Sin transparencia
- Sin esquinas redondeadas (Apple las aplica)
- Archivo: `app-icon-1024.jpg`

**Screenshots:**

| Dispositivo | Resolución | Cantidad |
|-------------|------------|----------|
| iPhone 6.7" | 1290 x 2796 | 1-10 |
| iPhone 6.5" | 1242 x 2688 | 1-10 |
| iPhone 5.5" | 1242 x 2208 | 1-10 |
| iPad Pro 12.9" | 2048 x 2732 | 1-10 |

**Mínimo:** 1 screenshot por tamaño  
**Recomendado:** 3-5 screenshots por tamaño

**Video promocional (opcional):**
- Formato: H.264
- Resolución: 1920x1080
- Duración: 15-30 segundos
- Sin audio (opcional)

---

## 🔐 Configurar Certificados

### Paso 1: Crear Certificate Signing Request (CSR)

**En Mac:**
1. Abrir "Accesso a Llaveros" (Keychain Access)
2. Menú → Asistente de certificados → Solicitar un certificado...
3. Email: desarrollo@plataformaelectoral.com
4. Nombre: Plataforma Electoral
5. Guardar en disco
6. Archivo: `CertificateSigningRequest.certSigningRequest`

### Paso 2: Crear Certificado de Distribución

1. Ir a https://developer.apple.com/account/resources/certificates/list
2. Haz clic en "+"
3. Seleccionar: **Apple Distribution**
4. Subir el CSR
5. Descargar: `distribution.cer`

**Instalar certificado:**
1. Doble clic en `distribution.cer`
2. Se instala en Keychain Access

### Paso 3: Crear Identificador de App

1. Ir a https://developer.apple.com/account/resources/identifiers/list
2. Haz clic en "+"
3. Seleccionar: **App IDs**
4. Tipo: **App**
5. Descripción: Testigos Electorales
6. Bundle ID: `com.plataformaelectoral.testigos`
7. Capabilities:
   - ✅ Push Notifications
   - ✅ Background Modes
   - ✅ Location

### Paso 4: Crear Provisioning Profile

1. Ir a https://developer.apple.com/account/resources/profiles/list
2. Haz clic en "+"
3. Seleccionar: **App Store**
4. App ID: com.plataformaelectoral.testigos
5. Certificate: [Seleccionar el creado]
6. Nombre: Testigos Electorales App Store
7. Descargar: `Testigos_Electorales_App_Store.mobileprovision`

### Paso 5: Configurar en Xcode

1. Abrir proyecto en Xcode
2. Seleccionar target
3. Signing & Capabilities:
   - Team: [Tu equipo de Apple]
   - Bundle Identifier: com.plataformaelectoral.testigos
   - Provisioning Profile: Testigos Electorales App Store

---

## 📤 Subir Aplicación

### Paso 1: Generar Build con EAS

```bash
cd app-movil-testigos

# Build para App Store
npx eas build --platform ios --profile production

# O para TestFlight (beta testing)
npx eas build --platform ios --profile preview
```

### Paso 2: Subir a App Store Connect

**Opción A: EAS Submit (Automático)**
```bash
npx eas submit --platform ios
```

**Opción B: Transporter App (Manual)**
1. Descargar Transporter desde Mac App Store
2. Exportar IPA desde Xcode o EAS
3. Arrastrar IPA a Transporter
4. Click en "Deliver"

### Paso 3: Configurar en App Store Connect

1. Ir a App Store Connect → [App] → App Store
2. Seleccionar build subido
3. Completar información:

**Promotional Text (170 caracteres):**
```
¡Nueva versión! Mejor rendimiento offline, sincronización más rápida y soporte multicliente.
```

**Descripción:**
```
Testigos Electorales es la aplicación oficial para el registro de actas de escrutinio durante las elecciones en Colombia.

CARACTERÍSTICAS:

• Funciona 100% sin conexión
• Captura de evidencias fotográficas
• Sincronización automática
• Mapa de mesas de votación
• Validaciones en tiempo real
• Resultados actualizados

Segura, rápida y confiable para testigos electorales.

Desarrollado por Plataforma Electoral Colombia © 2027
```

**Palabras clave (100 caracteres):**
```
elecciones, preconteo, votación, testigos, colombia, actas, escrutinio, democracia
```

**URL de soporte:**
```
https://plataformaelectoral.com/soporte
```

**URL de marketing:**
```
https://plataformaelectoral.com/testigos
```

### Paso 4: Información de Revisión

**Notas para el revisor:**
```
Esta es una aplicación para uso exclusivo de testigos electorales registrados durante elecciones en Colombia.

Para probar la app:
- Usuario: demo@testigo.com
- Contraseña: Demo123!

Funcionalidades principales:
- Registro de actas de escrutinio
- Captura de evidencias fotográficas
- Sincronización offline/online
- Validaciones automáticas de datos

La app requiere:
- Cámara para capturar fotos de actas
- Ubicación para mostrar mesas cercanas (opcional)

Contacto: desarrollo@plataformaelectoral.com
```

**Información de contacto:**
- Nombre: [Nombre del responsable]
- Email: desarrollo@plataformaelectoral.com
- Teléfono: +57 [número]

**Datos de demostración:**
- Usuario: demo@testigo.com
- Contraseña: Demo123!

---

## ✅ Checklist Pre-Publicación

### Cuenta Developer
- [ ] Apple ID creado con 2FA
- [ ] Pago de $99 USD realizado
- [ ] Cuenta aprobada por Apple
- [ ] Acceso a App Store Connect

### Identificadores y Certificados
- [ ] App ID creado
- [ ] Bundle ID configurado
- [ ] Certificado de distribución creado
- [ ] Provisioning profile creado
- [ ] Capabilities configuradas

### Información de la App
- [ ] Nombre definido
- [ ] Subtítulo definido
- [ ] Descripción completa
- [ ] Categorías seleccionadas
- [ ] Keywords agregadas
- [ ] Precio: Gratis

### Assets
- [ ] Icono de app (1024x1024)
- [ ] Screenshots iPhone 6.7"
- [ ] Screenshots iPhone 6.5"
- [ ] Screenshots iPhone 5.5"
- [ ] Screenshots iPad Pro 12.9"
- [ ] Video promocional (opcional)

### Configuración Legal
- [ ] Política de privacidad publicada
- [ ] Información de privacidad completada
- [ ] Licencia: Propietaria
- [ ] Derechos de autor: © 2027 Plataforma Electoral

### Build
- [ ] Build generado exitosamente
- [ ] Build subido a App Store Connect
- [ ] Build procesado (sin errores)

---

## ⏱️ Timelines

| Actividad | Tiempo Estimado |
|-----------|-----------------|
| Crear Apple ID | 15 minutos |
| Configurar 2FA | 10 minutos |
| Solicitar D-U-N-S | 1-5 días |
| Verificación Apple | 24-48 horas |
| Crear certificados | 30 minutos |
| Preparar assets | 2-4 horas |
| Generar build | 15-20 minutos |
| Subir a App Store | 10 minutos |
| Revisión por Apple | 1-3 días |
| **TOTAL** | **5-10 días** |

---

## 🆘 Troubleshooting

### "No puedo activar 2FA"
- Requiere dispositivo Apple físico (iPhone/iPad/Mac)
- Actualizar a iOS/macOS más reciente
- Ir a Ajustes → [Tu Nombre] → Contraseña y seguridad

### "El D-U-N-S Number no es reconocido"
- Verificar en: https://developer.apple.com/enroll/duns-lookup
- Esperar 1-5 días después de solicitarlo
- Contactar D&B si hay problemas

### "La verificación de organización falló"
- Verificar documentos estén vigentes
- Asegurar que el nombre coincida exactamente
- Subir documentos claros y legibles
- Contactar soporte de Apple

### "El build fue rechazado"
- Leer email de rechazo detalladamente
- Corregir problemas indicados
- Reenviar build
- Usar "Reply" en el mensaje de rechazo si hay dudas

### "Provisioning profile no válido"
- Regenerar perfil en developer.apple.com
- Descargar e instalar nuevamente
- Verificar que el certificado no haya expirado

---

## 📞 Contacto de Soporte

**Apple Developer Support:**
- Centro de ayuda: https://developer.apple.com/support
- Contacto: https://developer.apple.com/contact
- Teléfono: Varía por país
- Foros: https://developer.apple.com/forums

**D-U-N-S Support:**
- Web: https://www.dnb.com/duns-number.html
- Teléfono Colombia: +57 1 [número local]

---

**Documento creado:** 20 Agosto 2026  
**Actualizado:** Agosto 2026  
**Versión:** 1.0
