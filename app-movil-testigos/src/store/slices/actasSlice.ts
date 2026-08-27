import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DatabaseService, ActaDB } from '../../services/DatabaseService';

// Reutiliza ActaDB (DatabaseService) en vez de mantener una segunda
// interfaz "Acta" casi idéntica: dos copias del mismo shape se desincronizan
// (ver bug: acá faltaba votosNulos y "votos" declaraba any[] en vez del tipo real).
type Acta = ActaDB;

interface Cargo {
  id: number;
  electionId: number;
  nombre: string;
  nivel: string;
}

interface Eleccion {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
}

interface ActasState {
  actas: Acta[];
  eleccionActiva: Eleccion | null;
  cargos: Cargo[];
  pendientesCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: ActasState = {
  actas: [],
  eleccionActiva: null,
  cargos: [],
  pendientesCount: 0,
  loading: false,
  error: null,
};

// Lee el conteo real de actas pendientes desde SQLite (antes, HomeScreen
// llamaba a fetchPendientesCount() sin argumentos, que solo ponía
// pendientesCount = undefined y nunca consultaba la base de datos).
export const fetchPendientesCountAsync = createAsyncThunk(
  'actas/fetchPendientesCountAsync',
  async () => {
    const db = DatabaseService.getInstance();
    return db.contarActasPendientes();
  },
);

const actasSlice = createSlice({
  name: 'actas',
  initialState,
  reducers: {
    fetchPendientes: (state, action: PayloadAction<Acta[]>) => {
      state.actas = action.payload;
      state.pendientesCount = action.payload.length;
    },
    addActa: (state, action: PayloadAction<Acta>) => {
      state.actas.unshift(action.payload);
      state.pendientesCount++;
    },
    updateActa: (
      state,
      action: PayloadAction<{ localId: string; data: Partial<Acta> }>,
    ) => {
      const index = state.actas.findIndex(
        a => a.localId === action.payload.localId,
      );
      if (index !== -1) {
        state.actas[index] = { ...state.actas[index], ...action.payload.data };
      }
    },
    eliminarActa: (state, action: PayloadAction<string>) => {
      state.actas = state.actas.filter(a => a.localId !== action.payload);
      state.pendientesCount = state.actas.filter(
        a => a.estado === 'PENDIENTE' || a.estado === 'ERROR',
      ).length;
    },
    sincronizarActa: (state, action: PayloadAction<string>) => {
      const index = state.actas.findIndex(a => a.localId === action.payload);
      if (index !== -1) {
        state.actas[index].estado = 'ENVIANDO';
      }
    },
    setEleccionActiva: (state, action: PayloadAction<Eleccion>) => {
      state.eleccionActiva = action.payload;
    },
    setCargos: (state, action: PayloadAction<Cargo[]>) => {
      state.cargos = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchPendientesCountAsync.fulfilled, (state, action) => {
      state.pendientesCount = action.payload;
    });
  },
});

export const {
  fetchPendientes,
  addActa,
  updateActa,
  eliminarActa,
  sincronizarActa,
  setEleccionActiva,
  setCargos,
} = actasSlice.actions;

export default actasSlice.reducer;
