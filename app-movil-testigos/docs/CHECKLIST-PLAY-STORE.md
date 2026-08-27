# Checklist Publicación - Google Play Store

## Información de la Publicación

**App:** Testigos Electorales  
**Versión:** 1.0.0  
**Fecha de publicación:** ___/___/______  
**Responsable:** ___________________

---

## ✅ Pre-Publicación

### 1. Cuenta Developer

- [ ] Cuenta de Google creada
- [ ] Pago de $25 USD realizado
- [ ] Identidad verificada
- [ ] Acceso a Google Play Console

### 2. Aplicación Creada en Play Console

- [ ] App creada en Play Console
- [ ] Idioma predeterminado: Español
- [ ] Tipo: Aplicación
- [ ] Precio: Gratis

### 3. Información de la Tienda

- [ ] **Título** (50 caracteres):
  ```
  Testigos Electorales - Preconteo
  ```

- [ ] **Descripción corta** (80 caracteres):
  ```
  App oficial para testigos electorales en Colombia. Registre actas offline.
  ```

- [ ] **Descripción completa** (4000 caracteres):
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

- [ ] **Categoría:** Herramientas / Utilidades

- [ ] **Etiquetas:**
  ```
  elecciones, preconteo, votación, testigos, colombia, actas, escrutinio, democracia
  ```

- [ ] **Contacto del desarrollador:**
  - Sitio web: https://plataformaelectoral.com
  - Email: soporte@plataformaelectoral.com
  - Teléfono: +57 ___-___-____

### 4. Assets Gráficos

- [ ] **Icono de app** (512 x 512 px, PNG/JPEG, transparente)
  - Archivo: `assets/icon-512.png`
  - Ubicado en: `app-movil-testigos/assets/`

- [ ] **Feature graphic** (1024 x 500 px, PNG/JPEG)
  - Archivo: `assets/feature-graphic.png`
  - Sin transparencia
  - Fondo color primario (#2563eb)

- [ ] **Video promocional** (opcional):
  - URL de YouTube: ___________________
  - Duración: ___ segundos

### 5. Screenshots

**Teléfono (mínimo 2, máximo 8):**

- [ ] Screenshot 1 - Login
  - Resolución: 1080 x 1920 (o similar)
  - Archivo: `screenshot-phone-1.png`

- [ ] Screenshot 2 - Dashboard
  - Resolución: 1080 x 1920
  - Archivo: `screenshot-phone-2.png`

- [ ] Screenshot 3 - Formulario de acta
  - Resolución: 1080 x 1920
  - Archivo: `screenshot-phone-3.png`

- [ ] Screenshot 4 - Cámara
  - Resolución: 1080 x 1920
  - Archivo: `screenshot-phone-4.png`

- [ ] Screenshot 5 - Lista de pendientes
  - Resolución: 1080 x 1920
  - Archivo: `screenshot-phone-5.png`

**Tablet 7" (opcional):**
- [ ] ___ screenshots subidos

**Tablet 10" (opcional):**
- [ ] ___ screenshots subidos

### 6. Configuración Técnica

- [ ] Keystore generado (`preconteo-keystore.jks`)
- [ ] Contraseña del keystore guardada en lugar seguro
- [ ] Keystore subido a EAS
- [ ] AAB generado exitosamente
- [ ] AAB verificado (tamaño, versión, firma)

### 7. Políticas y Cumplimiento

- [ ] **Política de privacidad** publicada en:
  ```
  https://plataformaelectoral.com/privacidad
  ```

- [ ] **Declaración de permisos completada:**
  - Cámara: ✅ "Capturar evidencias fotográficas de actas electorales"
  - Ubicación: ✅ "Mostrar mesas de votación cercanas"
  - Internet: ✅ "Sincronizar datos con el servidor"

- [ ] **Clasificación de contenido:** PEGI 3 / ESRB Everyone

- [ ] **Encuesta de clasificación de contenido completada**

- [ ] **Declaración de seguridad:**
  - ¿Encripta datos? Sí
  - ¿Contiene export control? No
  - ¿Es app COVID-19? No

- [ ] **Declaración de salud:** No es app de salud

- [ ] **Declaración de accesibilidad:** Etiquetas semánticas incluidas

### 8. Targets y Distribución

- [ ] **Países:**
  - [ ] Colombia (seleccionado)
  - [ ] Todos los países (si aplica)

- [ ] **Versión de Android:**
  - Mínimo: API 26 (Android 8.0)
  - Target: API 34 (Android 14)

---

## 📤 Proceso de Publicación

### 1. Generar Build

```bash
cd app-movil-testigos
npx eas build --platform android --profile production
```

- [ ] Build iniciado
- [ ] Build completado exitosamente
- [ ] AAB descargado
- [ ] Tamaño del AAB: ___ MB

### 2. Subir a Play Console

- [ ] Ir a Play Console → [App] → Producción
- [ ] Crear nueva versión
- [ ] Subir archivo AAB
- [ ] Revisar información del AAB:
  - Versión: 1.0.0 (1)
  - Target SDK: 34
  - Mínimo SDK: 26
  - Tamaño: ___ MB

### 3. Configurar Lanzamiento

- [ ] **Nombre de versión:** 1.0.0

- [ ] **Notas de la versión:**
  ```
  Versión inicial:
  - Registro de actas offline
  - Captura de evidencias fotográficas
  - Sincronización automática
  - Mapa de mesas de votación
  - Validaciones en tiempo real
  ```

- [ ] **Países:** Colombia (seleccionado)

- [ ] **Tipo de lanzamiento:**
  - [ ] Producción completa
  - [ ] Lanzamiento por fases (si aplica)

### 4. Revisión Final

- [ ] Revisar toda la información de la tienda
- [ ] Verificar que todos los assets están subidos
- [ ] Confirmar que la política de privacidad está vigente
- [ ] Revisar que los permisos están justificados
- [ ] Verificar que el AAB está correcto

---

## 🚀 Enviar a Revisión

- [ ] Click en "Enviar para revisión"
- [ ] Confirmar envío
- [ ] Guardar número de seguimiento si aplica
- [ ] Fecha de envío: ___/___/______

---

## ⏱️ Seguimiento

### Timeline Esperado

| Etapa | Tiempo Estimado | Fecha |
|-------|-----------------|-------|
| Envío a revisión | Día 0 | ___/___/______ |
| En revisión | 1-7 días | ___/___/______ |
| Aprobación/Rechazo | Variable | ___/___/______ |
| Publicación | Inmediata tras aprobación | ___/___/______ |

### Estados de Revisión

- [ ] Pendiente
- [ ] En revisión
- [ ] Aprobada
- [ ] Rechazada (si aplica, ver notas)

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

- [ ] App publicada en Play Store
- [ ] URL de la app: ___________________
- [ ] Anunciado a stakeholders
- [ ] Documentación actualizada
- [ ] Backup de keystore verificado

---

## 📞 Contactos

**Google Play Developer Support:**
- URL: https://support.google.com/googleplay/android-developer
- Email de soporte: [A través de Play Console]

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
