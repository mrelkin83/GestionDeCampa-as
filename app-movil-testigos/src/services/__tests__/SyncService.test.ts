import NetInfo from '@react-native-community/netinfo';
import { SyncService } from '../SyncService';
import { TokenStorage } from '../TokenStorage';

const mockDbInstance = {
  obtenerActasPendientes: jest.fn(),
  obtenerActaPorLocalId: jest.fn(),
  actualizarActa: jest.fn(),
  agregarLog: jest.fn(),
};

jest.mock('../DatabaseService', () => ({
  DatabaseService: {
    getInstance: jest.fn(() => mockDbInstance),
  },
}));

jest.mock('../TokenStorage', () => ({
  TokenStorage: {
    getToken: jest.fn(),
  },
}));

jest.mock('../../config/env', () => ({
  ENV: { apiUrl: 'https://api.test' },
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

// expo-background-fetch / expo-task-manager / expo-notifications se
// registran a nivel de módulo en SyncService.ts (TaskManager.defineTask) -sin
// mockearlos, importar el servicio en el entorno de test falla.
jest.mock('expo-background-fetch', () => ({
  BackgroundFetchResult: {
    NewData: 'newData',
    NoData: 'noData',
    Failed: 'failed',
  },
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
}));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
}));

function buildActaPendiente(overrides: Partial<any> = {}) {
  return {
    localId: 'local-1',
    mesaId: 100,
    cargoId: 1,
    votantes: 300,
    votosNulos: 0,
    votosNoMarcados: 0,
    votos: [{ candidateId: 5, votos: 120 }],
    observaciones: '',
    evidencias: [],
    estado: 'PENDIENTE',
    intentos: 0,
    ...overrides,
  };
}

describe('SyncService', () => {
  let sync: SyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    (SyncService as any).instance = undefined;
    sync = SyncService.getInstance();
    (global as any).fetch = jest.fn();
  });

  it('sin actas pendientes, retorna éxito inmediato sin llamar a la red', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActasPendientes.mockResolvedValue([]);

    const result = await sync.sincronizarTodo();

    expect(result).toEqual({
      success: true,
      actasSincronizadas: 0,
      errores: [],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sin conexión a internet, no intenta sincronizar', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

    const result = await sync.sincronizarTodo();

    expect(result.success).toBe(false);
    expect(result.errores).toContain('Sin conexión a internet');
    expect(mockDbInstance.obtenerActasPendientes).not.toHaveBeenCalled();
  });

  it('sincroniza cada acta pendiente y las marca ENVIADO al tener éxito', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActasPendientes.mockResolvedValue([
      buildActaPendiente(),
    ]);
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('token-123');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await sync.sincronizarTodo();

    expect(result.actasSincronizadas).toBe(1);
    expect(result.errores).toHaveLength(0);
    expect(mockDbInstance.actualizarActa).toHaveBeenCalledWith(
      'local-1',
      expect.objectContaining({ estado: 'ENVIADO' }),
    );
  });

  it('envía Authorization Bearer y el contrato real de /api/internal/preconteo/acta', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActasPendientes.mockResolvedValue([
      buildActaPendiente({ mesaId: 42, cargoId: 7 }),
    ]);
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('token-123');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await sync.sincronizarTodo();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test/api/internal/preconteo/acta',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
      }),
    );
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.polling_table_id).toBe(42);
    expect(body.election_position_id).toBe(7);
    expect(body.offline).toBe(true);
  });

  it('sin token de sesión, marca el acta como ERROR y la cuenta como fallida', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActasPendientes.mockResolvedValue([
      buildActaPendiente(),
    ]);
    (TokenStorage.getToken as jest.Mock).mockResolvedValue(null);

    const result = await sync.sincronizarTodo();

    expect(result.errores).toHaveLength(1);
    expect(mockDbInstance.actualizarActa).toHaveBeenCalledWith(
      'local-1',
      expect.objectContaining({ estado: 'ERROR' }),
    );
  });

  it('si una acta falla, sigue procesando el resto del lote', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActasPendientes.mockResolvedValue([
      buildActaPendiente({ localId: 'falla', mesaId: 1 }),
      buildActaPendiente({ localId: 'exito', mesaId: 2 }),
    ]);
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('token-123');
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Error del servidor' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const result = await sync.sincronizarTodo();

    expect(result.actasSincronizadas).toBe(1);
    expect(result.errores).toHaveLength(1);
  });

  it('mientras hay una sincronización en curso, una segunda llamada no vuelve a procesar', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    let resolveFetch: (value: any) => void;
    mockDbInstance.obtenerActasPendientes.mockResolvedValue([
      buildActaPendiente(),
    ]);
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('token-123');
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise(resolve => {
        resolveFetch = resolve;
      }),
    );

    const primeraLlamada = sync.sincronizarTodo();
    // isSyncing solo se marca true DESPUÉS del primer await interno
    // (NetInfo.fetch); hay que dejar avanzar la primera llamada hasta que
    // quede esperando el fetch (mockeado para colgar) antes de disparar la
    // segunda, o el guard "ya hay sincronización en progreso" nunca se
    // alcanza (ambas llamadas pasarían el chequeo en el mismo tick).
    await new Promise(resolve => setTimeout(resolve, 0));

    const segundaLlamada = await sync.sincronizarTodo();

    expect(segundaLlamada.errores).toContain(
      'Ya hay una sincronización en progreso',
    );

    resolveFetch!({ ok: true, json: async () => ({ success: true }) });
    await primeraLlamada;
  });

  it('sincronizarActa(localId) sincroniza solo el acta indicada, no todas las pendientes', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActaPorLocalId.mockResolvedValue(
      buildActaPendiente({ localId: 'puntual' }),
    );
    (TokenStorage.getToken as jest.Mock).mockResolvedValue('token-123');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await sync.sincronizarActa('puntual');

    expect(result.actasSincronizadas).toBe(1);
    expect(mockDbInstance.obtenerActasPendientes).not.toHaveBeenCalled();
  });

  it('sincronizarActa retorna error si el localId no existe', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    mockDbInstance.obtenerActaPorLocalId.mockResolvedValue(null);

    const result = await sync.sincronizarActa('no-existe');

    expect(result.success).toBe(false);
    expect(result.errores).toContain('Acta no encontrada');
  });
});
