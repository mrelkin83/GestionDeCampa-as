import * as SecureStore from 'expo-secure-store';
import { TokenStorage } from '../TokenStorage';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('TokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('guarda el token bajo la clave dedicada en SecureStore', async () => {
    await TokenStorage.setToken('abc123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth_token',
      'abc123',
    );
  });

  it('lee el token desde SecureStore', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('abc123');
    await expect(TokenStorage.getToken()).resolves.toBe('abc123');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('retorna null cuando no hay token guardado', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    await expect(TokenStorage.getToken()).resolves.toBeNull();
  });

  it('elimina el token', async () => {
    await TokenStorage.clearToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('guarda, lee y elimina el hash de contraseña bajo una clave distinta a la del token', async () => {
    await TokenStorage.setPasswordHash('deadbeef');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth_password_hash',
      'deadbeef',
    );

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('deadbeef');
    await expect(TokenStorage.getPasswordHash()).resolves.toBe('deadbeef');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_password_hash');

    await TokenStorage.clearPasswordHash();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'auth_password_hash',
    );
  });

  it('usa claves de almacenamiento distintas para token y hash de contraseña', async () => {
    await TokenStorage.setToken('token-value');
    await TokenStorage.setPasswordHash('hash-value');

    const calls = (SecureStore.setItemAsync as jest.Mock).mock.calls;
    const keys = calls.map(([key]) => key);
    expect(new Set(keys).size).toBe(2);
  });
});
