// CatalogoService captura `DatabaseService.getInstance()` en una constante de
// módulo evaluada una sola vez, en el momento del import -antes de que
// cualquier variable declarada más abajo en este archivo de test exista
// (jest.mock() se hoistea por encima del import, pero el import de
// CatalogoService sigue ejecutándose antes que el resto del código de este
// archivo). Por eso el objeto mock se crea DENTRO de la factory, no fuera.
jest.mock('../DatabaseService', () => {
  const instance = {
    guardarCache: jest.fn(),
    obtenerCache: jest.fn(),
    guardarCandidatos: jest.fn(),
  };
  return { DatabaseService: { getInstance: () => instance } };
});

jest.mock('../../config/env', () => ({
  ENV: { apiUrl: 'https://api.test' },
}));

import { CatalogoService } from '../CatalogoService';
import { DatabaseService } from '../DatabaseService';

const mockDbInstance = DatabaseService.getInstance() as unknown as {
  guardarCache: jest.Mock;
  obtenerCache: jest.Mock;
  guardarCandidatos: jest.Mock;
};

describe('CatalogoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
  });

  it('obtenerElecciones descarga del backend y cachea el resultado', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: 1,
            year: 2027,
            tipo: 'territorial',
            fecha: '2027-10-25',
            nombre: 'Elecciones 2027',
          },
        ],
      }),
    });

    const result = await CatalogoService.obtenerElecciones();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test/api/preconteo/elecciones',
    );
    expect(result).toHaveLength(1);
    expect(mockDbInstance.guardarCache).toHaveBeenCalledWith(
      'elecciones_activas',
      result,
      3600,
    );
  });

  it('obtenerElecciones usa el caché local si el backend no responde', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError('Network request failed'),
    );
    mockDbInstance.obtenerCache.mockResolvedValue([
      {
        id: 1,
        year: 2027,
        tipo: 'territorial',
        fecha: '2027-10-25',
        nombre: 'cache',
      },
    ]);

    const result = await CatalogoService.obtenerElecciones();

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('cache');
  });

  it('obtenerElecciones retorna array vacío si falla la red y no hay caché', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      new TypeError('Network request failed'),
    );
    mockDbInstance.obtenerCache.mockResolvedValue(null);

    await expect(CatalogoService.obtenerElecciones()).resolves.toEqual([]);
  });

  it('lanza error cuando el backend responde success:false', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: 'Sin elecciones activas' }),
    });
    mockDbInstance.obtenerCache.mockResolvedValue(null);

    // El error se captura internamente y cae al fallback de caché (vacío aquí).
    await expect(CatalogoService.obtenerElecciones()).resolves.toEqual([]);
  });

  it('obtenerCargos usa una clave de caché específica por elección', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    await CatalogoService.obtenerCargos(5);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test/api/preconteo/elecciones/5/cargos',
    );
    expect(mockDbInstance.guardarCache).toHaveBeenCalledWith(
      'cargos_eleccion_5',
      [],
      3600,
    );
  });

  it('sincronizarCandidatos mapea partido_politico/numero_tarjeton al shape de CandidatoDB', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: 10,
            nombre: 'Candidato A',
            partido_politico: 'Partido X',
            numero_tarjeton: '15',
          },
          {
            id: 11,
            nombre: 'Candidato B',
            partido_politico: null,
            numero_tarjeton: null,
          },
        ],
      }),
    });

    const result = await CatalogoService.sincronizarCandidatos(3);

    expect(result[0]).toEqual({
      id: 10,
      electionPositionId: 3,
      nombre: 'Candidato A',
      partidoPolitico: 'Partido X',
      numero: 15,
    });
    expect(result[1].partidoPolitico).toBe('');
    expect(result[1].numero).toBeUndefined();
    expect(mockDbInstance.guardarCandidatos).toHaveBeenCalledWith(result);
  });

  it('sincronizarTodo recorre elecciones -> cargos -> candidatos y no se detiene si un cargo falla', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/preconteo/elecciones/1/cargos')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 100,
                tipo: 'alcaldia',
                nombre: 'Alcaldía',
                nivel: 'municipal',
              },
              {
                id: 200,
                tipo: 'concejo',
                nombre: 'Concejo',
                nivel: 'municipal',
              },
            ],
          }),
        });
      }
      if (url.includes('/preconteo/elecciones')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 1,
                year: 2027,
                tipo: 'territorial',
                fecha: '2027-10-25',
                nombre: 'Elecciones 2027',
              },
            ],
          }),
        });
      }
      if (url.includes('election_position_id=100')) {
        return Promise.reject(new Error('Cargo sin candidatos aún'));
      }
      if (url.includes('election_position_id=200')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        });
      }
      return Promise.reject(new Error('URL no esperada: ' + url));
    });

    await expect(CatalogoService.sincronizarTodo()).resolves.toBeUndefined();
    // Se llegó a intentar el candidato del cargo 200 pese a que el 100 falló.
    expect(mockDbInstance.guardarCandidatos).toHaveBeenCalledTimes(1);
  });
});
