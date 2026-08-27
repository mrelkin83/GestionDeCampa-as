import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dbService } from '../services/DatabaseService';

/**
 * Store: useAuthStore
 * 
 * Maneja el estado de autenticación con soporte offline.
 * Usa Zustand + persist para mantener sesión entre recargas.
 */

interface User {
  id: number;
  email: string;
  nombre: string;
  permisos: string[];
}

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOffline: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  loginOffline: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkOfflineAuth: () => Promise<boolean>;
  clearError: () => void;
  setOffline: (isOffline: boolean) => void;
}

// Simular hash de contraseña (en producción usar bcrypt)
const hashPassword = (password: string): string => {
  // Simple hash para demo - NO usar en producción
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isOffline: false,
      isLoading: false,
      error: null,

      // ==========================================
      // Login Online
      // ==========================================
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Intentar login con API
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const body = await response.json();

          if (!response.ok || !body.success) {
            throw new Error(body.message || 'Error de autenticación');
          }

          // AuthController::login (backend-core) responde
          // {success, message, data: {user, token}} -no {user, token} en la
          // raíz, y no existe ningún campo refreshToken (Sanctum aquí no
          // maneja refresh tokens, solo el token de acceso). Leer data.user/
          // data.token directamente en la raíz dejaba user/token siempre
          // undefined, lo que rompía el login online para todo testigo.
          const user = body.data.user;
          const token = body.data.token;

          // Guardar en estado
          set({
            user: { id: user.id, email: user.email, nombre: user.full_name, permisos: [] },
            token,
            isAuthenticated: true,
            isOffline: false,
            isLoading: false,
            error: null,
          });

          // Guardar en IndexedDB para offline (incluye hash de la contraseña
          // para poder verificarla en loginOffline sin guardarla en claro)
          await dbService.guardarUsuario({
            id: user.id,
            email: user.email,
            nombre: user.full_name,
            token,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
            permisos: [],
            passwordHash: hashPassword(password),
          });

          return true;
        } catch {
          // Si falla online, intentar offline
          console.log('🌐 Login online falló, intentando offline...');
          return get().loginOffline(email, password);
        }
      },

      // ==========================================
      // Login Offline
      // ==========================================
      loginOffline: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          // Buscar usuario en IndexedDB
          const usuario = await dbService.obtenerUsuarioActual();

          if (!usuario) {
            set({
              isLoading: false,
              error: 'No hay datos de usuario guardados. Conéctese a internet primero.',
            });
            return false;
          }

          // Verificar email
          if (usuario.email !== email) {
            set({
              isLoading: false,
              error: 'Usuario no encontrado en modo offline',
            });
            return false;
          }

          // Verificar contraseña contra el hash guardado en el último login online.
          // Sin esta verificación, cualquiera con acceso físico al dispositivo podía
          // entrar como el último usuario autenticado sin conocer su contraseña.
          if (!usuario.passwordHash || usuario.passwordHash !== hashPassword(password)) {
            set({
              isLoading: false,
              error: 'Contraseña incorrecta',
            });
            return false;
          }

          // Verificar que el token no haya expirado
          if (Date.now() > usuario.expiresAt) {
            set({
              isLoading: false,
              error: 'Sesión expirada. Conéctese a internet para renovar.',
            });
            return false;
          }

          // Login exitoso offline
          set({
            user: {
              id: usuario.id,
              email: usuario.email,
              nombre: usuario.nombre,
              permisos: usuario.permisos,
            },
            token: usuario.token,
            isAuthenticated: true,
            isOffline: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch {
          set({
            isLoading: false,
            error: 'Error en autenticación offline',
          });
          return false;
        }
      },

      // ==========================================
      // Logout
      // ==========================================
      logout: async () => {
        const { token } = get();

        try {
          // Notificar al servidor (si está online)
          if (token && !get().isOffline) {
            await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
          }
        } catch (error) {
          console.log('Error notificando logout al servidor:', error);
        }

        // Limpiar estado
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isOffline: false,
          error: null,
        });

        // Limpiar IndexedDB
        const usuario = await dbService.obtenerUsuarioActual();
        if (usuario) {
          await dbService.eliminarUsuario(usuario.id);
        }
      },

      // Nota: no existe refreshSession() -el backend (backend-core) no
      // expone /api/auth/refresh ni maneja refresh tokens; el token de
      // Sanctum es de larga duración y se revoca en logout/cambio de
      // contraseña. Intentar refrescar contra esa ruta inexistente siempre
      // fallaba en silencio.

      // ==========================================
      // Check Offline Auth
      // ==========================================
      checkOfflineAuth: async () => {
        try {
          const usuario = await dbService.obtenerUsuarioActual();

          if (!usuario || Date.now() > usuario.expiresAt) {
            return false;
          }

          // Restaurar sesión desde IndexedDB
          set({
            user: {
              id: usuario.id,
              email: usuario.email,
              nombre: usuario.nombre,
              permisos: usuario.permisos,
            },
            token: usuario.token,
            isAuthenticated: true,
            isOffline: true,
          });

          return true;
        } catch {
          return false;
        }
      },

      // ==========================================
      // Utilidades
      // ==========================================
      clearError: () => set({ error: null }),

      setOffline: (isOffline: boolean) => set({ isOffline }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
