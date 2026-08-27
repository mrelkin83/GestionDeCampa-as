# Testing en Dispositivos Reales - App Nativa

## 📋 Plan de Testing Semana 14

**Fecha:** 13-19 Agosto 2026  
**Objetivo:** Validar funcionalidad completa en dispositivos físicos  
**Cobertura:** Android e iOS

---

## 🎯 Alcance del Testing

### Dispositivos Objetivo

#### Android
| Dispositivo | Versión | Pantalla | Prioridad |
|-------------|---------|----------|-----------|
| Samsung Galaxy S23 | Android 14 | 6.1" | Alta |
| Samsung Galaxy A54 | Android 13 | 6.4" | Alta |
| Xiaomi Redmi Note 12 | Android 13 | 6.67" | Media |
| Motorola G73 | Android 13 | 6.5" | Media |
| Google Pixel 7 | Android 14 | 6.3" | Alta |

#### iOS
| Dispositivo | Versión | Pantalla | Prioridad |
|-------------|---------|----------|-----------|
| iPhone 15 Pro | iOS 17 | 6.1" | Alta |
| iPhone 14 | iOS 17 | 6.1" | Alta |
| iPhone 13 | iOS 16 | 6.1" | Media |
| iPhone SE (3rd) | iOS 17 | 4.7" | Media |
| iPad Pro 12.9" | iPadOS 17 | 12.9" | Baja |

---

## 🧪 Tipos de Testing

### 1. Testing Funcional
**Objetivo:** Validar que todas las funcionalidades operan correctamente

**Áreas:**
- ✅ Login y autenticación
- ✅ Navegación entre pantallas
- ✅ Formulario de actas
- ✅ Captura de fotos
- ✅ Sincronización offline/online
- ✅ Mapa de mesas
- ✅ Gestión de pendientes

### 2. Testing de Usabilidad (UX)
**Objetivo:** Validar experiencia de usuario

**Criterios:**
- Tiempo de carga < 3 segundos
- Navegación intuitiva
- Feedback visual apropiado
- Mensajes de error claros
- Flujo sin bloqueos

### 3. Testing de Performance
**Objetivo:** Validar rendimiento bajo carga

**Métricas:**
- Tiempo de inicio: < 2 segundos
- Uso de memoria: < 150MB
- Uso de batería: < 5% por hora
- FPS: > 30 consistente

### 4. Testing Offline
**Objetivo:** Validar funcionamiento sin conexión

**Escenarios:**
- Registro de acta sin internet
- Almacenamiento en SQLite
- Sincronización al recuperar conexión
- Manejo de conflictos

### 5. Testing de Integración
**Objetivo:** Validar integración con backend

**Validaciones:**
- Autenticación JWT
- Sincronización de datos
- WebSockets (si aplica)
- Manejo de errores de red

---

## 📱 Escenarios de Testing

### Escenario 1: Registro Completo de Acta

**Precondiciones:**
- App instalada y autenticada
- Dispositivo con cámara funcional

**Pasos:**
1. Abrir app
2. Navegar a "Nuevo Acta"
3. Seleccionar elección y cargo
4. Ingresar número de mesa
5. Ingresar total votantes
6. Ingresar boletas entregadas
7. Ingresar votos por candidato
8. Tomar foto del acta
9. Guardar acta
10. Verificar en "Pendientes"

**Resultado Esperado:**
- Acta guardada en SQLite
- Foto adjunta correctamente
- Aparece en lista de pendientes
- Badge de contador actualizado

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 2: Sincronización Offline → Online

**Precondiciones:**
- App en modo offline
- Al menos 2 actas pendientes

**Pasos:**
1. Activar modo avión
2. Registrar nueva acta
3. Verificar guardado local
4. Desactivar modo avión
5. Esperar sincronización automática (máx 30 seg)
6. Verificar acta enviada

**Resultado Esperado:**
- Acta guardada localmente en offline
- Sincronización automática al reconectar
- Notificación de éxito
- Acta marcada como enviada

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 3: Manejo de Errores de Red

**Precondiciones:**
- Conexión intermitente

**Pasos:**
1. Intentar sincronizar con conexión débil
2. Verificar reintentos automáticos
3. Verificar mensaje de error amigable
4. Verificar estado "Error" en acta

**Resultado Esperado:**
- Reintentos automáticos (3 intentos)
- Mensaje claro de error
- Estado actualizado a "ERROR"
- Opción de reintentar manual

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 4: Captura de Evidencias

**Precondiciones:**
- Permisos de cámara concedidos

**Pasos:**
1. Abrir formulario de acta
2. Presionar "Agregar Foto"
3. Tomar foto del acta física
4. Verificar preview
5. Confirmar foto
6. Completar formulario
7. Guardar

**Resultado Esperado:**
- Cámara nativa se abre
- Foto se captura correctamente
- Preview visible antes de confirmar
- Foto se asocia al acta

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 5: Validaciones de Formulario

**Precondiciones:**
- En formulario de nueva acta

**Casos de Prueba:**

| Caso | Entrada | Esperado |
|------|---------|----------|
| Votos > Votantes | Votos: 150, Votantes: 100 | Error: "Votos exceden votantes" |
| Campos vacíos | Mesa vacía | Error: "Mesa requerida" |
| Valores negativos | Votos: -5 | Error: "Valor inválido" |
| Boletas < Votos | Boletas: 80, Votos: 100 | Advertencia: "Diferencia significativa" |
| Números decimales | Votos: 10.5 | Campo solo acepta enteros |

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 6: Navegación y UX

**Precondiciones:**
- App autenticada

**Pasos:**
1. Verificar tiempos de carga de pantallas
2. Probar navegación hacia atrás
3. Verificar persistencia de datos en formulario
4. Probar pull-to-refresh
5. Verificar feedback táctil

**Resultado Esperado:**
- Cada pantalla carga < 3 segundos
- Botón atrás funciona correctamente
- Datos se mantienen al navegar
- Pull-to-refresh actualiza datos
- Feedback visual en botones

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 7: Background Sync

**Precondiciones:**
- App en background
- Actas pendientes

**Pasos:**
1. Registrar acta
2. Minimizar app (background)
3. Esperar 15 minutos
4. Verificar notificación de sync
5. Abrir app
6. Verificar estado sincronizado

**Resultado Esperado:**
- Sincronización en background
- Notificación push de resultado
- Datos actualizados al abrir

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 8: Persistencia de Datos

**Precondiciones:**
- App con datos locales

**Pasos:**
1. Registrar varias actas
2. Cerrar app completamente
3. Reabrir app
4. Verificar datos persistidos
5. Verificar sesión mantenida

**Resultado Esperado:**
- Todas las actas visibles
- Sesión activa (si no expiró)
- SQLite intacto

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 9: Rendimiento con Datos Masivos

**Precondiciones:**
- 50+ actas registradas

**Pasos:**
1. Verificar tiempo de carga de lista
2. Scroll fluido en lista
3. Buscar acta específica
4. Verificar uso de memoria

**Métricas:**
- Lista carga: < 2 segundos
- Scroll: 60 FPS
- Memoria: < 150MB

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

### Escenario 10: Consumo de Batería

**Precondiciones:**
- Dispositivo con 100% batería

**Pasos:**
1. Usar app activamente por 1 hora
2. Registrar 10 actas
3. Tomar 10 fotos
4. Verificar consumo de batería

**Resultado Esperado:**
- Consumo: < 10% por hora de uso activo
- No hay fugas de batería en background

**Resultado de Prueba:**
- [ ] Android: PASS / FAIL
- [ ] iOS: PASS / FAIL

---

## 📝 Checklist de Testing

### Pre-Testing
- [ ] Dispositivos disponibles y cargados
- [ ] APK/IPA instalados
- [ ] Credenciales de prueba listas
- [ ] Backend accesible
- [ ] Checklist impresa/digital

### Testing Funcional
- [ ] Login funciona en ambos
- [ ] Todas las pantallas accesibles
- [ ] Formulario guarda correctamente
- [ ] Cámara captura fotos
- [ ] Offline mode funciona
- [ ] Sync automático funciona
- [ ] Validaciones correctas
- [ ] Errores manejados graceful

### Testing UX
- [ ] Tiempos de carga aceptables
- [ ] Navegación intuitiva
- [ ] Mensajes claros
- [ ] Feedback visual apropiado
- [ ] Sin bloqueos ni freezes

### Testing Performance
- [ ] Inicio rápido (< 2s)
- [ ] Scroll fluido
- [ ] Memoria estable
- [ ] Batería optimizada

---

## 🐛 Gestión de Bugs

### Severidad
- **CRÍTICO:** App crashea, datos se pierden, bloqueo total
- **ALTO:** Funcionalidad principal no opera
- **MEDIO:** Workaround disponible, UX degradada
- **BAJO:** Cosmetic, no afecta funcionalidad

### Template de Bug Report
```
**Dispositivo:** [Modelo, OS Version]
**App Version:** 1.0.0
**Fecha:** DD/MM/YYYY

**Descripción:**
[Descripción clara del problema]

**Pasos para Reproducir:**
1. 
2. 
3. 

**Resultado Esperado:**
[Qué debería pasar]

**Resultado Actual:**
[Qué pasa realmente]

**Evidencia:**
[Screenshots, videos, logs]

**Severidad:** [CRÍTICO/ALTO/MEDIO/BAJO]
```

---

## 📊 Métricas de Éxito

### Funcionalidad
- ✅ 100% de flujos críticos operan
- ✅ 0 bugs críticos
- ✅ < 5 bugs altos

### Performance
- ✅ Inicio < 2 segundos
- ✅ Uso de memoria < 150MB
- ✅ Scroll a 60 FPS
- ✅ Batería < 10%/hora

### UX
- ✅ Tareas completadas sin ayuda
- ✅ Tiempo de aprendizaje < 5 min
- ✅ Satisfacción > 4/5

---

## ✅ Criterios de Aceptación

Para pasar Week 14:

1. **Todos los escenarios críticos PASAN** en al menos:
   - 2 dispositivos Android (Alta prioridad)
   - 1 dispositivo iOS (Alta prioridad)

2. **No hay bugs críticos**

3. **Documentación completa:**
   - Resultados de testing
   - Bugs encontrados y workarounds
   - Métricas de performance

4. **Aprobación del equipo:**
   - QA Lead firma off
   - Product Owner aprueba

---

## 📅 Cronograma

| Día | Actividad | Responsable |
|-----|-----------|-------------|
| Lunes | Setup dispositivos, instalar builds | DevOps |
| Martes | Testing funcional Android | QA |
| Miércoles | Testing funcional iOS | QA |
| Jueves | Testing performance, batería | QA |
| Viernes | Documentación, fixes | Dev |

---

## 🔗 Recursos

- **APK de prueba:** [URL interna]
- **TestFlight:** [Enlace de invitación]
- **Backend staging:** https://api-staging.plataformaelectoral.com
- **Credenciales:** demo@testigo.com / Demo123!

---

**Documento creado:** 13 Agosto 2026  
**Versión:** 1.0  
**Próxima revisión:** Post-Week 14
