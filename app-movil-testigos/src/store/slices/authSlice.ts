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

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      // Intentar login online
      const response = await fetch(`${ENV.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Si falla, intentar login offline con la última sesión guardada
        const offlineUser = await AsyncStorage.getItem('offline_user');
        const cachedToken = await TokenStorage.getToken();
        if (offlineUser && cachedToken) {
          const user = JSON.parse(offlineUser);
          if (user.email === email) {
            return { user, token: cachedToken, offline: true };
          }
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

      // Guardar perfil (no sensible) para fallback offline; el token va aparte, cifrado
      await AsyncStorage.setItem('offline_user', JSON.stringify(user));
      await TokenStorage.setToken(token);

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
