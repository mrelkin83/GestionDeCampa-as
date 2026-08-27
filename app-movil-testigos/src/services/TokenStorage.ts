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
};

export default TokenStorage;
