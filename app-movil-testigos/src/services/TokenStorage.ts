import * as SecureStore from 'expo-secure-store';

/**
 * Almacenamiento del token de autenticación.
 *
 * Usa expo-secure-store (Keychain en iOS / Keystore en Android) en vez de
 * AsyncStorage, que guarda datos SIN CIFRAR y es legible por cualquier
 * proceso con acceso al almacenamiento del dispositivo (root/jailbreak,
 * backups). El token autentica al testigo electoral ante el backend y
 * permite subir actas de escrutinio, por lo que debe tratarse como secreto.
 */
const TOKEN_KEY = 'auth_token';
// Hash de la contraseña del último login online: permite verificar la
// contraseña en el fallback offline (ver authSlice.ts) sin guardarla en
// claro. Va en SecureStore, no en AsyncStorage con el resto del perfil,
// por el mismo motivo que el token: es un dato sensible.
const PASSWORD_HASH_KEY = 'auth_password_hash';

export const TokenStorage = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async setPasswordHash(hash: string): Promise<void> {
    await SecureStore.setItemAsync(PASSWORD_HASH_KEY, hash);
  },

  async getPasswordHash(): Promise<string | null> {
    return SecureStore.getItemAsync(PASSWORD_HASH_KEY);
  },

  async clearPasswordHash(): Promise<void> {
    await SecureStore.deleteItemAsync(PASSWORD_HASH_KEY);
  },
};

export default TokenStorage;
