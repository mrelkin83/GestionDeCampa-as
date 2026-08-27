// La API async (openDatabaseAsync/execAsync/runAsync/...) vive en expo-sqlite/next
// en la versión 13.3.0 instalada (pasó a ser la API principal recién en v14/SDK51).
import * as SQLite from 'expo-sqlite/next';

/**
 * DatabaseService - SQLite para React Native
 *
 * Servicio de base de datos local para almacenamiento offline
 * en la aplicación móvil nativa.
 */

export interface VotoCandidato {
  candidateId: number;
  votos: number;
}

// Forma "en memoria" (ya parseada) que usan las pantallas y SyncService.
// DatabaseService serializa/deserializa a JSON internamente al leer/escribir SQLite.
export interface ActaDB {
  id?: number;
  localId: string;
  electionId: number;
  cargoId: number;
  mesaId: number;
  votos: VotoCandidato[];
  votantes: number;
  votosNulos: number;
  boletasEntregadas: number;
  horaCierre: string;
  observaciones: string;
  evidencias: string[];
  estado: 'PENDIENTE' | 'ENVIANDO' | 'ENVIADO' | 'ERROR';
  intentos: number;
  error?: string | null;
  creadoEn: number;
  actualizadoEn: number;
}

export interface CandidatoDB {
  id: number;
  electionPositionId: number;
  nombre: string;
  partidoPolitico: string;
  lista?: string;
  numero?: number;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('preconteo.db');
      await this.crearTablas();
      console.log('✅ SQLite inicializado');
    } catch (error) {
      console.error('❌ Error inicializando SQLite:', error);
      throw error;
    }
  }

  private async crearTablas(): Promise<void> {
    if (!this.db) {
      return;
    }

    // Tabla de actas
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS actas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        localId TEXT UNIQUE NOT NULL,
        electionId INTEGER,
        cargoId INTEGER,
        mesaId INTEGER,
        votos TEXT,
        votantes INTEGER,
        votosNulos INTEGER DEFAULT 0,
        boletasEntregadas INTEGER,
        horaCierre TEXT,
        observaciones TEXT,
        evidencias TEXT,
        estado TEXT DEFAULT 'PENDIENTE',
        intentos INTEGER DEFAULT 0,
        error TEXT,
        creadoEn INTEGER,
        actualizadoEn INTEGER
      )
    `);

    // Tabla de candidatos (cache)
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS candidatos (
        id INTEGER PRIMARY KEY,
        electionPositionId INTEGER,
        nombre TEXT,
        partidoPolitico TEXT,
        lista TEXT,
        numero INTEGER
      )
    `);

    // Tabla de cache general
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS cache (
        clave TEXT PRIMARY KEY,
        datos TEXT,
        timestamp INTEGER,
        ttl INTEGER
      )
    `);

    // Tabla de log de sincronización
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT,
        estado TEXT,
        mensaje TEXT,
        datos TEXT,
        timestamp INTEGER
      )
    `);

    console.log('✅ Tablas SQLite creadas');
  }

  // ==========================================
  // Actas
  // ==========================================

  async guardarActa(acta: ActaDB): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const { id, ...data } = acta;

    await this.db.runAsync(
      `INSERT OR REPLACE INTO actas (
        localId, electionId, cargoId, mesaId, votos, votantes, votosNulos,
        boletasEntregadas, horaCierre, observaciones, evidencias,
        estado, intentos, error, creadoEn, actualizadoEn
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.localId,
        data.electionId,
        data.cargoId,
        data.mesaId,
        JSON.stringify(data.votos),
        data.votantes,
        data.votosNulos || 0,
        data.boletasEntregadas,
        data.horaCierre,
        data.observaciones,
        JSON.stringify(data.evidencias),
        data.estado,
        data.intentos,
        data.error || null,
        data.creadoEn,
        data.actualizadoEn,
      ],
    );
  }

  async obtenerActasPendientes(): Promise<ActaDB[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const result = await this.db.getAllAsync<{
      id: number;
      localId: string;
      electionId: number;
      cargoId: number;
      mesaId: number;
      votos: string;
      votantes: number;
      votosNulos: number;
      boletasEntregadas: number;
      horaCierre: string;
      observaciones: string;
      evidencias: string;
      estado: string;
      intentos: number;
      error: string | null;
      creadoEn: number;
      actualizadoEn: number;
    }>(
      `SELECT * FROM actas 
       WHERE estado IN ('PENDIENTE', 'ERROR') 
       ORDER BY creadoEn DESC`,
    );

    return result.map(row => ({
      ...row,
      votos: JSON.parse(row.votos) as VotoCandidato[],
      evidencias: JSON.parse(row.evidencias) as string[],
      estado: row.estado as ActaDB['estado'],
    }));
  }

  async actualizarActa(
    localId: string,
    cambios: Partial<ActaDB>,
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const campos: string[] = [];
    const valores: any[] = [];

    Object.entries(cambios).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'localId') {
        campos.push(`${key} = ?`);
        if (key === 'votos' || key === 'evidencias') {
          valores.push(JSON.stringify(value));
        } else {
          valores.push(value);
        }
      }
    });

    campos.push('actualizadoEn = ?');
    valores.push(Date.now());
    valores.push(localId);

    await this.db.runAsync(
      `UPDATE actas SET ${campos.join(', ')} WHERE localId = ?`,
      valores,
    );
  }

  async eliminarActa(localId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.runAsync('DELETE FROM actas WHERE localId = ?', [localId]);
  }

  async contarActasPendientes(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM actas WHERE estado IN ('PENDIENTE', 'ERROR')",
    );

    return result?.count || 0;
  }

  // ==========================================
  // Candidatos (Cache)
  // ==========================================

  async guardarCandidatos(candidatos: CandidatoDB[]): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.db.withTransactionAsync(async () => {
      for (const candidato of candidatos) {
        await this.db!.runAsync(
          `INSERT OR REPLACE INTO candidatos 
           (id, electionPositionId, nombre, partidoPolitico, lista, numero)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            candidato.id,
            candidato.electionPositionId,
            candidato.nombre,
            candidato.partidoPolitico,
            candidato.lista || null,
            candidato.numero || null,
          ],
        );
      }
    });
  }

  async getCandidatos(cargoId: number): Promise<CandidatoDB[]> {
    if (!this.db) {
      return [];
    }

    return await this.db.getAllAsync<CandidatoDB>(
      'SELECT * FROM candidatos WHERE electionPositionId = ? ORDER BY numero',
      [cargoId],
    );
  }

  // ==========================================
  // Cache
  // ==========================================

  async guardarCache<T>(
    clave: string,
    datos: T,
    ttlSegundos: number = 3600,
  ): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.db.runAsync(
      `INSERT OR REPLACE INTO cache (clave, datos, timestamp, ttl)
       VALUES (?, ?, ?, ?)`,
      [clave, JSON.stringify(datos), Date.now(), ttlSegundos],
    );
  }

  async obtenerCache<T>(clave: string): Promise<T | null> {
    if (!this.db) {
      return null;
    }

    const row = await this.db.getFirstAsync<{
      datos: string;
      timestamp: number;
      ttl: number;
    }>('SELECT * FROM cache WHERE clave = ?', [clave]);

    if (!row) {
      return null;
    }

    // Verificar TTL
    const ahora = Date.now();
    const expiracion = row.timestamp + row.ttl * 1000;

    if (ahora > expiracion) {
      await this.db.runAsync('DELETE FROM cache WHERE clave = ?', [clave]);
      return null;
    }

    return JSON.parse(row.datos) as T;
  }

  // ==========================================
  // Sync Log
  // ==========================================

  async agregarLog(log: {
    tipo: string;
    estado: string;
    mensaje: string;
    datos?: any;
  }): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.db.runAsync(
      `INSERT INTO sync_log (tipo, estado, mensaje, datos, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        log.tipo,
        log.estado,
        log.mensaje,
        log.datos ? JSON.stringify(log.datos) : null,
        Date.now(),
      ],
    );
  }

  // ==========================================
  // Utilidades
  // ==========================================

  async limpiarTodo(): Promise<void> {
    if (!this.db) {
      return;
    }

    await this.db.execAsync(`
      DELETE FROM actas;
      DELETE FROM candidatos;
      DELETE FROM cache;
      DELETE FROM sync_log;
    `);

    console.log('🗑️  SQLite limpiado');
  }

  async obtenerEstadisticas(): Promise<{
    actasPendientes: number;
    actasEnviadas: number;
    candidatos: number;
  }> {
    if (!this.db) {
      return { actasPendientes: 0, actasEnviadas: 0, candidatos: 0 };
    }

    const [pendientes, enviadas, cands] = await Promise.all([
      this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM actas WHERE estado IN ('PENDIENTE', 'ERROR')",
      ),
      this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM actas WHERE estado = 'ENVIADO'",
      ),
      this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM candidatos',
      ),
    ]);

    return {
      actasPendientes: pendientes?.count || 0,
      actasEnviadas: enviadas?.count || 0,
      candidatos: cands?.count || 0,
    };
  }

  /**
   * Actas marcadas ENVIADO cuya última actualización cae dentro del día
   * calendario actual (antes HomeScreen mostraba "0" fijo para "Enviadas Hoy").
   */
  async contarEnviadasHoy(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM actas WHERE estado = 'ENVIADO' AND actualizadoEn >= ?",
      [inicioDia.getTime()],
    );

    return result?.count || 0;
  }
}

export default DatabaseService;
