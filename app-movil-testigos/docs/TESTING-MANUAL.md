# Guía de Testing Manual - Dispositivos Físicos

## 📱 Preparación del Entorno

### Requisitos Previos

1. **Dispositivos Físicos:**
   - Al menos 1 dispositivo Android (Android 10+)
   - Al menos 1 dispositivo iOS (iOS 14+)
   - Cargadores disponibles
   - Conexión a internet (WiFi/Datos)

2. **Instalación de Builds:**

#### Android - Instalar APK
```bash
# Opción 1: ADB
adb install app-release.apk

# Opción 2: Transferencia directa
# 1. Copiar APK al dispositivo
# 2. Abrir archivo en dispositivo
# 3. Permitir instalación de fuentes desconocidas
# 4. Instalar
```

#### iOS - Instalar vía TestFlight
```
1. Recibir invitación por email
2. Instalar TestFlight desde App Store
3. Abrir enlace de invitación
4. Aceptar invitación
5. Instalar app desde TestFlight
```

### Configuración Inicial

1. **Habilitar opciones de desarrollador:**
   - Android: Ajustes → Acerca del teléfono → Número de compilación (tocar 7 veces)
   - iOS: No requiere para testing manual

2. **Herramientas útiles:**
   - Instalar app de grabación de pantalla
   - Configurar acceso rápido a capturas de pantalla
   - Habilitar logcat (Android) o Console (iOS)

---

## 🧪 Escenarios de Testing en Campo

### Escenario Real 1: Día de Elecciones (Simulado)

**Contexto:** Testigo en mesa de votación

**Preparación:**
- App instalada y autenticada
- Mesa asignada: 12345
- Elección: Presidenciales 2026

**Flujo Completo:**

1. **Llegada a la mesa (7:00 AM)**
   ```
   - Abrir app
   - Verificar conexión (puede ser mala)
   - Confirmar datos de mesa
   - Verificar lista de candidatos cargada
   ```

2. **Apertura de mesa (8:00 AM)**
   ```
   - App en modo standby
   - Batería al 100%
   - Notificaciones activadas
   ```

3. **Durante la jornada (8:00 AM - 4:00 PM)**
   ```
   - App en background
   - Verificar que no consume batería excesiva
   - Recibir notificaciones si hay alertas
   ```

4. **Cierre de mesa (4:00 PM)**
   ```
   - Abrir app
   - Navegar a "Nueva Acta"
   - Seleccionar elección: Presidenciales
   - Seleccionar cargo: Presidente
   - Ingresar mesa: 12345
   - Ingresar total votantes: 300
   - Ingresar boletas entregadas: 300
   ```

5. **Registro de votos**
   ```
   - Ingresar votos por cada candidato
   - Verificar que suma = total
   - Ingresar votos en blanco
   - Ingresar votos nulos
   - Verificar totales
   ```

6. **Evidencia fotográfica**
   ```
   - Tap "Agregar Foto"
   - Capturar acta física
   - Verificar claridad de imagen
   - Confirmar foto
   - Agregar foto adicional si es necesario
   ```

7. **Guardado y sincronización**
   ```
   - Tap "Guardar Acta"
   - Verificar mensaje de confirmación
   - Si hay conexión: esperar sincronización
   - Si no hay conexión: verificar guardado local
   ```

8. **Verificación final**
   ```
   - Ir a "Pendientes"
   - Verificar acta en lista
   - Verificar estado: "Enviada" o "Pendiente"
   - Si pendiente: intentar sincronización manual
   ```

---

### Escenario Real 2: Zona Sin Cobertura

**Contexto:** Mesa en zona rural sin señal

**Preparación:**
- App con datos cacheados (candidatos, elecciones)
- Modo avión activado (simular sin cobertura)

**Pruebas:**

1. **Autenticación offline**
   ```
   - Cerrar sesión
   - Intentar login sin conexión
   - Verificar que permite login con credenciales cacheadas
   ```

2. **Registro múltiple offline**
   ```
   - Registrar 5-10 actas en modo offline
   - Verificar almacenamiento en SQLite
   - Verificar que fotos se guardan localmente
   ```

3. **Persistencia de datos**
   ```
   - Cerrar app completamente
   - Reabrir app
   - Verificar que todas las actas persisten
   ```

4. **Sincronización al recuperar señal**
   ```
   - Desactivar modo avión
   - Esperar 30 segundos
   - Verificar que sync automático inicia
   - Verificar notificaciones de éxito/error
   - Verificar que actas se marcan como "Enviadas"
   ```

---

### Escenario Real 3: Conexión Intermitente

**Contexto:** Señal débil e inestable

**Simulación:**
- Activar/desactivar modo avión cada 2-3 minutos
- O usar app en zona de transición (entrada/salida de edificio)

**Pruebas:**

1. **Sync con interrupciones**
   ```
   - Iniciar sincronización de acta grande
   - Perder conexión a mitad del proceso
   - Verificar manejo de error
   - Verificar que acta no se pierde
   - Recuperar conexión
   - Verificar reintento automático
   ```

2. **Manejo de errores**
   ```
   - Forzar timeout (esperar 30 seg sin respuesta)
   - Verificar mensaje de error amigable
   - Verificar opción de reintentar
   - Verificar que no hay crash
   ```

---

## 📊 Métricas a Registrar

### Performance

| Métrica | Método de Medición | Objetivo |
|---------|-------------------|----------|
| Tiempo de inicio | Cronómetro desde tap hasta dashboard | < 2 segundos |
| Tiempo carga formulario | Cronómetro desde tap "Nueva Acta" | < 1 segundo |
| Tiempo guardado | Cronómetro desde tap "Guardar" hasta confirmación | < 3 segundos |
| Tiempo sync | Cronómetro desde inicio sync hasta completado | < 10 segundos |
| FPS scroll | Observación visual | Fluido, sin lag |

### Recursos

| Métrica | Método de Medición | Objetivo |
|---------|-------------------|----------|
| Uso memoria | Settings → Developer → Memory | < 150MB |
| Consumo batería | Settings → Battery | < 10%/hora uso activo |
| Tamaño app | Settings → Storage | < 100MB |
| Datos móviles | Settings → Data Usage | < 10MB por día |

---

## 🐛 Reporte de Bugs

### Template de Bug Report

```markdown
## Bug Report

**ID:** BUG-001
**Fecha:** DD/MM/YYYY
**Reportero:** Nombre
**Dispositivo:** Samsung Galaxy S23
**OS:** Android 14
**App Version:** 1.0.0 (Build 123)

### Descripción
Descripción clara y concisa del problema.

### Pasos para Reproducir
1. Paso 1
2. Paso 2
3. Paso 3

### Resultado Esperado
Qué debería pasar.

### Resultado Actual
Qué pasa realmente.

### Evidencia
- Screenshot: [adjuntar]
- Video: [adjuntar]
- Logs: [adjuntar]

### Severidad
☐ Crítico (app crashea, datos perdidos)
☐ Alto (funcionalidad principal no opera)
☐ Medio (workaround disponible)
☐ Bajo (cosmético)

### Frecuencia
☐ Siempre (100%)
☐ Frecuente (>50%)
☐ Ocasional (<50%)
☐ Una vez (no reproducible)

### Notas Adicionales
Cualquier información extra relevante.
```

### Severidad

**CRÍTICO:**
- App crashea inesperadamente
- Datos de actas se pierden
- Funcionalidad principal completamente rota
- Bloqueo total del flujo

**ALTO:**
- No se pueden guardar actas
- Sincronización no funciona
- Login no opera
- Error impide uso de feature importante

**MEDIO:**
- Workaround disponible
- UX degradada pero funcional
- Error recoverable por usuario
- Feature secundario no opera

**BAJO:**
- Problemas visuales menores
- Typos en textos
- Issues de layout en casos edge
- Mejoras cosméticas

---

## 📋 Checklist de Dispositivos

### Pre-Testing

- [ ] Dispositivo cargado al 100%
- [ ] App instalada correctamente
- [ ] Credenciales de prueba disponibles
- [ ] Backend accesible
- [ ] Cámara funcional
- [ ] Ubicación habilitada
- [ ] Notificaciones permitidas
- [ ] Checklist impresa/digital
- [ ] Formato de bug reports listo

### Post-Testing

- [ ] Todas las pruebas ejecutadas
- [ ] Bugs documentados
- [ ] Métricas registradas
- [ ] Screenshots/videos guardados
- [ ] Dispositivo restablecido (si es necesario)
- [ ] Reporte enviado

---

## 🔧 Troubleshooting Común

### Problema: App no instala
**Android:**
- Verificar "Fuentes desconocidas" habilitado
- Verificar APK firmado correctamente
- Limpiar caché de instalador de paquetes

**iOS:**
- Verificar perfil de desarrollador confiado
- Verificar que UDID está registrado
- Reinstalar desde TestFlight

### Problema: Crash al iniciar
- Verificar logs con `adb logcat` (Android)
- Verificar crash logs en Xcode (iOS)
- Verificar que API URL es accesible
- Limpiar datos de app y reintentar

### Problema: Sync no funciona
- Verificar conexión a internet
- Verificar que backend responde
- Verificar JWT token no expirado
- Revisar logs de red en Flipper/Reactotron

### Problema: Cámara no abre
- Verificar permisos concedidos
- Verificar que no hay otra app usando cámara
- Reiniciar dispositivo
- Reinstalar app

---

## 📞 Contacto y Soporte

**Durante Testing:**
- **Dev Team:** dev@plataformaelectoral.com
- **QA Lead:** qa@plataformaelectoral.com
- **Slack:** #testing-mobile

**Emergencias:**
- **On-Call:** +57 300 123 4567

---

## ✅ Sign-off

**Tester:** _________________________ **Fecha:** _______

**Dispositivos probados:**
- [ ] Android: ___________________
- [ ] iOS: ___________________

**Resultado Global:**
☐ TODAS LAS PRUEBAS PASS
☐ APROBADO CON OBSERVACIONES (ver bugs)
☐ RECHAZADO (bloqueantes encontrados)

**Notas:**
```



```

---

**Documento versión:** 1.0  
**Actualizado:** 13 Agosto 2026
