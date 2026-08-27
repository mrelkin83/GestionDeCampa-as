import { DatabaseService, ActaDB } from '../DatabaseService';

const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  withTransactionAsync: jest.fn(async (cb: () => Promise<void>) => cb()),
};

jest.mock('expo-sqlite/next', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

function buildActa(overrides: Partial<ActaDB> = {}): ActaDB {
  return {
    localId: 'local-1',
    electionId: 1,
    cargoId: 2,
    mesaId: 100,
    votos: [{ candidateId: 5, votos: 120 }],
    votantes: 300,
    votosNulos: 3,
    boletasEntregadas: 300,
    horaCierre: '16:00',
    observaciones: 'sin novedad',
    evidencias: ['file://a.jpg'],
    estado: 'PENDIENTE',
    intentos: 0,
    creadoEn: 1000,
    actualizadoEn: 1000,
    ...overrides,
  };
}

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset singleton so cada test parte de una instancia inicializada limpia.
    (DatabaseService as any).instance = undefined;
    db = DatabaseService.getInstance();
    await db.init();
  });

  it('init crea las 4 tablas esperadas (actas, candidatos, cache, sync_log)', () => {
    const statements = mockDb.execAsync.mock.calls.map(([sql]) => sql);
    expect(
      statements.some((s: string) =>
        s.includes('CREATE TABLE IF NOT EXISTS actas'),
      ),
    ).toBe(true);
    expect(
      statements.some((s: string) =>
        s.includes('CREATE TABLE IF NOT EXISTS candidatos'),
      ),
    ).toBe(true);
    expect(
      statements.some((s: string) =>
        s.includes('CREATE TABLE IF NOT EXISTS cache'),
      ),
    ).toBe(true);
    expect(
      statements.some((s: string) =>
        s.includes('CREATE TABLE IF NOT EXISTS sync_log'),
      ),
    ).toBe(true);
  });

  it('guardarActa serializa votos/evidencias como JSON antes de insertar', async () => {
    const acta = buildActa();
    await db.guardarActa(acta);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT OR REPLACE INTO actas'),
      expect.arrayContaining([
        acta.localId,
        acta.electionId,
        acta.cargoId,
        acta.mesaId,
        JSON.stringify(acta.votos),
        acta.votantes,
        acta.votosNulos,
        acta.boletasEntregadas,
        acta.horaCierre,
        acta.observaciones,
        JSON.stringify(acta.evidencias),
      ]),
    );
  });

  it('obtenerActasPendientes deserializa votos/evidencias de vuelta a objetos', async () => {
    const acta = buildActa();
    mockDb.getAllAsync.mockResolvedValue([
      {
        ...acta,
        votos: JSON.stringify(acta.votos),
        evidencias: JSON.stringify(acta.evidencias),
      },
    ]);

    const result = await db.obtenerActasPendientes();

    expect(result).toHaveLength(1);
    expect(result[0].votos).toEqual(acta.votos);
    expect(result[0].evidencias).toEqual(acta.evidencias);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining("WHERE estado IN ('PENDIENTE', 'ERROR')"),
    );
  });

  it('obtenerActaPorLocalId retorna null si no existe la fila', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    await expect(db.obtenerActaPorLocalId('no-existe')).resolves.toBeNull();
  });

  it('actualizarActa solo incluye en el SET los campos recibidos (nunca id/localId)', async () => {
    await db.actualizarActa('local-1', { estado: 'ENVIADO', intentos: 2 });

    const [sql, params] = mockDb.runAsync.mock.calls[0];
    expect(sql).toContain('estado = ?');
    expect(sql).toContain('intentos = ?');
    expect(sql).not.toContain('localId = ?,'); // localId solo debe aparecer en el WHERE final
    expect(sql.trim().endsWith('WHERE localId = ?')).toBe(true);
    expect(params[params.length - 1]).toBe('local-1'); // último bind es el WHERE
  });

  it('actualizarActa serializa votos/evidencias a JSON cuando vienen en los cambios', async () => {
    await db.actualizarActa('local-1', {
      votos: [{ candidateId: 1, votos: 10 }],
    });

    const [, params] = mockDb.runAsync.mock.calls[0];
    expect(params[0]).toBe(JSON.stringify([{ candidateId: 1, votos: 10 }]));
  });

  it('eliminarActa borra por localId', async () => {
    await db.eliminarActa('local-1');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM actas WHERE localId = ?',
      ['local-1'],
    );
  });

  it('contarActasPendientes retorna 0 cuando la consulta no devuelve fila', async () => {
    mockDb.getFirstAsync.mockResolvedValue(undefined);
    await expect(db.contarActasPendientes()).resolves.toBe(0);
  });

  it('contarActasPendientes retorna el conteo real de la consulta', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 4 });
    await expect(db.contarActasPendientes()).resolves.toBe(4);
  });

  it('guardarCache/obtenerCache: retorna el valor cuando el TTL no ha expirado', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    mockDb.getFirstAsync.mockResolvedValue({
      datos: JSON.stringify({ foo: 'bar' }),
      timestamp: now,
      ttl: 3600,
    });

    await expect(db.obtenerCache('clave')).resolves.toEqual({ foo: 'bar' });
    expect(mockDb.runAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM cache'),
      expect.anything(),
    );
  });

  it('obtenerCache borra y retorna null cuando el TTL ya expiró', async () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    mockDb.getFirstAsync.mockResolvedValue({
      datos: JSON.stringify({ foo: 'bar' }),
      timestamp: now - 10_000,
      ttl: 1, // 1 segundo, ya vencido
    });

    await expect(db.obtenerCache('clave')).resolves.toBeNull();
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      'DELETE FROM cache WHERE clave = ?',
      ['clave'],
    );
  });

  it('obtenerCache retorna null si no hay entrada guardada', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    await expect(db.obtenerCache('no-existe')).resolves.toBeNull();
  });

  it('contarEnviadasHoy filtra por estado ENVIADO y fecha de hoy', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ count: 3 });
    await expect(db.contarEnviadasHoy()).resolves.toBe(3);

    const [sql] = mockDb.getFirstAsync.mock.calls[0];
    expect(sql).toContain("estado = 'ENVIADO'");
    expect(sql).toContain('actualizadoEn >=');
  });

  it('guardarCandidatos inserta cada candidato dentro de una transacción', async () => {
    await db.guardarCandidatos([
      {
        id: 1,
        electionPositionId: 2,
        nombre: 'Candidato A',
        partidoPolitico: 'Partido X',
      },
      {
        id: 2,
        electionPositionId: 2,
        nombre: 'Candidato B',
        partidoPolitico: 'Partido Y',
      },
    ]);

    expect(mockDb.withTransactionAsync).toHaveBeenCalled();
    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });

  it('lanza un error explícito si se opera antes de init()', async () => {
    const uninitialized = new (DatabaseService as any)();
    await expect(uninitialized.guardarActa(buildActa())).rejects.toThrow(
      'Database not initialized',
    );
  });
});
