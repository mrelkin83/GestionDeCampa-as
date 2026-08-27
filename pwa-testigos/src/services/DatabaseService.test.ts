import { describe, it, expect, beforeEach } from 'vitest';
import { dbService } from './DatabaseService';

/**
 * Unit Tests: DatabaseService
 * 
 * Tests para el servicio de IndexedDB
 */

describe('DatabaseService', () => {
  beforeEach(async () => {
    await dbService.init();
    await dbService.limpiarTodo();
  });

  describe('Usuarios', () => {
    it('debe guardar y recuperar un usuario', async () => {
      const usuario = {
        id: 1,
        email: 'test@test.com',
        nombre: 'Test User',
        token: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 3600000,
        permisos: ['testigo'],
      };

      await dbService.guardarUsuario(usuario);
      const recuperado = await dbService.obtenerUsuario(1);

      expect(recuperado).toEqual(usuario);
    });

    it('debe obtener usuario actual', async () => {
      const usuario = {
        id: 1,
        email: 'test@test.com',
        nombre: 'Test User',
        token: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 3600000,
        permisos: ['testigo'],
      };

      await dbService.guardarUsuario(usuario);
      const actual = await dbService.obtenerUsuarioActual();

      expect(actual?.email).toBe('test@test.com');
    });

    it('debe eliminar usuario', async () => {
      const usuario = {
        id: 1,
        email: 'test@test.com',
        nombre: 'Test User',
        token: 'token123',
        refreshToken: 'refresh123',
        expiresAt: Date.now() + 3600000,
        permisos: ['testigo'],
      };

      await dbService.guardarUsuario(usuario);
      await dbService.eliminarUsuario(1);
      const recuperado = await dbService.obtenerUsuario(1);

      expect(recuperado).toBeUndefined();
    });
  });

  describe('Actas Pendientes', () => {
    it('debe guardar una acta pendiente', async () => {
      const acta = {
        localId: 'uuid-123',
        electionId: 1,
        cargoId: 1,
        mesaId: 42,
        votos: [{ candidateId: 1, votos: 100 }],
        votantes: 200,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 200,
        horaCierre: '16:00',
        observaciones: 'Sin novedades',
        evidencias: [],
        estado: 'PENDIENTE' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      const id = await dbService.guardarActaPendiente(acta);
      expect(id).toBeDefined();

      const recuperada = await dbService.obtenerActaPendiente(id);
      expect(recuperada?.mesaId).toBe(42);
    });

    it('debe actualizar estado de acta', async () => {
      const acta = {
        localId: 'uuid-123',
        electionId: 1,
        cargoId: 1,
        mesaId: 42,
        votos: [],
        votantes: 200,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 200,
        horaCierre: '16:00',
        observaciones: '',
        evidencias: [],
        estado: 'PENDIENTE' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      const id = await dbService.guardarActaPendiente(acta);
      await dbService.actualizarActaPendiente(id, { estado: 'ENVIADO' });

      const actualizada = await dbService.obtenerActaPendiente(id);
      expect(actualizada?.estado).toBe('ENVIADO');
    });

    it('debe filtrar actas por estado', async () => {
      const acta1 = {
        localId: 'uuid-1',
        electionId: 1,
        cargoId: 1,
        mesaId: 1,
        votos: [],
        votantes: 100,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 100,
        horaCierre: '16:00',
        observaciones: '',
        evidencias: [],
        estado: 'PENDIENTE' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      const acta2 = {
        localId: 'uuid-2',
        electionId: 1,
        cargoId: 1,
        mesaId: 2,
        votos: [],
        votantes: 100,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 100,
        horaCierre: '16:00',
        observaciones: '',
        evidencias: [],
        estado: 'ENVIADO' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      await dbService.guardarActaPendiente(acta1);
      await dbService.guardarActaPendiente(acta2);

      const pendientes = await dbService.obtenerActasPendientes('PENDIENTE');
      expect(pendientes).toHaveLength(1);
      expect(pendientes[0].mesaId).toBe(1);
    });

    it('debe contar actas pendientes correctamente', async () => {
      const acta = {
        localId: 'uuid-123',
        electionId: 1,
        cargoId: 1,
        mesaId: 42,
        votos: [],
        votantes: 200,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 200,
        horaCierre: '16:00',
        observaciones: '',
        evidencias: [],
        estado: 'PENDIENTE' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      await dbService.guardarActaPendiente(acta);
      const count = await dbService.contarActasPendientes();

      expect(count).toBe(1);
    });
  });

  describe('Cache', () => {
    it('debe guardar y recuperar datos en cache', async () => {
      const datos = { elecciones: [{ id: 1, nombre: 'Test' }] };
      await dbService.guardarCache('elecciones', datos, 3600);

      const recuperado = await dbService.obtenerCache('elecciones');
      expect(recuperado).toEqual(datos);
    });

    it('debe retornar null si cache expiró', async () => {
      const datos = { test: 'data' };
      await dbService.guardarCache('test', datos, 1); // 1 segundo TTL

      // Esperar expiración
      await new Promise(resolve => setTimeout(resolve, 1100));

      const recuperado = await dbService.obtenerCache('test');
      expect(recuperado).toBeNull();
    });
  });

  describe('Sync Log', () => {
    it('debe agregar y recuperar logs', async () => {
      await dbService.agregarLog({
        tipo: 'ENVIO_ACTA',
        estado: 'EXITO',
        mensaje: 'Acta sincronizada',
        timestamp: Date.now(),
      });

      const logs = await dbService.obtenerLogs(10);
      expect(logs).toHaveLength(1);
      expect(logs[0].mensaje).toBe('Acta sincronizada');
    });
  });

  describe('Estadísticas', () => {
    it('debe calcular estadísticas correctamente', async () => {
      // Agregar datos de prueba
      const actaPendiente = {
        localId: 'uuid-1',
        electionId: 1,
        cargoId: 1,
        mesaId: 1,
        votos: [],
        votantes: 100,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 100,
        horaCierre: '16:00',
        observaciones: '',
        evidencias: [],
        estado: 'PENDIENTE' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      const actaEnviada = {
        localId: 'uuid-2',
        electionId: 1,
        cargoId: 1,
        mesaId: 2,
        votos: [],
        votantes: 100,
        votosNulos: 0,
        votosNoMarcados: 0,
        boletasEntregadas: 100,
        horaCierre: '16:00',
        observaciones: '',
        evidencias: [],
        estado: 'ENVIADO' as const,
        intentos: 0,
        creadoEn: Date.now(),
        actualizadoEn: Date.now(),
      };

      await dbService.guardarActaPendiente(actaPendiente);
      await dbService.guardarActaPendiente(actaEnviada);
      await dbService.guardarEvidencia({
        id: 'ev-1',
        actaLocalId: 'uuid-1',
        imagenBase64: 'test',
        hash: '',
        procesado: false,
        creadoEn: Date.now(),
      });

      const stats = await dbService.obtenerEstadisticas();

      expect(stats.actasPendientes).toBe(1);
      expect(stats.actasEnviadas).toBe(1);
      expect(stats.evidencias).toBe(1);
    });
  });
});
