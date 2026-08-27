# Guía de Registro - Google Play Developer

## 📋 Información General

**URL:** https://play.google.com/console  
**Costo:** $25 USD (pago único, no recurrente)  
**Tiempo de aprobación:** Inmediato después del pago  
**Requisitos:** Cuenta de Google, tarjeta de crédito/débito

---

## 🚀 Proceso de Registro Paso a Paso

### Paso 1: Crear Cuenta de Google

Si no tienes una cuenta de Google:
1. Ve a https://accounts.google.com/signup
2. Completa el formulario con:
   - Nombre: [Nombre del representante legal]
   - Apellido: [Apellido]
   - Nombre de usuario: [organizacion]@[dominio].com
   - Contraseña: [segura]
3. Verifica teléfono
4. Acepta términos de servicio

**Para organizaciones:**
- Usar correo corporativo si existe
- O crear cuenta específica: `desarrollo@plataformaelectoral.com`

---

### Paso 2: Acceder a Google Play Console

1. Ve a https://play.google.com/console
2. Inicia sesión con la cuenta de Google
3. Lee y acepta el Acuerdo de Distribución de Google Play
4. Haz clic en "Crear cuenta de desarrollador"

---

### Paso 3: Información de la Cuenta

Completa la información del desarrollador:

**Nombre del desarrollador:**
```
Plataforma Electoral Colombia
```

**Nombre completo:**
```
[Representante legal de la organización]
```

**Dirección:**
```
Dirección física de la organización
Ciudad, Departamento, Colombia
```

**Teléfono:**
```
+57 [Número de contacto]
```

**Sitio web:**
```
https://plataformaelectoral.com
```

---

### Paso 4: Verificación de Identidad

Google requiere verificación de identidad:

**Documentos aceptados:**
- ✅ Cédula de ciudadanía (Colombia)
- ✅ Pasaporte
- ✅ Cédula de extranjería
- ✅ Licencia de conducir

**Proceso:**
1. Seleccionar tipo de documento
2. Subir foto del documento (frente y reverso)
3. Tomar selfie en vivo
4. Esperar verificación (minutos a horas)

**Nota:** La dirección en el documento debe coincidir con la proporcionada.

---

### Paso 5: Pago de Tarifa

**Monto:** $25 USD  
**Métodos de pago:**
- Tarjeta de crédito (Visa, Mastercard, Amex)
- Tarjeta de débito
- Google Pay (si está disponible)

**Proceso:**
1. Ingresar datos de la tarjeta
2. Confirmar pago
3. Guardar recibo/factura

**Facturación:**
- El pago se hace a Google LLC
- Es un cargo único, no recurrente
- No es reembolsable

---

### Paso 6: Configuración Inicial

Una vez aprobado:

**1. Configurar notificaciones:**
- Ir a Configuración → Preferencias de correo
- Habilitar: Revisiones, Estadísticas, Alertas de políticas
- Email: desarrollo@plataformaelectoral.com

**2. Configurar usuarios adicionales:**
- Ir a Usuarios y permisos
- Invitar:
  - Administradores (acceso total)
  - Desarrolladores (subir builds)
  - Marketing (ver estadísticas)

**3. Configurar cuenta de pago (si aplica):**
- Ir a Configuración → Perfiles de pago
- Configurar cuenta bancaria para pagos
- Nota: Si la app es gratuita, esto es opcional

---

## 📱 Crear Aplicación

### Paso 1: Información de la App

1. Haz clic en "Crear aplicación"
2. Seleccionar idioma predeterminado: **Español**
3. Nombre de la app: **Testigos Electorales**
4. Tipo de aplicación: **Aplicación**
5. Precio: **Gratis**
6. Declaraciones:
   - ✅ Contiene publicidad: NO
   - ✅ App de prueba: NO

### Paso 2: Configuración de la Tienda

**Título (50 caracteres):**
```
Testigos Electorales - Preconteo
```

**Descripción corta (80 caracteres):**
```
App oficial para testigos electorales en Colombia. Registre actas offline.
```

**Descripción completa (4000 caracteres):**
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

### Paso 3: Gráficos

**Icono de aplicación:**
- Tamaño: 512 x 512 px
- Formato: PNG o JPEG
- Fondo: Transparente
- Archivo: `icon-512.png`

**Imagen de portada (Feature Graphic):**
- Tamaño: 1024 x 500 px
- Formato: PNG o JPEG
- Sin transparencia
- Archivo: `feature-graphic.png`

**Video promocional (opcional):**
- URL de YouTube
- Duración: 30-120 segundos

### Paso 4: Categorización

**Tipo de aplicación:** Aplicación

**Categoría:** Herramientas / Utilidades

**Etiquetas:**
```
elecciones, preconteo, votación, testigos, colombia, actas, escrutinio, democracia
```

**Contacto del desarrollador:**
- Sitio web: https://plataformaelectoral.com
- Email: soporte@plataformaelectoral.com
- Teléfono: +57 [número]

**Dirección:**
```
[Calle/Carrera]
[Ciudad], [Departamento]
Colombia
```

---

## 🔐 Configurar Firma de App

### Paso 1: Generar Keystore

```bash
# Navegar al directorio de credenciales
cd app-movil-testigos/credentials

# Generar keystore
keytool -genkey -v \
  -keystore preconteo-keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias preconteo

# Datos a ingresar:
# Contraseña del keystore: [guardar en lugar seguro]
# Nombre y apellido: Plataforma Electoral
# Nombre de la unidad organizativa: Desarrollo
# Nombre de la organización: Plataforma Electoral Colombia
# Nombre de la ciudad: Bogotá
# Nombre del estado: Cundinamarca
# Código de país: CO
# ¿Es correcto?: SI
```

**⚠️ IMPORTANTE:**
- Guardar el archivo `preconteo-keystore.jks` en lugar seguro
- Recordar la contraseña (no se puede recuperar)
- Si se pierde, NO se pueden actualizar la app
- Hacer backup en múltiples ubicaciones seguras

### Paso 2: Subir Keystore a EAS

```bash
# Configurar credenciales en EAS
cd app-movil-testigos
npx eas credentials

# Seleccionar:
# - Platform: Android
# - Build profile: production
# - Keystore: Importar existente
# - Subir archivo: preconteo-keystore.jks
# - Ingresar contraseña
```

### Paso 3: Configurar en Play Console (App Signing)

1. Ir a Play Console → [App] → Configuración → Integridad de la app
2. Seleccionar "Google gestiona la firma de la app"
3. Subir el AAB generado
4. Google re-firmará automáticamente

**Beneficios del App Signing de Google:**
- ✅ Google gestiona la clave de firma
- ✅ Se puede perder el keystore original
- ✅ Google Play requiere esto para AAB
- ✅ Permite optimizaciones de entrega

---

## 📤 Subir Aplicación

### Paso 1: Generar Build

```bash
cd app-movil-testigos

# Generar AAB de producción
npx eas build --platform android --profile production

# Esperar a que complete (5-15 minutos)
# Descargar el AAB desde el enlace proporcionado
```

### Paso 2: Subir a Play Console

1. Ir a Play Console → [App] → Producción
2. Crear versión nueva
3. Subir archivo AAB
4. Revisar la información:
   - Versión: 1.0.0 (1)
   - API target: Android 14 (API 34)
   - Tamaño: ~XX MB

### Paso 3: Configurar Lanzamiento

**Países disponibles:**
- Seleccionar: **Colombia** (o todos si aplica)

**Tipo de lanzamiento:**
- Producción completa

**Versiones:**
- Nombre de versión: 1.0.0
- Notas de la versión:
```
Versión inicial:
- Registro de actas offline
- Captura de evidencias fotográficas
- Sincronización automática
- Mapa de mesas
- Validaciones en tiempo real
```

---

## ✅ Checklist Pre-Publicación

### Cuenta Developer
- [ ] Cuenta Google creada
- [ ] Pago de $25 USD realizado
- [ ] Identidad verificada
- [ ] Notificaciones configuradas
- [ ] Usuarios adicionales invitados

### Información de la App
- [ ] Título definido
- [ ] Descripción corta y larga completas
- [ ] Categoría seleccionada
- [ ] Etiquetas agregadas
- [ ] Contacto configurado

### Assets
- [ ] Icono de app (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots de teléfono (2-8)
- [ ] Screenshots de tablet (opcional)

### Configuración Técnica
- [ ] Keystore generado y guardado
- [ ] Keystore subido a EAS
- [ ] AAB generado exitosamente
- [ ] AAB subido a Play Console

### Políticas y Cumplimiento
- [ ] Política de privacidad publicada
- [ ] Declaración de permisos completada
- [ ] Clasificación de contenido realizada
- [ ] Declaración de seguridad completada

---

## 📋 Políticas y Requisitos

### Política de Privacidad

**Requisito:** Obligatorio  
**URL:** https://plataformaelectoral.com/privacidad

**Contenido mínimo:**
- Qué datos se recolectan
- Cómo se usan los datos
- Con quién se comparten
- Cómo proteger los datos
- Cómo contactar para ejercer derechos

### Permisos Declarados

En Play Console, declarar:

**CÁMARA:**
- Propósito: "Capturar evidencias fotográficas de actas electorales"
- Obligatorio: Sí

**UBICACIÓN:**
- Propósito: "Mostrar mesas de votación cercanas"
- Obligatorio: No (opcional)

**INTERNET:**
- Propósito: "Sincronizar datos con el servidor"
- Obligatorio: Sí

### Clasificación de Contenido

**Categoría:** PEGI 3 / ESRB Everyone  
**Contenido:** Aplicación de herramientas/utilidades  
**Interactivo:** No contiene interacciones sociales

---

## ⏱️ Timelines

| Actividad | Tiempo Estimado |
|-----------|-----------------|
| Crear cuenta Google | 10 minutos |
| Pago y verificación | Inmediato - 24 horas |
| Crear aplicación | 30 minutos |
| Preparar assets | 2-4 horas |
| Configurar keystore | 15 minutos |
| Generar AAB | 10-15 minutos |
| Subir a Play Console | 5 minutos |
| Revisión por Google | 1-7 días |
| **TOTAL** | **2-5 días** |

---

## 🆘 Troubleshooting

### "La verificación de identidad falló"
- Verificar que el documento esté vigente
- Asegurar buena iluminación en la selfie
- Intentar con otro tipo de documento
- Contactar soporte de Google

### "El keystore fue rechazado"
- Verificar formato JKS
- Verificar contraseña correcta
- Generar nuevo keystore si es necesario

### "El AAB no pasa validación"
- Verificar versión mínima de Android (API 26)
- Verificar target SDK (API 34)
- Verificar firma del AAB
- Revisar logs de error

### "La app fue rechazada"
- Leer email de rechazo detalladamente
- Corregir problemas indicados
- Reenviar para revisión
- Contactar soporte si no está claro

---

## 📞 Contacto de Soporte

**Google Play Developer Support:**
- Centro de ayuda: https://support.google.com/googleplay/android-developer
- Contacto: A través de Play Console
- Comunidad: https://support.google.com/googleplay/android-developer/community

---

**Documento creado:** 20 Agosto 2026  
**Actualizado:** Agosto 2026  
**Versión:** 1.0
