import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { dbService } from '../services/DatabaseService';

/**
 * Hook: useMultiEleccion
 * 
 * Maneja múltiples elecciones simultáneas (Legislativas + Territoriales)
 * Permite al testigo reportar varios cargos en la misma mesa
 */

interface Eleccion {
  id: number;
  nombre: string;
  // elections.tipo se guarda en minúsculas ('territorial', 'legislativa',
  // 'presidencial'), no en mayúsculas -las comparaciones e.tipo ===
  // 'LEGISLATIVA'/'TERRITORIAL' en FormularioMultiCargo.tsx nunca coincidían,
  // dejando esas secciones del formulario siempre vacías sin importar
  // cuántas elecciones reales existieran.
  tipo: 'legislativa' | 'territorial' | 'presidencial';
  fecha: string;
}

interface Cargo {
  id: number;
  electionId: number;
  nombre: string;
  // election_positions.nivel se guarda en minúsculas ('municipal',
  // 'departamental', 'nacional', 'local' -ej. JAL-), no en mayúsculas.
  nivel: 'nacional' | 'departamental' | 'municipal' | 'local';
}

interface Candidato {
  id: number;
  nombre: string;
  partido: string;
  lista?: string;
  foto?: string;
}

export function useMultiEleccion() {
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [candidatos, setCandidatos] = useState<Record<number, Candidato[]>>({});
  const [loading, setLoading] = useState(true);

  // Cargar elecciones activas
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Intentar cache primero
        const cachedElecciones = await dbService.obtenerCache<Eleccion[]>('elecciones_activas');
        
        if (cachedElecciones) {
          setElecciones(cachedElecciones);
        }

        // Si hay conexión, actualizar desde servidor
        const status = await Network.getStatus();
        if (status.connected) {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/preconteo/elecciones`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setElecciones(data.data);
              await dbService.guardarCache('elecciones_activas', data.data, 3600);
            }
          }
        }
      } catch (error) {
        console.error('Error cargando elecciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Cargar cargos automáticamente para cada elección una vez que se conocen
  // (antes nadie invocaba cargarCargos y la lista de cargos quedaba vacía siempre)
  useEffect(() => {
    elecciones.forEach((eleccion) => {
      cargarCargos(eleccion.id);
    });
     
  }, [elecciones]);

  // Cargar cargos por elección
  const cargarCargos = async (eleccionId: number) => {
    try {
      const cacheKey = `cargos_eleccion_${eleccionId}`;
      const cached = await dbService.obtenerCache<Cargo[]>(cacheKey);
      
      if (cached) {
        setCargos(prev => [...prev.filter(c => c.electionId !== eleccionId), ...cached]);
      }

      const status = await Network.getStatus();
      if (status.connected) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/preconteo/elecciones/${eleccionId}/cargos`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // PrecountController::getCargosByEleccion() solo devuelve
            // {id, tipo, nombre, nivel} -election_positions no tiene columnas
            // numero_curules ni configuracion, así que esos dos campos nunca
            // tuvieron un valor real posible (antes: 'undefined curules' en
            // la UI). 'nivel_territorial' tampoco existe, era 'nivel'.
            const cargosData = data.data.map((c: any) => ({
              id: c.id,
              electionId: eleccionId,
              nombre: c.nombre,
              nivel: c.nivel,
            }));
            
            setCargos(prev => [
              ...prev.filter(c => c.electionId !== eleccionId),
              ...cargosData
            ]);
            await dbService.guardarCache(cacheKey, cargosData, 3600);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando cargos:', error);
    }
  };

  // Cargar candidatos por cargo
  const cargarCandidatos = async (cargoId: number) => {
    try {
      // Usar cache
      const cacheKey = `candidatos_cargo_${cargoId}`;
      const cached = await dbService.obtenerCache<Candidato[]>(cacheKey);
      
      if (cached) {
        setCandidatos(prev => ({ ...prev, [cargoId]: cached }));
        return;
      }

      const status = await Network.getStatus();
      if (status.connected) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/preconteo/candidatos?election_position_id=${cargoId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const candidatosData = data.data.map((c: any) => ({
              id: c.id,
              nombre: c.nombre,
              partido: c.partido_politico,
              lista: c.numero_tarjeton,
              foto: c.foto_url,
            }));
            
            setCandidatos(prev => ({ ...prev, [cargoId]: candidatosData }));
            await dbService.guardarCache(cacheKey, candidatosData, 3600);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando candidatos:', error);
    }
  };

  return {
    elecciones,
    cargos,
    candidatos,
    loading,
    cargarCargos,
    cargarCandidatos,
  };
}

export default useMultiEleccion;
