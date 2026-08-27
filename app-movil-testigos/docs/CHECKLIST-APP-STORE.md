# Checklist Publicación - Apple App Store

## Información de la Publicación

**App:** Testigos Electorales  
**Bundle ID:** com.plataformaelectoral.testigos  
**Versión:** 1.0.0 (1)  
**Fecha de publicación:** ___/___/______  
**Responsable:** ___________________

---

## ✅ Pre-Publicación

### 1. Cuenta Developer

- [ ] Apple ID creado
- [ ] Autenticación de dos factores (2FA) activada
- [ ] Apple Developer Program inscrito
- [ ] Pago de $99 USD realizado
- [ ] Verificación de identidad completada
- [ ] Acceso a App Store Connect

### 2. D-U-N-S Number (para organizaciones)

- [ ] D-U-N-S Number solicitado: ___________________
- [ ] D-U-N-S Number recibido: ___________________
- [ ] Verificado en Apple Developer: Sí

### 3. App Creada en App Store Connect

- [ ] App creada en App Store Connect
- [ ] Plataforma: iOS
- [ ] Nombre: Testigos Electorales
- [ ] Idioma primario: Español
- [ ] Bundle ID: com.plataformaelectoral.testigos
- [ ] SKU: PRECONTEO-2026-001

### 4. Información de la App

- [ ] **Subtítulo** (30 caracteres):
  ```
  Sistema de Preconteo Electoral
  ```

- [ ] **Categoría primaria:** Utilidades

- [ ] **Categoría secundaria:** Productividad (opcional)

- [ ] **Licencia:** Propietaria

- [ ] **Precio:** Gratis

- [ ] **Disponibilidad:** Colombia

- [ ] **Descripción:**
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

- [ ] **Palabras clave** (100 caracteres):
  ```
  elecciones, preconteo, votación, testigos, colombia, actas, escrutinio, democracia
  ```

- [ ] **URL de soporte:** https://plataformaelectoral.com/soporte

- [ ] **URL de marketing:** https://plataformaelectoral.com/testigos

- [ ] **Derechos de autor:** © 2027 Plataforma Electoral Colombia

### 5. Información de Privacidad

- [ ] **Declaración de privacidad completada**

- [ ] **Datos recolectados declarados:**
  - Ubicación precisa: ✅ Mostrar mesas cercanas
  - Fotos: ✅ Evidencias de actas
  - Identificadores de dispositivo: ✅ Analytics
  - Datos de uso: ✅ Mejoras

- [ ] **Rastreo:** No se usa para rastreo

- [ ] **URL de política de privacidad:**
  ```
  https://plataformaelectoral.com/privacidad
  ```

### 6. Assets Gráficos

- [ ] **Icono de app** (1024 x 1024 px, JPG/PNG)
  - Sin transparencia
  - Sin esquinas redondeadas
  - Archivo: `app-icon-1024.jpg`

- [ ] **Screenshots iPhone 6.7"** (1290 x 2796)
  - [ ] Screenshot 1: Login
  - [ ] Screenshot 2: Dashboard
  - [ ] Screenshot 3: Formulario
  - [ ] Screenshot 4 (opcional)
  - [ ] Screenshot 5 (opcional)

- [ ] **Screenshots iPhone 6.5"** (1242 x 2688)
  - [ ] Screenshot 1
  - [ ] Screenshot 2
  - [ ] Screenshot 3

- [ ] **Screenshots iPhone 5.5"** (1242 x 2208)
  - [ ] Screenshot 1
  - [ ] Screenshot 2
  - [ ] Screenshot 3

- [ ] **Screenshots iPad Pro 12.9"** (2048 x 2732) - Opcional
  - [ ] Screenshot 1
  - [ ] Screenshot 2

- [ ] **Video promocional** (opcional)
  - Formato: H.264
  - Resolución: 1920x1080
  - Duración: ___ segundos

### 7. Certificados y Perfiles

- [ ] **Certificate Signing Request (CSR)** generado
  - Archivo: `CertificateSigningRequest.certSigningRequest`

- [ ] **Certificado de distribución** creado
  - Tipo: Apple Distribution
  - Descargado e instalado en Keychain

- [ ] **App ID** creado
  - Bundle ID: com.plataformaelectoral.testigos
  - Capabilities configuradas:
    - [ ] Push Notifications
    - [ ] Background Modes
    - [ ] Location

- [ ] **Provisioning Profile** creado
  - Tipo: App Store
  - Descargado: `Testigos_Electorales_App_Store.mobileprovision`
  - Instalado en Xcode

### 8. Build

- [ ] Build generado exitosamente con EAS
- [ ] Build subido a App Store Connect
- [ ] Build procesado (sin errores)
- [ ] Build seleccionada para revisión

---

## 📤 Proceso de Publicación

### 1. Generar Build

```bash
cd app-movil-testigos
npx eas build --platform ios --profile production
```

- [ ] Build iniciado
- [ ] Build completado exitosamente
- [ ] IPA listo para subir
- [ ] Tamaño del IPA: ___ MB

### 2. Subir a App Store Connect

**Opción A: EAS Submit (recomendado)**
```bash
npx eas submit --platform ios
```

**Opción B: Transporter App**
- [ ] Descargar Transporter desde Mac App Store
- [ ] Exportar IPA
- [ ] Arrastrar a Transporter
- [ ] Click en "Deliver"

- [ ] Build subido exitosamente
- [ ] Build procesado (puede tardar minutos)
- [ ] Build aparece en App Store Connect

### 3. Configurar en App Store Connect

- [ ] Ir a App Store Connect → [App] → App Store
- [ ] Seleccionar build subido
- [ ] Build asociada correctamente

### 4. Información de Revisión

- [ ] **Promotional Text** (170 caracteres):
  ```
  ¡Nueva versión! Mejor rendimiento offline, sincronización más rápida y soporte multicliente.
  ```

- [ ] **Notas para el revisor:**
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

- [ ] **Información de contacto:**
  - Nombre: ___________________
  - Email: desarrollo@plataformaelectoral.com
  - Teléfono: +57 ___-___-____

- [ ] **Información de demostración:**
  - Usuario: demo@testigo.com
  - Contraseña: Demo123!

- [ ] **Información de notas:**
  ```
  Versión inicial:
  - Registro de actas offline
  - Captura de evidencias fotográficas
  - Sincronización automática
  - Mapa de mesas de votación
  - Validaciones en tiempo real
  ```

### 5. Revisión Final

- [ ] Revisar toda la información de la app
- [ ] Verificar que todos los screenshots están subidos
- [ ] Confirmar que la política de privacidad está vigente
- [ ] Verificar información de privacidad completa
- [ ] Confirmar que el build está correcto
- [ ] Revisar notas para el revisor

---

## 🚀 Enviar a Revisión

- [ ] Click en "Submit for Review"
- [ ] Confirmar envío
- [ ] Fecha de envío: ___/___/______

---

## ⏱️ Seguimiento

### Timeline Esperado

| Etapa | Tiempo Estimado | Fecha |
|-------|-----------------|-------|
| Envío a revisión | Día 0 | ___/___/______ |
| En cola | 1-2 días | ___/___/______ |
| En revisión | 1-3 días | ___/___/______ |
| Aprobación/Rechazo | Variable | ___/___/______ |
| Publicación | Inmediata tras aprobación | ___/___/______ |

### Estados de Revisión

- [ ] Prepare for Submission
- [ ] Waiting for Review
- [ ] In Review
- [ ] Pending Developer Release
- [ ] Ready for Sale
- [ ] Rejected (si aplica, ver notas)

---

## 📝 Notas y Observaciones

```












```

---

## 🐛 Si es Rechazada

### Razón del Rechazo:
```






```

### Acciones Correctivas:
```






```

### Fecha de Reenvío: ___/___/______

---

## ✅ Post-Publicación

- [ ] App publicada en App Store
- [ ] URL de la app: ___________________
- [ ] Anunciado a stakeholders
- [ ] Documentación actualizada
- [ ] Certificados backup verificado

---

## 📞 Contactos

**Apple Developer Support:**
- URL: https://developer.apple.com/support
- Contacto: https://developer.apple.com/contact

**Equipo Interno:**
- Dev Lead: ___________________
- QA Lead: ___________________
- Product Owner: ___________________

---

## Sign-off

**Preparado por:** ___________________ **Fecha:** ___/___/______

**Revisado por:** ___________________ **Fecha:** ___/___/______

**Aprobado por:** ___________________ **Fecha:** ___/___/______

---

**Documento versión:** 1.0  
**Actualizado:** Agosto 2026
