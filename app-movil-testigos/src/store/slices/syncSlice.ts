import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Estado de sincronización en background, en línea con la forma que ya
 * expone SyncService.getEstadoSync() (isSyncing, intervaloActivo).
 */
interface SyncState {
  isSyncing: boolean;
  intervaloActivo: boolean;
  ultimaSincronizacion: number | null;
  ultimoError: string | null;
}

const initialState: SyncState = {
  isSyncing: false,
  intervaloActivo: false,
  ultimaSincronizacion: null,
  ultimoError: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncEstado: (
      state,
      action: PayloadAction<{ isSyncing: boolean; intervaloActivo: boolean }>,
    ) => {
      state.isSyncing = action.payload.isSyncing;
      state.intervaloActivo = action.payload.intervaloActivo;
    },
    syncCompletada: (state, action: PayloadAction<{ errores: string[] }>) => {
      state.isSyncing = false;
      state.ultimaSincronizacion = Date.now();
      state.ultimoError = action.payload.errores[0] ?? null;
    },
  },
});

export const { setSyncEstado, syncCompletada } = syncSlice.actions;
export default syncSlice.reducer;
