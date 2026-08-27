/**
 * Orígenes permitidos para CORS (HTTP y WebSocket).
 *
 * Antes cada gateway repetía `process.env.WEBSOCKET_CORS_ORIGIN?.split(',') || '*'`
 * (con `credentials: true` a la vez) -combinación inválida según el spec de
 * CORS: los navegadores rechazan `Access-Control-Allow-Origin: *` junto con
 * `Access-Control-Allow-Credentials: true`. Sin el env var configurado, esto
 * fallaba silenciosamente en producción. Por defecto, cuando no hay
 * configuración explícita, no se permite ningún origen (fail closed) en vez
 * de ofrecer un comodín que de todos modos el navegador va a rechazar.
 *
 * `preconteo.gateway.ts` además leía la variable equivocada (`FRONTEND_URL`,
 * nunca documentada/configurada) en vez de `WEBSOCKET_CORS_ORIGIN`.
 */
export function getAllowedOrigins(): string[] {
  const raw = process.env.WEBSOCKET_CORS_ORIGIN;
  return raw ? raw.split(',').map((o) => o.trim()) : [];
}
