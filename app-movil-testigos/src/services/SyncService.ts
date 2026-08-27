import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { DatabaseService } from './DatabaseService';
import { TokenStorage } from './TokenStorage';
import { ENV } from '../config/env';

/**
 * SyncService - Sincronización Background
 *
 * Maneja la sincronización de datos entre el dispositivo y el servidor
 * en tiempo real, usando tareas en background y notificaciones.
 */

const SYNC_TASK = 'BACKGROUND_SYNC_ACTAS';

export interface SyncResult {
  success: boolean;
  actasSincronizadas: number;
  errores: string[];
}

// Definir la tarea de background
TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    const syncService = SyncService.getInstance();
    const result = await syncService.sincronizarTodo();

    if (result.actasSincronizadas > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Sincronización completada',
          body: `${result.actasSincronizadas} actas sincronizadas`,
        },
        trigger: null,
      });
    }

    return result.success
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Error en background sync:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class SyncService {
  private static instance: SyncService;
  private db: DatabaseService;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Iniciar sincronización automática
   */
  async iniciarSyncAutomatico(intervaloMinutos: number = 5): Promise<void> {
    // Detener si ya está corriendo
    await this.detenerSyncAutomatico();

    // Registrar tarea de background (cada 15 min mínimo)
    try {
      await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutos (mínimo permitido por iOS)
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ Background sync registrado');
    } catch (error) {
      console.log('Background sync no disponible:', error);
    }

    // Intervalo adicional en foreground
    this.syncInterval = setInterval(
      async () => {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && !this.isSyncing) {
          await this.sincronizarTodo();
        }
      },
      intervaloMinutos * 60 * 1000,
    );

    console.log(
      `✅ Sincronización automática cada ${intervaloMinutos} minutos`,
    );
  }

  /**
   * Detener sincronización automática
   */
  async detenerSyncAutomatico(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    try {
      await BackgroundFetch.unregisterTaskAsync(SYNC_TASK);
    } catch (error) {
      // Ignorar si no estaba registrado
    }
  }

  /**
   * Sincronizar todas las actas pendientes
   */
  async sincronizarTodo(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: true,
        actasSincronizadas: 0,
        errores: ['Ya hay una sincronización en progreso'],
      };
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return {
        success: false,
        actasSincronizadas: 0,
        errores: ['Sin conexión a internet'],
      };
    }

    this.isSyncing = true;
    const resultado: SyncResult = {
      success: true,
      actasSincronizadas: 0,
      errores: [],
    };

    try {
      const actasPendientes = await this.db.obtenerActasPendientes();

      if (actasPendientes.length === 0) {
        return resultado;
      }

      console.log(`📤 Sincronizando ${actasPendientes.length} actas...`);

      for (const acta of actasPendientes) {
        try {
          await this.sincronizarActaIndividual(acta);
          resultado.actasSincronizadas++;
        } catch (error: any) {
          console.error('Error sincronizando acta:', error);
          resultado.errores.push(`Mesa ${acta.mesaId}: ${error.message}`);
        }
      }

      // Guardar log
      await this.db.agregarLog({
        tipo: 'SYNC_BATCH',
        estado: resultado.errores.length === 0 ? 'EXITO' : 'PARCIAL',
        mensaje: `Sincronizadas ${resultado.actasSincronizadas} actas`,
        datos: { errores: resultado.errores },
      });

      return resultado;
    } catch (error: any) {
      console.error('Error en sincronización:', error);
      resultado.success = false;
      resultado.errores.push(error.message);
      return resultado;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronizar una acta individual
   */
  private async sincronizarActaIndividual(acta: any): Promise<void> {
    // Marcar como enviando
    await this.db.actualizarActa(acta.localId, { estado: 'ENVIANDO' });

    try {
      const token = await this.getToken();

      if (!token) {
        throw new Error(
          'No hay sesión activa: no se puede sincronizar sin autenticación',
        );
      }

      // Contrato real de POST /api/internal/preconteo/acta (PrecountController::storeActa).
      // El formulario local no captura votos_nulos/votos_no_marcados todavía
      // (ver FormularioActaScreen); se envían tal cual los capturó el testigo.
      const votosPorCandidato = (acta.votos || []).filter(
        (v: any) => v.candidateId !== 0,
      );
      const votosEnBlanco = (acta.votos || []).find(
        (v: any) => v.candidateId === 0,
      );

      const response = await fetch(
        `${ENV.apiUrl}/api/internal/preconteo/acta`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            polling_table_id: acta.mesaId,
            election_position_id: acta.cargoId,
            total_sufragantes: acta.votantes,
            votos_nulos: acta.votosNulos ?? 0,
            votos_no_marcados:
              acta.votosNoMarcados ?? (votosEnBlanco ? votosEnBlanco.votos : 0),
            resultados: votosPorCandidato.map((v: any) => ({
              candidate_id: v.candidateId,
              votos: v.votos,
            })),
            observaciones: acta.observaciones,
            imagen_acta: acta.evidencias[0] || null,
            offline: true,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error del servidor');
      }

      const data = await response.json();

      if (data.success) {
        // Marcar como enviado
        await this.db.actualizarActa(acta.localId, {
          estado: 'ENVIADO',
          intentos: (acta.intentos || 0) + 1,
        });

        console.log(`✅ Acta Mesa #${acta.mesaId} sincronizada`);
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (error: any) {
      // Marcar como error
      await this.db.actualizarActa(acta.localId, {
        estado: 'ERROR',
        error: error.message,
        intentos: (acta.intentos || 0) + 1,
      });

      throw error;
    }
  }

  /**
   * Obtener token de autenticación desde almacenamiento seguro
   */
  private async getToken(): Promise<string | null> {
    return TokenStorage.getToken();
  }

  /**
   * Verificar si hay actas pendientes
   */
  async hayActasPendientes(): Promise<boolean> {
    const count = await this.db.contarActasPendientes();
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

export default SyncService;
