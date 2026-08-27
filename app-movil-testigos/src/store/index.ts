import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import actasReducer from './slices/actasSlice';
import syncReducer from './slices/syncSlice';

/**
 * Redux Store - App Móvil Nativa
 *
 * Estado global de la aplicación
 */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    actas: actasReducer,
    sync: syncReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser', 'actas/addActa'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
