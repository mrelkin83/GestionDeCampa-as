import actasReducer, {
  fetchPendientes,
  addActa,
  updateActa,
  eliminarActa,
  sincronizarActa,
  setEleccionActiva,
  setCargos,
  fetchPendientesCountAsync,
} from '../actasSlice';
import type { ActaDB } from '../../../services/DatabaseService';

function buildActa(overrides: Partial<ActaDB> = {}): ActaDB {
  return {
    localId: 'local-1',
    electionId: 1,
    cargoId: 1,
    mesaId: 100,
    votos: [],
    votantes: 300,
    votosNulos: 0,
    boletasEntregadas: 300,
    horaCierre: '16:00',
    observaciones: '',
    evidencias: [],
    estado: 'PENDIENTE',
    intentos: 0,
    creadoEn: Date.now(),
    actualizadoEn: Date.now(),
    ...overrides,
  };
}

describe('actasSlice', () => {
  const initialState = actasReducer(undefined, { type: '@@INIT' });

  it('fetchPendientes reemplaza la lista y actualiza el contador', () => {
    const actas = [buildActa({ localId: 'a' }), buildActa({ localId: 'b' })];
    const state = actasReducer(initialState, fetchPendientes(actas));

    expect(state.actas).toHaveLength(2);
    expect(state.pendientesCount).toBe(2);
  });

  it('addActa inserta al inicio de la lista e incrementa el contador', () => {
    const state1 = actasReducer(
      initialState,
      fetchPendientes([buildActa({ localId: 'a' })]),
    );
    const state2 = actasReducer(
      state1,
      addActa(buildActa({ localId: 'nueva' })),
    );

    expect(state2.actas[0].localId).toBe('nueva');
    expect(state2.pendientesCount).toBe(2);
  });

  it('updateActa aplica un merge parcial sobre el acta correspondiente por localId', () => {
    const state1 = actasReducer(
      initialState,
      fetchPendientes([buildActa({ localId: 'a', votantes: 100 })]),
    );
    const state2 = actasReducer(
      state1,
      updateActa({ localId: 'a', data: { estado: 'ENVIADO' } }),
    );

    expect(state2.actas[0].estado).toBe('ENVIADO');
    expect(state2.actas[0].votantes).toBe(100); // el resto de campos no se toca
  });

  it('updateActa no falla si el localId no existe', () => {
    const state1 = actasReducer(
      initialState,
      fetchPendientes([buildActa({ localId: 'a' })]),
    );
    const state2 = actasReducer(
      state1,
      updateActa({ localId: 'inexistente', data: { estado: 'ERROR' } }),
    );

    expect(state2.actas).toEqual(state1.actas);
  });

  it('eliminarActa quita el acta y recalcula el contador solo con PENDIENTE/ERROR', () => {
    const state1 = actasReducer(
      initialState,
      fetchPendientes([
        buildActa({ localId: 'a', estado: 'PENDIENTE' }),
        buildActa({ localId: 'b', estado: 'ENVIADO' }),
      ]),
    );
    const state2 = actasReducer(state1, eliminarActa('b'));

    expect(state2.actas).toHaveLength(1);
    // pendientesCount se recalcula filtrando por estado, no simplemente length-1
    expect(state2.pendientesCount).toBe(1);
  });

  it('sincronizarActa marca el acta como ENVIANDO', () => {
    const state1 = actasReducer(
      initialState,
      fetchPendientes([buildActa({ localId: 'a', estado: 'PENDIENTE' })]),
    );
    const state2 = actasReducer(state1, sincronizarActa('a'));

    expect(state2.actas[0].estado).toBe('ENVIANDO');
  });

  it('setEleccionActiva y setCargos actualizan su parte del estado', () => {
    const state1 = actasReducer(
      initialState,
      setEleccionActiva({
        id: 1,
        nombre: 'Elección 2027',
        tipo: 'territorial',
        fecha: '2027-10-25',
      }),
    );
    const state2 = actasReducer(
      state1,
      setCargos([
        { id: 1, electionId: 1, nombre: 'Alcaldía', nivel: 'municipal' },
      ]),
    );

    expect(state2.eleccionActiva?.nombre).toBe('Elección 2027');
    expect(state2.cargos).toHaveLength(1);
  });

  it('fetchPendientesCountAsync.fulfilled actualiza pendientesCount con el valor real de SQLite', () => {
    const state = actasReducer(
      initialState,
      fetchPendientesCountAsync.fulfilled(7, 'requestId'),
    );

    expect(state.pendientesCount).toBe(7);
  });
});
