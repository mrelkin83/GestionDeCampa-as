import { ENV } from '../config/env';
import { DatabaseService, CandidatoDB } from './DatabaseService';

/**
 * Descarga y cachea localmente el catálogo electoral (elecciones activas,
 * cargos, candidatos) que el testigo necesita para diligenciar un acta.
 *
 * Antes de este servicio, nada en la app llamaba nunca a
 * /api/preconteo/elecciones|.../cargos|candidatos: FormularioActaScreen leía
 * candidatos solo de SQLite local (db.getCandidatos), pero jamás se
 * descargaban desde el backend -la tabla local quedaba vacía para siempre.
 * Estos 3 endpoints son públicos (no requieren auth, ver routes/api.php de
 * backend-core), igual que en pwa-testigos.
 */

export interface EleccionCatalogo {
  id: number;
  year: number;
  tipo: string;
  fecha: string;
  nombre: string;
}

export interface CargoCatalogo {
  id: number;
  tipo: string;
  nombre: string;
  nivel: string;
}

const db = DatabaseService.getInstance();

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${ENV.apiUrl}/api${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} respondió ${response.status}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.message || `GET ${path} falló`);
  }
  return json.data as T;
}

export const CatalogoService = {
  async obtenerElecciones(): Promise<EleccionCatalogo[]> {
    const cacheKey = 'elecciones_activas';
    try {
      const elecciones = await fetchJson<EleccionCatalogo[]>(
        '/preconteo/elecciones',
      );
      await db.guardarCache(cacheKey, elecciones, 3600);
      return elecciones;
    } catch (error) {
      console.error('Error descargando elecciones, usando cache:', error);
      return (await db.obtenerCache<EleccionCatalogo[]>(cacheKey)) || [];
    }
  },

  async obtenerCargos(eleccionId: number): Promise<CargoCatalogo[]> {
    const cacheKey = `cargos_eleccion_${eleccionId}`;
    try {
      const cargos = await fetchJson<CargoCatalogo[]>(
        `/preconteo/elecciones/${eleccionId}/cargos`,
      );
      await db.guardarCache(cacheKey, cargos, 3600);
      return cargos;
    } catch (error) {
      console.error('Error descargando cargos, usando cache:', error);
      return (await db.obtenerCache<CargoCatalogo[]>(cacheKey)) || [];
    }
  },

  /**
   * Descarga candidatos de un cargo y los guarda en la tabla local
   * `candidatos` (la que ya lee FormularioActaScreen vía db.getCandidatos).
   */
  async sincronizarCandidatos(cargoId: number): Promise<CandidatoDB[]> {
    const data = await fetchJson<
      Array<{
        id: number;
        nombre: string;
        partido_politico: string | null;
        numero_tarjeton: string | null;
      }>
    >(`/preconteo/candidatos?election_position_id=${cargoId}`);

    const candidatos: CandidatoDB[] = data.map(c => ({
      id: c.id,
      electionPositionId: cargoId,
      nombre: c.nombre,
      partidoPolitico: c.partido_politico || '',
      numero: c.numero_tarjeton ? Number(c.numero_tarjeton) : undefined,
    }));

    await db.guardarCandidatos(candidatos);
    return candidatos;
  },

  /**
   * Sincroniza el catálogo completo: elecciones -> cargos -> candidatos.
   * Pensado para llamarse al abrir la app o al entrar a "Nueva acta".
   */
  async sincronizarTodo(): Promise<void> {
    const elecciones = await this.obtenerElecciones();

    for (const eleccion of elecciones) {
      const cargos = await this.obtenerCargos(eleccion.id);

      for (const cargo of cargos) {
        try {
          await this.sincronizarCandidatos(cargo.id);
        } catch (error) {
          // Un cargo sin candidatos aún (o el backend caído) no debe
          // detener la sincronización del resto del catálogo.
          console.error(
            `Error sincronizando candidatos del cargo ${cargo.id}:`,
            error,
          );
        }
      }
    }
  },
};
