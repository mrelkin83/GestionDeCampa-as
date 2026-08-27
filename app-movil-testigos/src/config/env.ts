import Constants from 'expo-constants';

/**
 * Variables de entorno de la app.
 *
 * IMPORTANTE: `process.env.API_URL` (definido en eas.json -> build.*.env)
 * solo existe en el proceso de Node que ejecuta `app.config.ts` durante el
 * build. NO llega al bundle JS que corre en el dispositivo, salvo que se use
 * el prefijo EXPO_PUBLIC_ o se lea desde `expo-constants`. Por eso estos
 * valores se toman de `Constants.expoConfig.extra`, que sí es accesible en
 * runtime (app.config.ts los coloca ahí a partir de process.env en build time).
 */
interface AppEnv {
  apiUrl: string;
  wsUrl: string;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppEnv>;

export const ENV: AppEnv = {
  apiUrl: extra.apiUrl || 'http://localhost:8000',
  // wsUrl no se usa en ningún lugar de esta app (no hay socket.io-client en
  // las dependencias; los testigos solo reportan actas vía POST puntual).
  // El fallback apuntaba al mismo puerto equivocado (3001) que
  // useWebSocket.ts en frontend-web tenía -backend-diad escucha en 3000.
  wsUrl: extra.wsUrl || 'ws://localhost:3000',
};
