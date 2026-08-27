# Checklist Testing Funcional - App Nativa

## Información General
- **App:** Testigos Electorales v1.0.0
- **Tester:** ___________________
- **Dispositivo:** ___________________
- **OS Version:** ___________________
- **Fecha:** ___________________
- **Build:** ___________________

---

## 🔐 Módulo: Autenticación

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| AUTH-01 | Login exitoso | 1. Ingresar email válido<br>2. Ingresar password<br>3. Tap "Ingresar" | Acceso al Dashboard | ☐ PASS ☐ FAIL | |
| AUTH-02 | Login credenciales inválidas | 1. Ingresar email inválido<br>2. Ingresar password incorrecto<br>3. Tap "Ingresar" | Mensaje: "Credenciales inválidas" | ☐ PASS ☐ FAIL | |
| AUTH-03 | Campos vacíos | 1. Dejar campos vacíos<br>2. Tap "Ingresar" | Validación: campos requeridos | ☐ PASS ☐ FAIL | |
| AUTH-04 | Persistencia de sesión | 1. Login exitoso<br>2. Cerrar app<br>3. Reabrir | Sesión mantenida | ☐ PASS ☐ FAIL | |
| AUTH-05 | Logout | 1. Ir a Perfil<br>2. Tap "Cerrar Sesión" | Regreso a Login | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 🏠 Módulo: Dashboard (Home)

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| HOME-01 | Carga de dashboard | 1. Login exitoso | Visualizar estadísticas | ☐ PASS ☐ FAIL | |
| HOME-02 | Stats actualizados | 1. Verificar contadores | Pendientes/Enviadas/Total correctos | ☐ PASS ☐ FAIL | |
| HOME-03 | Botón Nueva Acta | 1. Tap "Nueva Acta" | Navegación a formulario | ☐ PASS ☐ FAIL | |
| HOME-04 | Botón Ver Pendientes | 1. Tap "Ver Pendientes" | Navegación a lista | ☐ PASS ☐ FAIL | |
| HOME-05 | Pull to refresh | 1. Pull down en dashboard | Datos actualizados | ☐ PASS ☐ FAIL | |
| HOME-06 | Indicador de conexión | 1. Verificar icono de red | Muestra estado online/offline | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 📝 Módulo: Formulario de Acta

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| FORM-01 | Carga de formulario | 1. Tap "Nueva Acta" | Todos los campos visibles | ☐ PASS ☐ FAIL | |
| FORM-02 | Selección elección | 1. Tap selector elección<br>2. Seleccionar opción | Elección seleccionada | ☐ PASS ☐ FAIL | |
| FORM-03 | Selección cargo | 1. Tap selector cargo<br>2. Seleccionar opción | Cargo seleccionado | ☐ PASS ☐ FAIL | |
| FORM-04 | Ingreso mesa | 1. Ingresar número de mesa<br>2. Verificar | Número aceptado | ☐ PASS ☐ FAIL | |
| FORM-05 | Campo mesa vacío | 1. Dejar mesa vacía<br>2. Intentar guardar | Error: "Mesa requerida" | ☐ PASS ☐ FAIL | |
| FORM-06 | Votantes - valor positivo | 1. Ingresar 300 | Aceptado | ☐ PASS ☐ FAIL | |
| FORM-07 | Votantes - valor negativo | 1. Ingresar -10 | Error: "Valor inválido" | ☐ PASS ☐ FAIL | |
| FORM-08 | Votantes - valor cero | 1. Ingresar 0 | Aceptado (edge case) | ☐ PASS ☐ FAIL | |
| FORM-09 | Boletas entregadas | 1. Ingresar valor | Aceptado | ☐ PASS ☐ FAIL | |
| FORM-10 | Votos candidatos | 1. Ingresar votos por candidato | Suma calculada correctamente | ☐ PASS ☐ FAIL | |
| FORM-11 | Votos exceden votantes | 1. Votantes: 100<br>2. Votos: 150 | Error: "Votos exceden votantes" | ☐ PASS ☐ FAIL | |
| FORM-12 | Diferencia boletas-votos | 1. Boletas: 100<br>2. Votos: 80 | Advertencia mostrada | ☐ PASS ☐ FAIL | |
| FORM-13 | Total de votos | 1. Verificar cálculo automático | Suma = Votos candidatos + blancos + nulos | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 📸 Módulo: Captura de Fotos

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| PHOTO-01 | Abrir cámara | 1. En formulario<br>2. Tap "Agregar Foto" | Cámara nativa se abre | ☐ PASS ☐ FAIL | |
| PHOTO-02 | Permiso cámara - concedido | 1. Primera vez<br>2. Conceder permiso | Cámara disponible | ☐ PASS ☐ FAIL | |
| PHOTO-03 | Permiso cámara - denegado | 1. Denegar permiso | Mensaje explicativo | ☐ PASS ☐ FAIL | |
| PHOTO-04 | Capturar foto | 1. Frame acta<br>2. Tap captura | Foto capturada | ☐ PASS ☐ FAIL | |
| PHOTO-05 | Preview foto | 1. Capturar foto | Preview visible | ☐ PASS ☐ FAIL | |
| PHOTO-06 | Cancelar foto | 1. En cámara<br>2. Tap cancelar | Regreso a formulario | ☐ PASS ☐ FAIL | |
| PHOTO-07 | Retomar foto | 1. En preview<br>2. Tap retomar | Volver a cámara | ☐ PASS ☐ FAIL | |
| PHOTO-08 | Confirmar foto | 1. En preview<br>2. Tap confirmar | Foto adjunta al acta | ☐ PASS ☐ FAIL | |
| PHOTO-09 | Múltiples fotos | 1. Agregar foto 1<br>2. Agregar foto 2 | Ambas fotos adjuntas | ☐ PASS ☐ FAIL | |
| PHOTO-10 | Eliminar foto | 1. Tap X en foto | Foto eliminada | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 💾 Módulo: Guardado y Almacenamiento

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| SAVE-01 | Guardar acta online | 1. Completar formulario<br>2. Tap "Guardar" | Acta enviada al servidor | ☐ PASS ☐ FAIL | |
| SAVE-02 | Guardar acta offline | 1. Modo avión<br>2. Guardar acta | Acta guardada localmente | ☐ PASS ☐ FAIL | |
| SAVE-03 | Mensaje éxito online | 1. Guardar con conexión | Mensaje: "Acta enviada" | ☐ PASS ☐ FAIL | |
| SAVE-04 | Mensaje offline | 1. Guardar sin conexión | Mensaje: "Guardada localmente" | ☐ PASS ☐ FAIL | |
| SAVE-05 | Navegación post-guardado | 1. Guardar acta | Redirección a Pendientes | ☐ PASS ☐ FAIL | |
| SAVE-06 | Persistencia SQLite | 1. Guardar acta<br>2. Cerrar app<br>3. Reabrir | Acta visible en Pendientes | ☐ PASS ☐ FAIL | |
| SAVE-07 | Datos no perdidos | 1. Llenar parcialmente<br>2. Navegar atrás<br>3. Volver a formulario | Datos mantenidos | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 🔄 Módulo: Sincronización

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| SYNC-01 | Lista pendientes | 1. Ir a Pendientes | Lista de actas no enviadas | ☐ PASS ☐ FAIL | |
| SYNC-02 | Badge contador | 1. Tener actas pendientes | Badge muestra cantidad correcta | ☐ PASS ☐ FAIL | |
| SYNC-03 | Sync individual | 1. Tap ícono sync en acta | Acta se sincroniza | ☐ PASS ☐ FAIL | |
| SYNC-04 | Sync individual - spinner | 1. Iniciar sync | Spinner de carga visible | ☐ PASS ☐ FAIL | |
| SYNC-05 | Sync individual - éxito | 1. Completar sync | Estado cambia a "Enviada" | ☐ PASS ☐ FAIL | |
| SYNC-06 | Sync individual - error | 1. Simular error de red | Estado cambia a "Error" | ☐ PASS ☐ FAIL | |
| SYNC-07 | Sync todas | 1. Tap "Sincronizar Todo" | Todas las actas intentan sync | ☐ PASS ☐ FAIL | |
| SYNC-08 | Sync automático | 1. Recuperar conexión | Sync inicia automáticamente | ☐ PASS ☐ FAIL | |
| SYNC-09 | Background sync | 1. App en background<br>2. Esperar 15 min | Sync ejecuta en background | ☐ PASS ☐ FAIL | |
| SYNC-10 | Notificación sync | 1. Completar sync | Notificación push mostrada | ☐ PASS ☐ FAIL | |
| SYNC-11 | Reintentar error | 1. Acta con estado Error<br>2. Tap reintentar | Nuevo intento de sync | ☐ PASS ☐ FAIL | |
| SYNC-12 | Eliminar acta | 1. Swipe/delete en acta<br>2. Confirmar | Acta eliminada | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 🗺️ Módulo: Mapa de Mesas

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| MAP-01 | Carga de mapa | 1. Ir a Mapa | Mapa Google/Apple carga | ☐ PASS ☐ FAIL | |
| MAP-02 | Ubicación actual | 1. Conceder permiso | Marcador en ubicación actual | ☐ PASS ☐ FAIL | |
| MAP-03 | Mesas cercanas | 1. Ver mapa | Marcadores de mesas visibles | ☐ PASS ☐ FAIL | |
| MAP-04 | Info marker | 1. Tap en marcador | Info window con datos | ☐ PASS ☐ FAIL | |
| MAP-05 | Navegar a mesa | 1. Tap "Ir a mesa" | Opciones de navegación externa | ☐ PASS ☐ FAIL | |
| MAP-06 | Sin permiso ubicación | 1. Denegar permiso | Mapa muestra área general | ☐ PASS ☐ FAIL | |
| MAP-07 | Zoom y pan | 1. Zoom in/out<br>2. Arrastrar mapa | Funciona correctamente | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 👤 Módulo: Perfil

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| PROF-01 | Ver perfil | 1. Ir a Perfil | Datos del usuario visibles | ☐ PASS ☐ FAIL | |
| PROF-02 | Info usuario | 1. Verificar campos | Nombre, email, rol correctos | ☐ PASS ☐ FAIL | |
| PROF-03 | Info territorial | 1. Verificar sección | Departamento, municipio visibles | ☐ PASS ☐ FAIL | |
| PROF-04 | Versión app | 1. Verificar versión | Número de versión mostrado | ☐ PASS ☐ FAIL | |
| PROF-05 | Cerrar sesión | 1. Tap "Cerrar Sesión"<br>2. Confirmar | Sesión cerrada, ir a Login | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 📡 Módulo: Modo Offline

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| OFF-01 | Detectar offline | 1. Activar modo avión | Indicador offline visible | ☐ PASS ☐ FAIL | |
| OFF-02 | Login offline | 1. Sin conexión<br>2. Login con credenciales | Acceso concedido (cache) | ☐ PASS ☐ FAIL | |
| OFF-03 | Formulario offline | 1. Sin conexión<br>2. Crear acta | Formulario funciona normal | ☐ PASS ☐ FAIL | |
| OFF-04 | Guardar offline | 1. Sin conexión<br>2. Guardar acta | Guardado en SQLite | ☐ PASS ☐ FAIL | |
| OFF-05 | Lista offline | 1. Sin conexión<br>2. Ver pendientes | Lista de actas locales visible | ☐ PASS ☐ FAIL | |
| OFF-06 | Recuperar online | 1. Desactivar modo avión | Indicador online aparece | ☐ PASS ☐ FAIL | |
| OFF-07 | Sync al recuperar | 1. Desactivar modo avión | Sync automático inicia | ☐ PASS ☐ FAIL | |
| OFF-08 | Cache candidatos | 1. Sin conexión<br>2. Crear acta | Lista de candidatos disponible | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## ⚡ Módulo: Performance

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| PERF-01 | Tiempo de inicio | 1. Medir desde tap hasta dashboard | < 2 segundos | ☐ PASS ☐ FAIL | |
| PERF-02 | Carga formulario | 1. Tap "Nueva Acta" hasta form listo | < 1 segundo | ☐ PASS ☐ FAIL | |
| PERF-03 | Scroll lista | 1. Scroll en lista de 50 actas | Fluido, 60 FPS | ☐ PASS ☐ FAIL | |
| PERF-04 | Memoria estable | 1. Usar app 10 minutos | Sin aumento excesivo | ☐ PASS ☐ FAIL | |
| PERF-05 | Sin freezes | 1. Uso continuo | Sin bloqueos ni ANR | ☐ PASS ☐ FAIL | |

**Métricas Medidas:**
- Tiempo de inicio: _____ segundos
- Uso de memoria: _____ MB
- CPU promedio: _____ %

---

## 🔋 Módulo: Batería

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| BATT-01 | Consumo activo | 1. Usar 1 hora activamente | < 10% consumo | ☐ PASS ☐ FAIL | |
| BATT-02 | Background | 1. Dejar en background 1 hora | < 2% consumo | ☐ PASS ☐ FAIL | |
| BATT-03 | Sin fugas | 1. Monitorear uso | Sin consumo excesivo inesperado | ☐ PASS ☐ FAIL | |

**Métricas:**
- Inicio: _____%
- Fin: _____%
- Consumo: _____%

---

## 🌐 Módulo: Integración Backend

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| API-01 | Login API | 1. Login con backend | Token JWT recibido | ☐ PASS ☐ FAIL | |
| API-02 | Datos elecciones | 1. Ver elecciones disponibles | Lista del backend | ☐ PASS ☐ FAIL | |
| API-03 | Datos candidatos | 1. Ver candidatos | Lista del backend | ☐ PASS ☐ FAIL | |
| API-04 | Submit acta | 1. Enviar acta | 201 Created | ☐ PASS ☐ FAIL | |
| API-05 | Error 401 | 1. Token expirado | Redirección a login | ☐ PASS ☐ FAIL | |
| API-06 | Error 500 | 1. Backend error | Mensaje amigable | ☐ PASS ☐ FAIL | |
| API-07 | Timeout | 1. Red lenta | Reintento automático | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 🎨 Módulo: UI/UX

| ID | Prueba | Pasos | Esperado | Resultado | Notas |
|----|--------|-------|----------|-----------|-------|
| UI-01 | Consistencia visual | 1. Revisar todas las pantallas | Colores, fuentes consistentes | ☐ PASS ☐ FAIL | |
| UI-02 | Tamaño botones | 1. Verificar elementos táctiles | Mínimo 44x44 pts | ☐ PASS ☐ FAIL | |
| UI-03 | Contraste | 1. Revisar textos | Contraste adecuado (WCAG) | ☐ PASS ☐ FAIL | |
| UI-04 | Rotación | 1. Rotar dispositivo | App maneja rotación o se mantiene portrait | ☐ PASS ☐ FAIL | |
| UI-05 | Safe areas | 1. En dispositivos con notch | Contenido dentro de safe area | ☐ PASS ☐ FAIL | |
| UI-06 | Keyboard | 1. Abrir teclado | UI se ajusta correctamente | ☐ PASS ☐ FAIL | |
| UX-01 | Feedback táctil | 1. Tap en botones | Respuesta visual inmediata | ☐ PASS ☐ FAIL | |
| UX-02 | Loading states | 1. Operaciones largas | Indicadores de carga visibles | ☐ PASS ☐ FAIL | |
| UX-03 | Error messages | 1. Provocar errores | Mensajes claros y accionables | ☐ PASS ☐ FAIL | |

**Bugs Encontrados:**
```

```

---

## 📊 Resumen de Resultados

### Estadísticas
- **Total Pruebas:** _____
- **PASS:** _____
- **FAIL:** _____
- **N/A:** _____
- **Porcentaje Éxito:** _____%

### Bugs por Severidad
- **CRÍTICO:** _____
- **ALTO:** _____
- **MEDIO:** _____
- **BAJO:** _____

### Módulos con Problemas
1. ___________________
2. ___________________
3. ___________________

### Recomendaciones
```

```

---

## ✅ Aprobación

- **Tester:** ___________________ Fecha: _______
- **QA Lead:** ___________________ Fecha: _______
- **Product Owner:** ___________________ Fecha: _______

**Estado Final:** ☐ APROBADO ☐ RECHAZADO ☐ APROBADO CON OBSERVACIONES

---

**Notas Adicionales:**
```



```

---

**Próxima Revisión:** ___________________
