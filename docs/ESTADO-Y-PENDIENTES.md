# Estado y Pendientes del Proyecto

**Última actualización:** 27 de agosto de 2026
**Objetivo electoral:** Elecciones Territoriales — 25 de octubre de 2027

> Este documento reemplaza como referencia de estado a `ANALISIS-ESTADO-PROYECTO.md`
> y a los `RESUMEN-SEMANA-*.md` anteriores, que quedaron desactualizados. Es el
> único punto de verdad sobre qué está listo para desplegar y qué falta.

---

## 1. Estado de despliegue de las 5 aplicaciones

| App | Build | Tests | Estado |
|---|---|---|---|
| **backend-core** (Laravel) | OK (no verificado con Composer en este entorno — ver pendiente) | ✅ 147/147 | Listo. `.env` de producción debe configurarse en el servidor (no viene en el repo, correcto). |
| **backend-diad** (NestJS) | ✅ compila | ✅ 18/18 | Listo. 17 vulnerabilidades npm (3 altas) en el módulo `actas`, que no tiene consumidor real en producción hoy — documentado en código, migración a BullMQ pendiente (ver §2). |
| **frontend-web** (React/Vite) | ✅ compila | — | Listo. Analytics y Reportes ya tienen backend real (antes eran 404). |
| **pwa-testigos** (Vite PWA) | ✅ compila, genera service worker | — | Listo. Aviso de bundle >1.2MB sin code-splitting (rendimiento, no bloqueante). |
| **app-movil-testigos** (Expo, **Android-only** desde 2026-08-27) | ✅ TypeScript sin errores | ✅ 57/57 | **Bloqueado por credenciales reales** — ver §2. Ya no apunta a iOS/App Store. |

---

## 2. Pendientes reales (requieren acción externa, no código)

### 2.1 app-movil-testigos — credenciales de EAS/Play Store (bloqueante para build de producción)

`app.config.ts` y `eas.json` tienen un `projectId` de EAS en placeholder
(`your-eas-project-id`). Son credenciales de tu cuenta Expo/Google Play que
nadie puede generar por ti. Pasos, desde `app-movil-testigos/`:

1. `npx eas login` — con tu cuenta Expo.
2. `npx eas init` — crea el proyecto en EAS y escribe el `projectId` real en
   `app.config.ts` automáticamente.
3. Para publicar en Play Store: generar
   `credentials/google-play-service-account.json` desde Google Play Console
   → Configuración → Acceso a la API (cuenta de servicio con permiso de
   "Release Manager" o superior sobre la app).

Una vez hecho esto, `npm run build:android:production` (dentro de
`app-movil-testigos`) genera el AAB para Play Store.

### 2.2 backend-diad — dependencias `bull`/`multer` vulnerables

`npm audit` marca 3 vulnerabilidades altas (DoS) en `bull` (vía
`redis`/`uuid` transitivos) y `multer`. El fix real es migrar a BullMQ, que
cambia la forma de `BullRootModuleOptions` (confirmado: `npm audit fix
--force` rompe el build) — requiere su propio ciclo de prueba, no es un
simple `npm update`.

**No es urgente**: ambos paquetes solo se ejercitan hoy desde el módulo
`actas` de backend-diad (cola `'actas'` para OCR simulado + subida de
imagen), que no tiene ningún consumidor real en producción todavía (el
único puente real Laravel→backend-diad es el WebSocket de preconteo, que
no usa ninguno de los dos). Migrar antes de conectar un consumidor real a
ese módulo.

### 2.3 backend-core — auditoría de dependencias PHP sin correr

`composer audit` no se pudo ejecutar en esta sesión (el binario `composer`
no está disponible en este entorno). Pendiente correrlo en un entorno con
Composer instalado.

### 2.4 app-movil-testigos — Google Maps en Android

`react-native-maps` está como dependencia pero "Mapa de Mesas"
(`MapaMesasScreen.tsx`) es un placeholder sin mapa real todavía. Cuando se
implemente de verdad, hace falta agregar `android.config.googleMaps.apiKey`
en `app.config.ts` (documentado ahí mismo) — sin eso el mapa nativo de
Android queda en blanco.

---

## 3. Trabajo completado en la sesión del 26-27 de agosto de 2026

Commits en `main` (más recientes primero):

| Commit | Qué hizo |
|---|---|
| `40122eb` | app-movil-testigos: elimina soporte iOS/App Store, deja solo Android (decisión de producto). |
| `451613d` | Implementa el backend de Analytics (`/api/analytics/*`), antes 404 — datos reales de votantes/financiero/comunicación/eventos, comparativas período-a-período, burn rate. 5 tests. |
| `8e1e882` | Implementa el backend de Reportes Exportables (`/api/reportes/*`), antes 404 — genera PDF/CSV/Excel reales. 8 tests. |
| `4125da7` | app-movil-testigos: infraestructura de Jest (faltaba `babel.config.js`, bloqueaba tests **y** `expo start`) + 57 tests para servicios/store, incluida regresión de seguridad del login offline. |
| `b09b2cc` | Documenta en código por qué no se migra `bull`/`multer` todavía (ver §2.2). |
| `98d2972` | Corrige autorización de campaña faltante en `store()` de 6 controladores CRM (Evento/Gasto/Donacion/Donante/Votante/Segmento) — cross-campaign injection real. |
| `4178d28` | Auditoría forense de seguridad fase 2: mass assignment, puente JWT backend-core↔backend-diad, autorización multi-tenant en WebSockets, bypass de autenticación offline en la app móvil. |

Todo commiteado y pusheado a `origin/main`. Sin cambios pendientes de
guardar salvo un archivo suelto sin relación (`Nuevo Documento de
texto.txt`, en la raíz del repo, sin trackear).

---

## 4. Cómo mantener este documento

Cuando se resuelva un pendiente de la §2, muévelo a una sección "Resuelto"
con fecha, o bórralo si ya no aporta contexto. Cuando se complete trabajo
significativo nuevo, agregar una fila a la tabla de la §3 en vez de crear
otro `RESUMEN-*.md` suelto.
