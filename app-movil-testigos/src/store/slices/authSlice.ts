import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../../config/env';
import { TokenStorage } from '../../services/TokenStorage';

interface User {
  id: number;
  email: string;
  nombre: string;
  permisos: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOffline: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isOffline: false,
  loading: false,
  error: null,
};

// Hash simple (no criptográfico) de la contraseña, solo para el chequeo
// local de login offline -mismo enfoque y misma advertencia que
// pwa-testigos/src/stores/authStore.ts (hashPassword). La verificación
// real de contraseña siempre ocurre en el servidor vía Sanctum; esto es
// únicamente "¿es la misma persona que inició sesión online la última
// vez en este dispositivo?".
const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    // Última sesión guardada para este correo, si existe.
    const intentarOffline = async () => {
      const offlineUser = await AsyncStorage.getItem('offline_user');
      const cachedToken = await TokenStorage.getToken();
      const cachedPasswordHash = await TokenStorage.getPasswordHash();
      if (offlineUser && cachedToken) {
        const user = JSON.parse(offlineUser);
        // Antes solo se comparaba el email: cualquiera que conociera el
        // correo de un testigo podía "iniciar sesión offline" con
        // CUALQUIER contraseña, sin verificar nada -un bypass real de
        // autenticación para el escenario offline.
        if (
          user.email === email &&
          cachedPasswordHash &&
          cachedPasswordHash === hashPassword(password)
        ) {
          return { user, token: cachedToken, offline: true };
        }
      }
      return null;
    };

    let response: Response;
    try {
      response = await fetch(`${ENV.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (networkError) {
      // Sin conectividad real (lo que el banner "Modo offline" de
      // LoginScreen promete): fetch() lanza una excepción de red en vez de
      // resolver con response.ok=false, así que este caso NUNCA pasaba por
      // el fallback de abajo -el login offline no funcionaba nunca en el
      // escenario para el que existe (testigo sin señal en el puesto).
      const offlineResult = await intentarOffline();
      if (offlineResult) {
        return offlineResult;
      }
      return rejectWithValue(
        'Sin conexión y no hay una sesión previa guardada para este correo',
      );
    }

    try {
      if (!response.ok) {
        // Servidor alcanzable pero respondió error (ej. credenciales
        // inválidas): igual se intenta el fallback por si hay una sesión
        // offline válida para este correo.
        const offlineResult = await intentarOffline();
        if (offlineResult) {
          return offlineResult;
        }
        throw new Error('Credenciales incorrectas');
      }

      const body = await response.json();

      if (!body.success) {
        throw new Error(body.message || 'Credenciales incorrectas');
      }

      // AuthController::login (backend-core) responde
      // {success, message, data: {user, token}} -no {user, token} en la
      // raíz. Leer data.user/data.token directamente dejaba ambos undefined
      // y rompía el login online para todo testigo. El campo de nombre del
      // usuario tampoco es 'nombre': el backend lo llama 'full_name'.
      const rawUser = body.data.user;
      const user = { ...rawUser, nombre: rawUser.full_name };
      const token = body.data.token;

      // Guardar perfil (no sensible) para fallback offline; el token y el
      // hash de la contraseña van aparte, cifrados (SecureStore).
      await AsyncStorage.setItem('offline_user', JSON.stringify(user));
      await TokenStorage.setToken(token);
      await TokenStorage.setPasswordHash(hashPassword(password));

      return { user, token, offline: false };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('offline_user');
      TokenStorage.clearToken();
      TokenStorage.clearPasswordHash();
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isOffline = action.payload.offline;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setOffline, clearError } = authSlice.actions;
export default authSlice.reducer;
