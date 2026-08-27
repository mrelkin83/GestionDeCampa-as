import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenStorage } from '../../../services/TokenStorage';
import authReducer, { loginUser, logout } from '../authSlice';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../../../services/TokenStorage', () => ({
  TokenStorage: {
    setToken: jest.fn(),
    getToken: jest.fn(),
    clearToken: jest.fn(),
    setPasswordHash: jest.fn(),
    getPasswordHash: jest.fn(),
    clearPasswordHash: jest.fn(),
  },
}));

jest.mock('../../../config/env', () => ({
  ENV: { apiUrl: 'https://api.test' },
}));

function buildStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

const mockUsuarioOnline = {
  id: 1,
  email: 'testigo@example.com',
  full_name: 'Testigo Uno',
  permisos: ['actas.crear'],
};

function mockFetchOnce(response: { ok: boolean; json: () => Promise<any> }) {
  (global as any).fetch = jest.fn().mockResolvedValue(response);
}

function mockFetchNetworkError() {
  (global as any).fetch = jest
    .fn()
    .mockRejectedValue(new TypeError('Network request failed'));
}

describe('authSlice - loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login online exitoso guarda usuario, token y hash de contraseña', async () => {
    mockFetchOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: mockUsuarioOnline, token: 'server-token' },
      }),
    });

    const store = buildStore();
    await store.dispatch(
      loginUser({ email: 'testigo@example.com', password: 'clave123' }) as any,
    );

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.isOffline).toBe(false);
    expect(state.user?.nombre).toBe('Testigo Uno');
    expect(state.token).toBe('server-token');

    expect(TokenStorage.setToken).toHaveBeenCalledWith('server-token');
    expect(TokenStorage.setPasswordHash).toHaveBeenCalled();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'offline_user',
      expect.stringContaining('testigo@example.com'),
    );
  });

  it('sin red y sin sesión guardada previamente, rechaza el login', async () => {
    mockFetchNetworkError();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const store = buildStore();
    const result = await store.dispatch(
      loginUser({ email: 'testigo@example.com', password: 'clave123' }) as any,
    );

    expect(result.type).toBe('auth/login/rejected');
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('sin red pero con sesión offline válida (email y contraseña coinciden), autentica offline', async () => {
    mockFetchNetworkError();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUsuarioOnline),
    );
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('cached-token');
    // hashPassword('clave123') calculado con el mismo algoritmo que authSlice.ts
    const hashPassword = (password: string): string => {
      let hash = 0;
      for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    };
    (TokenStorage.getPasswordHash as jest.Mock).mockResolvedValue(
      hashPassword('clave123'),
    );

    const store = buildStore();
    const result = await store.dispatch(
      loginUser({ email: 'testigo@example.com', password: 'clave123' }) as any,
    );

    expect(result.type).toBe('auth/login/fulfilled');
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.isOffline).toBe(true);
    expect(state.token).toBe('cached-token');
  });

  it('REGRESIÓN DE SEGURIDAD: sin red, con sesión guardada pero contraseña incorrecta, rechaza el login offline', async () => {
    mockFetchNetworkError();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUsuarioOnline),
    );
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('cached-token');
    // Hash guardado corresponde a una contraseña distinta a la que se envía ahora.
    (TokenStorage.getPasswordHash as jest.Mock).mockResolvedValue(
      'hash-de-otra-clave',
    );

    const store = buildStore();
    const result = await store.dispatch(
      loginUser({
        email: 'testigo@example.com',
        password: 'clave-incorrecta',
      }) as any,
    );

    expect(result.type).toBe('auth/login/rejected');
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('REGRESIÓN DE SEGURIDAD: sin red y sin hash de contraseña cacheado, rechaza el login offline aunque el email coincida', async () => {
    mockFetchNetworkError();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUsuarioOnline),
    );
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('cached-token');
    (TokenStorage.getPasswordHash as jest.Mock).mockResolvedValue(null);

    const store = buildStore();
    const result = await store.dispatch(
      loginUser({
        email: 'testigo@example.com',
        password: 'cualquier-cosa',
      }) as any,
    );

    expect(result.type).toBe('auth/login/rejected');
  });

  it('sin red y con sesión guardada de OTRO usuario (email distinto), rechaza el login', async () => {
    mockFetchNetworkError();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(mockUsuarioOnline),
    );
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('cached-token');
    (TokenStorage.getPasswordHash as jest.Mock).mockResolvedValue(
      'cualquier-hash',
    );

    const store = buildStore();
    const result = await store.dispatch(
      loginUser({
        email: 'otro-usuario@example.com',
        password: 'clave123',
      }) as any,
    );

    expect(result.type).toBe('auth/login/rejected');
  });

  it('servidor alcanzable pero credenciales inválidas intenta fallback offline antes de rechazar', async () => {
    mockFetchOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Credenciales inválidas' }),
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const store = buildStore();
    const result = await store.dispatch(
      loginUser({ email: 'testigo@example.com', password: 'clave123' }) as any,
    );

    expect(result.type).toBe('auth/login/rejected');
  });
});

describe('authSlice - logout', () => {
  it('limpia usuario, token y hash de contraseña cacheados (AsyncStorage y SecureStore)', () => {
    const store = configureStore({ reducer: { auth: authReducer } });
    store.dispatch(logout());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('offline_user');
    expect(TokenStorage.clearToken).toHaveBeenCalled();
    expect(TokenStorage.clearPasswordHash).toHaveBeenCalled();
  });
});
