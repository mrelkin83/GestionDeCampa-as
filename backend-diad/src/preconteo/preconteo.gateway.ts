import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard, verifyWsConnectionOrDisconnect } from '../auth/ws-jwt.guard';
import { getAllowedOrigins } from '../config/cors';

/**
 * PreconteoGateway
 *
 * WebSocket Gateway para el sistema de preconteo electoral.
 * Permite actualizaciones en tiempo real de resultados y progreso.
 *
 * Namespace: /ws/preconteo
 */
@WebSocketGateway({
  namespace: '/ws/preconteo',
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@UseGuards(WsJwtGuard)
export class PreconteoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PreconteoGateway.name);

  @WebSocketServer()
  server: Server;

  // Mapa de conexiones activas por usuario
  private connectedClients: Map<string, Socket> = new Map();

  // Contador de conexiones por room
  private roomConnections: Map<string, number> = new Map();

  /**
   * Inicialización del gateway
   */
  afterInit(server: Server) {
    this.logger.log('🚀 PreconteoGateway inicializado');
    this.logger.log(`📡 Namespace: /ws/preconteo`);

    // Configurar eventos del servidor
    server.on('error', (error) => {
      this.logger.error('❌ Error en servidor WebSocket:', error);
    });
  }

  /**
   * Cliente conectado
   *
   * @UseGuards(WsJwtGuard) a nivel de clase NO protege handleConnection
   * (solo envuelve métodos @SubscribeMessage) -sin esta verificación
   * explícita, cualquiera podía abrir el socket sin token. No comprometía
   * datos (unirse a un room sí exige pasar el guard), pero dejaba conexiones
   * anónimas sin cerrar de inmediato.
   */
  handleConnection(client: Socket) {
    if (!verifyWsConnectionOrDisconnect(client, this.logger)) {
      return;
    }

    try {
      const userId = client.handshake.auth?.userId || client.handshake.query?.userId;

      this.logger.log(`✅ Cliente conectado: ${client.id} (Usuario: ${userId || 'anónimo'})`);

      // Guardar referencia
      if (userId) {
        this.connectedClients.set(userId.toString(), client);
      }

      // Enviar confirmación de conexión
      client.emit('CONNECTED', {
        socketId: client.id,
        timestamp: new Date().toISOString(),
        message: 'Conexión establecida con el servidor de preconteo',
      });
    } catch (error) {
      this.logger.error(`❌ Error en handleConnection: ${error.message}`);
    }
  }

  /**
   * Cliente desconectado
   */
  handleDisconnect(client: Socket) {
    try {
      const userId = client.handshake.auth?.userId;

      this.logger.log(`❌ Cliente desconectado: ${client.id}`);

      // Limpiar referencias
      if (userId) {
        this.connectedClients.delete(userId.toString());
      }

      // Actualizar contadores de rooms
      client.rooms.forEach((room) => {
        if (room !== client.id) {
          const current = this.roomConnections.get(room) || 0;
          if (current > 0) {
            this.roomConnections.set(room, current - 1);
          }
        }
      });
    } catch (error) {
      this.logger.error(`❌ Error en handleDisconnect: ${error.message}`);
    }
  }

  /**
   * @SubscribeMessage('subscribe')
   *
   * Suscribir cliente a un room específico para recibir actualizaciones
   * de un territorio y cargo electoral.
   *
   * Payload: {
   *   scope_type: 'MESA' | 'PUESTO' | 'MUNICIPIO' | 'DEPARTAMENTO',
   *   scope_id: number,
   *   election_position_id: number
   * }
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() payload: { scope_type: string; scope_id: number; election_position_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { scope_type, scope_id, election_position_id } = payload;

      // Validar payload
      if (!scope_type || !scope_id || !election_position_id) {
        client.emit('ERROR', {
          code: 'INVALID_PAYLOAD',
          message: 'Payload incompleto. Se requiere: scope_type, scope_id, election_position_id',
        });
        return { success: false, error: 'Invalid payload' };
      }

      // Crear nombre del room
      const roomName = `${scope_type}:${scope_id}:${election_position_id}`;

      // Unir cliente al room
      client.join(roomName);

      // Actualizar contador
      const currentCount = this.roomConnections.get(roomName) || 0;
      this.roomConnections.set(roomName, currentCount + 1);

      this.logger.log(`📥 Cliente ${client.id} suscrito a: ${roomName}`);
      this.logger.log(`👥 Conexiones en ${roomName}: ${currentCount + 1}`);

      // Confirmar suscripción
      client.emit('SUBSCRIBED', {
        room: roomName,
        scope_type,
        scope_id,
        election_position_id,
        message: `Suscrito a actualizaciones de ${scope_type} ${scope_id}`,
      });

      // Enviar estado actual
      this.enviarEstadoActual(client, roomName, payload);

      return {
        success: true,
        room: roomName,
        message: `Suscrito a ${roomName}`,
      };
    } catch (error) {
      this.logger.error(`❌ Error en subscribe: ${error.message}`);
      client.emit('ERROR', { code: 'SUBSCRIBE_ERROR', message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * @SubscribeMessage('unsubscribe')
   *
   * Desuscribir cliente de un room
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() payload: { scope_type: string; scope_id: number; election_position_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { scope_type, scope_id, election_position_id } = payload;
      const roomName = `${scope_type}:${scope_id}:${election_position_id}`;

      // Salir del room
      client.leave(roomName);

      // Actualizar contador
      const currentCount = this.roomConnections.get(roomName) || 0;
      if (currentCount > 0) {
        this.roomConnections.set(roomName, currentCount - 1);
      }

      this.logger.log(`📤 Cliente ${client.id} desuscrito de: ${roomName}`);

      client.emit('UNSUBSCRIBED', {
        room: roomName,
        message: `Desuscrito de ${roomName}`,
      });

      return { success: true, message: `Desuscrito de ${roomName}` };
    } catch (error) {
      this.logger.error(`❌ Error en unsubscribe: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * @SubscribeMessage('ping')
   *
   * Heartbeat para mantener conexión activa
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
    return { event: 'pong', data: { timestamp: new Date().toISOString() } };
  }

  /**
   * @SubscribeMessage('get_stats')
   *
   * Obtener estadísticas de conexiones
   */
  @SubscribeMessage('get_stats')
  handleGetStats() {
    const stats = {
      totalConnections: this.connectedClients.size,
      rooms: Array.from(this.roomConnections.entries()).map(([room, count]) => ({
        room,
        connections: count,
      })),
    };

    return { event: 'stats', data: stats };
  }

  /**
   * Emitir actualización de resultados a todos los suscriptores de un room
   */
  emitirActualizacionResultados(
    scope_type: string,
    scope_id: number,
    election_position_id: number,
    data: any,
  ) {
    const roomName = `${scope_type}:${scope_id}:${election_position_id}`;

    const evento = {
      event: 'RESULTADOS_ACTUALIZADOS',
      timestamp: new Date().toISOString(),
      scope_type,
      scope_id,
      election_position_id,
      data,
    };

    this.server.to(roomName).emit('RESULTADOS_ACTUALIZADOS', evento);

    this.logger.debug(`📊 Resultados actualizados en ${roomName}`);
  }

  /**
   * Emitir progreso de mesas reportadas
   */
  emitirProgresoMesas(
    election_position_id: number,
    progreso: {
      total_mesas: number;
      reportadas: number;
      observadas: number;
      pendientes: number;
      porcentaje_avance: number;
    },
  ) {
    const evento = {
      event: 'PROGRESO_MESAS',
      timestamp: new Date().toISOString(),
      election_position_id,
      data: progreso,
    };

    // Emitir a todos los clientes suscritos a este cargo
    this.server.emit('PROGRESO_MESAS', evento);

    this.logger.debug(`📈 Progreso actualizado: ${progreso.porcentaje_avance}%`);
  }

  /**
   * Emitir alerta crítica
   */
  emitirAlerta(
    tipo: string,
    severidad: 'INFO' | 'WARNING' | 'CRITICAL',
    mensaje: string,
    data?: any,
  ) {
    const evento = {
      event: 'ALERTA',
      timestamp: new Date().toISOString(),
      tipo,
      severidad,
      mensaje,
      data,
    };

    // Alertas críticas van a todos, warnings solo a coordinadores
    if (severidad === 'CRITICAL') {
      this.server.emit('ALERTA', evento);
    } else {
      // Emitir solo a rooms específicos o a coordinadores
      this.server.emit('ALERTA', evento);
    }

    this.logger.warn(`🚨 Alerta [${severidad}]: ${mensaje}`);
  }

  /**
   * Emitir notificación de nueva acta
   */
  emitirNuevaActa(
    scope_type: string,
    scope_id: number,
    election_position_id: number,
    actaData: any,
  ) {
    const roomName = `${scope_type}:${scope_id}:${election_position_id}`;

    const evento = {
      event: 'NUEVA_ACTA',
      timestamp: new Date().toISOString(),
      scope_type,
      scope_id,
      election_position_id,
      data: actaData,
    };

    this.server.to(roomName).emit('NUEVA_ACTA', evento);

    this.logger.debug(`📝 Nueva acta notificada en ${roomName}`);
  }

  /**
   * Emitir validación de acta
   */
  emitirActaValidada(
    scope_type: string,
    scope_id: number,
    election_position_id: number,
    actaData: any,
  ) {
    const roomName = `${scope_type}:${scope_id}:${election_position_id}`;

    const evento = {
      event: 'ACTA_VALIDADA',
      timestamp: new Date().toISOString(),
      scope_type,
      scope_id,
      election_position_id,
      data: actaData,
    };

    this.server.to(roomName).emit('ACTA_VALIDADA', evento);

    this.logger.debug(`✅ Acta validada notificada en ${roomName}`);
  }

  /**
   * Enviar estado actual al cliente que se suscribe
   */
  private async enviarEstadoActual(
    client: Socket,
    roomName: string,
    payload: { scope_type: string; scope_id: number; election_position_id: number },
  ) {
    try {
      // Aquí se podría consultar el estado actual desde la base de datos
      // y enviarlo al cliente para que tenga datos inmediatamente

      client.emit('ESTADO_ACTUAL', {
        room: roomName,
        message: 'Estado actual del sistema',
        // TODO: Agregar datos reales de la BD
        resumen: {
          scope_type: payload.scope_type,
          scope_id: payload.scope_id,
          election_position_id: payload.election_position_id,
        },
      });
    } catch (error) {
      this.logger.error(`❌ Error enviando estado actual: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas del gateway
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      rooms: Object.fromEntries(this.roomConnections),
      timestamp: new Date().toISOString(),
    };
  }
}
