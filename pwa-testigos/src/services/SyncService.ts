import { dbService } from './DatabaseService';
import useAuthStore from '../stores/authStore';
import axios from 'axios';

/**
 * Servicio: SyncService
 * 
 * Maneja la sincronización de datos entre el dispositivo y el servidor.
 * Incluye background sync, reintentos automáticos y manejo de conflictos.
 */

interface SyncResult {
  success: boolean;
  message: string;
  actasProcesadas: number;
  errores: string[];
}

class SyncService {
  private isSyncing = false;
  private syncInterval: number | null = null;

  /**
   * Iniciar sincronización automática periódica
   */
  iniciarSyncAutomatico(intervaloMinutos: number = 5): void {
    this.detenerSyncAutomatico();
    
    this.syncInterval = window.setInterval(async () => {
      const online = navigator.onLine;
      if (online && !this.isSyncing) {
        await this.sincronizarTodo();
      }
    }, intervaloMinutos * 60 * 1000);

    console.log(`🔄 Sincronización automática iniciada (${intervaloMinutos}min)`);
  }

  /**
   * Detener sincronización automática
   */
  detenerSyncAutomatico(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sincronizar todas las actas pendientes
   */
  async sincronizarTodo(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        message: 'Ya hay una sincronización en progreso',
        actasProcesadas: 0,
        errores: [],
      };
    }

    this.isSyncing = true;
    const resultados: SyncResult = {
      success: true,
      message: '',
      actasProcesadas: 0,
      errores: [],
    };

    try {
      // Obtener actas pendientes
      const actasPendientes = await dbService.obtenerActasPendientes('PENDIENTE');
      const actasError = await dbService.obtenerActasPendientes('ERROR');
      const actasAProcesar = [...actasPendientes, ...actasError];

      if (actasAProcesar.length === 0) {
        resultados.message = 'No hay actas pendientes de sincronizar';
        return resultados;
      }

      console.log(`📤 Sincronizando ${actasAProcesar.length} actas...`);

      // Procesar cada acta
      for (const acta of actasAProcesar) {
        try {
          if (!acta.id) continue;

          await this.sincronizarActa(acta.id);
          resultados.actasProcesadas++;
        } catch (error: any) {
          console.error('Error sincronizando acta:', error);
          resultados.errores.push(`Mesa ${acta.mesaId}: ${error.message}`);
        }
      }

      // Guardar log de sincronización
      await dbService.agregarLog({
        tipo: 'DESCARGA',
        estado: resultados.errores.length === 0 ? 'EXITO' : 'ERROR',
        mensaje: `Sincronización completada: ${resultados.actasProcesadas} actas`,
        timestamp: Date.now(),
      });

      resultados.message = `Sincronización completada: ${resultados.actasProcesadas} actas procesadas`;
      
      if (resultados.errores.length > 0) {
        resultados.success = false;
        resultados.message += `, ${resultados.errores.length} errores`;
      }

      return resultados;
    } catch (error: any) {
      console.error('Error en sincronización:', error);
      resultados.success = false;
      resultados.message = `Error general: ${error.message}`;
      return resultados;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronizar una acta específica
   */
  async sincronizarActa(id: number): Promise<void> {
    const acta = await dbService.obtenerActaPendiente(id);
    if (!acta) {
      throw new Error('Acta no encontrada');
    }

    // Marcar como enviando
    await dbService.actualizarActaPendiente(id, {
      estado: 'ENVIANDO',
    });

    try {
      // Preparar datos para envío, mapeados al contrato real de
      // POST /api/internal/preconteo/acta en backend-core (PrecountController::storeActa)
      const datosActa = {
        polling_table_id: acta.mesaId,
        election_position_id: acta.cargoId,
        total_sufragantes: acta.votantes,
        votos_nulos: acta.votosNulos,
        votos_no_marcados: acta.votosNoMarcados,
        resultados: acta.votos.map((v) => ({
          candidate_id: v.candidateId,
          votos: v.votos,
        })),
        observaciones: acta.observaciones,
        imagen_acta: acta.evidencias[0] || null, // Primera imagen como base64
        offline: true,
      };

      // Enviar al servidor
      const token = useAuthStore.getState().token;
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/internal/preconteo/acta`,
        datosActa,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos timeout
        }
      );

      if (response.data.success) {
        // Marcar como enviado
        await dbService.actualizarActaPendiente(id, {
          estado: 'ENVIADO',
          intentos: acta.intentos + 1,
        });

        console.log(`✅ Acta Mesa #${acta.mesaId} sincronizada`);
      } else {
        throw new Error(response.data.message || 'Error del servidor');
      }
    } catch (error: any) {
      // Marcar como error
      await dbService.actualizarActaPendiente(id, {
        estado: 'ERROR',
        error: error.message,
        intentos: acta.intentos + 1,
      });

      throw error;
    }
  }

  /**
   * Reintentar actas en error
   */
  async reintentarErrores(): Promise<SyncResult> {
    const actasError = await dbService.obtenerActasPendientes('ERROR');
    
    if (actasError.length === 0) {
      return {
        success: true,
        message: 'No hay actas con error para reintentar',
        actasProcesadas: 0,
        errores: [],
      };
    }

    // Resetear estado a PENDIENTE para reintentar
    for (const acta of actasError) {
      if (acta.id) {
        await dbService.actualizarActaPendiente(acta.id, {
          estado: 'PENDIENTE',
          error: undefined,
        });
      }
    }

    // Sincronizar
    return this.sincronizarTodo();
  }

  /**
   * Registrar para Background Sync (si está disponible)
   */
  async registrarBackgroundSync(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('Background Sync no soportado');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      // Background Sync (SyncManager) todavía no está en los tipos DOM estándar de TS
      await (registration as ServiceWorkerRegistration & {
        sync: { register(tag: string): Promise<void> };
      }).sync.register('sync-actas');
      console.log('✅ Background Sync registrado');
    } catch (error) {
      console.error('Error registrando Background Sync:', error);
    }
  }

  /**
   * Descargar datos necesarios para trabajo offline
   */
  async descargarDatosOffline(): Promise<void> {
    try {
      const token = useAuthStore.getState().token;

      // Descargar elecciones
      const eleccionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/preconteo/elecciones`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (eleccionesResponse.data.success) {
        await dbService.guardarCache('elecciones', eleccionesResponse.data.data, 86400);
      }

      // Descargar candidatos
      // TODO: Implementar endpoint de candidatos

      await dbService.agregarLog({
        tipo: 'DESCARGA',
        estado: 'EXITO',
        mensaje: 'Datos offline descargados correctamente',
        timestamp: Date.now(),
      });

      console.log('✅ Datos offline descargados');
    } catch (error: any) {
      console.error('Error descargando datos offline:', error);
      throw error;
    }
  }

  /**
   * Verificar si hay actas pendientes
   */
  async hayActasPendientes(): Promise<boolean> {
    const count = await dbService.contarActasPendientes();
    return count > 0;
  }

  /**
   * Obtener estado de sincronización
   */
  getEstadoSync(): { isSyncing: boolean; intervaloActivo: boolean } {
    return {
      isSyncing: this.isSyncing,
      intervaloActivo: this.syncInterval !== null,
    };
  }
}

// Singleton
export const syncService = new SyncService();
export default syncService;
