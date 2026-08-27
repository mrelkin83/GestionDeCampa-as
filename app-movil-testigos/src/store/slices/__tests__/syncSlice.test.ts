import syncReducer, { setSyncEstado, syncCompletada } from '../syncSlice';

describe('syncSlice', () => {
  const initialState = syncReducer(undefined, { type: '@@INIT' });

  it('estado inicial no está sincronizando ni tiene errores', () => {
    expect(initialState).toEqual({
      isSyncing: false,
      intervaloActivo: false,
      ultimaSincronizacion: null,
      ultimoError: null,
    });
  });

  it('setSyncEstado refleja isSyncing/intervaloActivo tal como los reporta SyncService', () => {
    const state = syncReducer(
      initialState,
      setSyncEstado({ isSyncing: true, intervaloActivo: true }),
    );
    expect(state.isSyncing).toBe(true);
    expect(state.intervaloActivo).toBe(true);
  });

  it('syncCompletada sin errores limpia ultimoError y marca isSyncing=false', () => {
    const syncing = syncReducer(
      initialState,
      setSyncEstado({ isSyncing: true, intervaloActivo: true }),
    );
    const state = syncReducer(syncing, syncCompletada({ errores: [] }));

    expect(state.isSyncing).toBe(false);
    expect(state.ultimoError).toBeNull();
    expect(state.ultimaSincronizacion).not.toBeNull();
  });

  it('syncCompletada con errores guarda el primer error como ultimoError', () => {
    const state = syncReducer(
      initialState,
      syncCompletada({
        errores: ['Mesa 12: timeout', 'Mesa 13: error del servidor'],
      }),
    );

    expect(state.ultimoError).toBe('Mesa 12: timeout');
  });
});
