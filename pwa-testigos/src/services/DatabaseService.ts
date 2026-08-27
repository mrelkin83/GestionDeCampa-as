import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Servicio: DatabaseService
 * 
 * Maneja el almacenamiento offline usando IndexedDB.
 * Permite guardar actas, evidencias y estados pendientes de sincronización.
 */

interface PreconteoDB extends DBSchema {
  // Usuarios autenticados (para login offline)
  usuarios: {
    key: number;
    value: {
      id: number;
      email: string;
      nombre: string;
      token: string;
      expiresAt: number;
      permisos: string[];
      // Hash (no reversible) de la contraseña, solo para validar el login offline.
      // No es un mecanismo criptográfico fuerte: es una verificación de conveniencia
      // para bloquear el acceso offline a quien no conoce la contraseña real.
      passwordHash?: string;
    };
  };

  // Actas pendientes de envío
  actas_pendientes: {
    key: number;
    value: {
      id?: number;
      localId: string; // UUID generado localmente
      electionId: number;
      cargoId: number;
      mesaId: number;
      votos: Array<{
        candidateId: number;
        votos: number;
      }>;
      votantes: number;
      votosNulos: number;
      votosNoMarcados: number;
      boletasEntregadas: number;
      horaCierre: string;
      observaciones: string;
      evidencias: string[]; // Array de base64 images
      estado: 'PENDIENTE' | 'ENVIANDO' | 'ENVIADO' | 'ERROR';
      intentos: number;
      error?: string;
      creadoEn: number;
      actualizadoEn: number;
    };
    indexes: { 'by-estado': string };
  };

  // Evidencias fotográficas
  evidencias: {
    key: string;
    value: {
      id: string; // UUID
      actaLocalId: string;
      imagenBase64: string;
      hash: string;
      procesado: boolean;
      creadoEn: number;
    };
    indexes: { 'by-acta': string };
  };

  // Datos sincronizados del servidor (cache)
  cache: {
    key: string;
    value: {
      clave: string;
      datos: any;
      timestamp: number;
      ttl: number; // Time to live en segundos
    };
  };

  // Log de sincronización
  sync_log: {
    key: number;
    value: {
      id?: number;
      tipo: 'ENVIO_ACTA' | 'ENVIO_EVIDENCIA' | 'DESCARGA';
      estado: 'EXITO' | 'ERROR';
      mensaje: string;
      datos?: any;
      timestamp: number;
    };
  };
}

const DB_NAME = 'PreconteoDB';
const DB_VERSION = 1;

class DatabaseService {
  private db: IDBPDatabase<PreconteoDB> | null = null;

  /**
   * Inicializar la base de datos
   */
  async init(): Promise<void> {
    this.db = await openDB<PreconteoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store: Usuarios
        if (!db.objectStoreNames.contains('usuarios')) {
          db.createObjectStore('usuarios', { keyPath: 'id' });
        }

        // Store: Actas pendientes
        if (!db.objectStoreNames.contains('actas_pendientes')) {
          const actasStore = db.createObjectStore('actas_pendientes', {
            keyPath: 'id',
            autoIncrement: true,
          });
          actasStore.createIndex('by-estado', 'estado');
        }

        // Store: Evidencias
        if (!db.objectStoreNames.contains('evidencias')) {
          const evidenciasStore = db.createObjectStore('evidencias', {
            keyPath: 'id',
          });
          evidenciasStore.createIndex('by-acta', 'actaLocalId');
        }

        // Store: Cache
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'clave' });
        }

        // Store: Sync Log
        if (!db.objectStoreNames.contains('sync_log')) {
          db.createObjectStore('sync_log', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });

    console.log('📦 IndexedDB inicializada');
  }

  // ==========================================
  // Usuarios
  // ==========================================

  async guardarUsuario(usuario: PreconteoDB['usuarios']['value']): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('usuarios', usuario);
  }

  async obtenerUsuario(id: number): Promise<PreconteoDB['usuarios']['value'] | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('usuarios', id);
  }

  async obtenerUsuarioActual(): Promise<PreconteoDB['usuarios']['value'] | undefined> {
    if (!this.db) await this.init();
    const usuarios = await this.db!.getAll('usuarios');
    // Devolver el primero (asumimos uno por dispositivo)
    return usuarios[0];
  }

  async eliminarUsuario(id: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('usuarios', id);
  }

  // ==========================================
  // Actas Pendientes
  // ==========================================

  async guardarActaPendiente(
    acta: Omit<PreconteoDB['actas_pendientes']['value'], 'id'>
  ): Promise<number> {
    if (!this.db) await this.init();
    const id = await this.db!.add('actas_pendientes', {
      ...acta,
      actualizadoEn: Date.now(),
    });
    return id;
  }

  async actualizarActaPendiente(
    id: number,
    cambios: Partial<PreconteoDB['actas_pendientes']['value']>
  ): Promise<void> {
    if (!this.db) await this.init();
    const acta = await this.db!.get('actas_pendientes', id);
    if (acta) {
      await this.db!.put('actas_pendientes', {
        ...acta,
        ...cambios,
        actualizadoEn: Date.now(),
      });
    }
  }

  async obtenerActasPendientes(
    estado?: PreconteoDB['actas_pendientes']['value']['estado']
  ): Promise<PreconteoDB['actas_pendientes']['value'][]> {
    if (!this.db) await this.init();
    
    if (estado) {
      return this.db!.getAllFromIndex('actas_pendientes', 'by-estado', estado);
    }
    
    return this.db!.getAll('actas_pendientes');
  }

  async obtenerActaPendiente(id: number): Promise<PreconteoDB['actas_pendientes']['value'] | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('actas_pendientes', id);
  }

  async obtenerActaPorLocalId(localId: string): Promise<PreconteoDB['actas_pendientes']['value'] | undefined> {
    if (!this.db) await this.init();
    const actas = await this.db!.getAll('actas_pendientes');
    return actas.find((a) => a.localId === localId);
  }

  async eliminarActaPendiente(id: number): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('actas_pendientes', id);
  }

  async contarActasPendientes(): Promise<number> {
    if (!this.db) await this.init();
    const actas = await this.db!.getAll('actas_pendientes');
    return actas.filter((a) => a.estado === 'PENDIENTE' || a.estado === 'ERROR').length;
  }

  // ==========================================
  // Evidencias
  // ==========================================

  async guardarEvidencia(
    evidencia: PreconteoDB['evidencias']['value']
  ): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('evidencias', evidencia);
  }

  async obtenerEvidenciasPorActa(actaLocalId: string): Promise<PreconteoDB['evidencias']['value'][]> {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex('evidencias', 'by-acta', actaLocalId);
  }

  async obtenerEvidencia(id: string): Promise<PreconteoDB['evidencias']['value'] | undefined> {
    if (!this.db) await this.init();
    return this.db!.get('evidencias', id);
  }

  async eliminarEvidencia(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('evidencias', id);
  }

  // ==========================================
  // Cache
  // ==========================================

  async guardarCache<T>(clave: string, datos: T, ttlSegundos: number = 3600): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('cache', {
      clave,
      datos,
      timestamp: Date.now(),
      ttl: ttlSegundos,
    });
  }

  async obtenerCache<T>(clave: string): Promise<T | null> {
    if (!this.db) await this.init();
    const item = await this.db!.get('cache', clave);
    
    if (!item) return null;
    
    // Verificar si expiró
    const ahora = Date.now();
    const expiracion = item.timestamp + item.ttl * 1000;
    
    if (ahora > expiracion) {
      await this.db!.delete('cache', clave);
      return null;
    }
    
    return item.datos as T;
  }

  async limpiarCache(): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear('cache');
  }

  // ==========================================
  // Sync Log
  // ==========================================

  async agregarLog(log: Omit<PreconteoDB['sync_log']['value'], 'id'>): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.add('sync_log', log);
  }

  async obtenerLogs(limit: number = 100): Promise<PreconteoDB['sync_log']['value'][]> {
    if (!this.db) await this.init();
    const logs = await this.db!.getAll('sync_log');
    return logs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async limpiarLogs(antiguedadDias: number = 7): Promise<void> {
    if (!this.db) await this.init();
    const logs = await this.db!.getAll('sync_log');
    const limiteTiempo = Date.now() - antiguedadDias * 24 * 60 * 60 * 1000;
    
    for (const log of logs) {
      if (log.timestamp < limiteTiempo && log.id) {
        await this.db!.delete('sync_log', log.id);
      }
    }
  }

  // ==========================================
  // Utilidades
  // ==========================================

  async limpiarTodo(): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.clear('usuarios');
    await this.db!.clear('actas_pendientes');
    await this.db!.clear('evidencias');
    await this.db!.clear('cache');
    await this.db!.clear('sync_log');
    console.log('🗑️  IndexedDB limpiada completamente');
  }

  async obtenerEstadisticas(): Promise<{
    actasPendientes: number;
    actasEnviadas: number;
    evidencias: number;
    cacheItems: number;
  }> {
    if (!this.db) await this.init();
    
    const actas = await this.db!.getAll('actas_pendientes');
    const evidencias = await this.db!.getAll('evidencias');
    const cacheItems = await this.db!.getAll('cache');
    
    return {
      actasPendientes: actas.filter((a) => a.estado === 'PENDIENTE').length,
      actasEnviadas: actas.filter((a) => a.estado === 'ENVIADO').length,
      evidencias: evidencias.length,
      cacheItems: cacheItems.length,
    };
  }
}

// Singleton
export const dbService = new DatabaseService();
export default dbService;
