import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

/**
 * Verifica el JWT de un socket ya conectado y lo desconecta si falta o es
 * inválido. Se expone aparte de WsJwtGuard porque los guards de Nest solo
 * envuelven métodos @SubscribeMessage, nunca handleConnection/handleDisconnect
 * -sin llamar esto explícitamente desde handleConnection, cualquiera podía
 * abrir el socket sin token (aunque no lograra suscribirse a ningún room,
 * ya que eso sí pasa por el guard en cada @SubscribeMessage).
 */
export function verifyWsConnectionOrDisconnect(client: Socket, logger: Logger): boolean {
  try {
    const token =
      client.handshake.auth?.token ||
      client.handshake.query?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn(`⚠️  Conexión sin token: ${client.id}`);
      client.emit('ERROR', { code: 'AUTH_REQUIRED', message: 'Token requerido' });
      client.disconnect();
      return false;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('❌ JWT_SECRET no configurado: rechazando conexión');
      client.emit('ERROR', { code: 'SERVER_MISCONFIGURED', message: 'Autenticación no disponible' });
      client.disconnect();
      return false;
    }

    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    client.data.user = payload;
    return true;
  } catch (error) {
    logger.warn(`⚠️  Token inválido en handleConnection (${client.id}): ${error.message}`);
    client.emit('ERROR', { code: 'INVALID_TOKEN', message: 'Token inválido' });
    client.disconnect();
    return false;
  }
}

/**
 * WsJwtGuard
 *
 * Guard para autenticar conexiones WebSocket usando JWT.
 * Valida el token enviado en handshake.auth.token o handshake.query.token
 */
@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    let client: Socket | undefined;

    try {
      client = context.switchToWs().getClient();

      // Obtener token del handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Antes esto permitía conexiones sin token fuera de producción -
        // inconsistente con HttpJwtGuard (API REST), que siempre falla
        // cerrado. Un WebSocket con datos electorales en tiempo real no
        // debería depender de que NODE_ENV esté bien configurado para
        // exigir autenticación.
        this.logger.warn(`⚠️  Conexión sin token: ${client.id}`);
        client.emit('ERROR', { code: 'AUTH_REQUIRED', message: 'Token requerido' });
        client.disconnect();
        return false;
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        // Sin secreto configurado no se puede verificar ninguna firma de forma segura.
        // Fallar cerrado siempre (incluso en desarrollo): un fallback hardcodeado
        // permitiría a cualquiera forjar tokens válidos firmando con ese valor conocido.
        this.logger.error('❌ JWT_SECRET no configurado: rechazando conexión');
        client.emit('ERROR', {
          code: 'SERVER_MISCONFIGURED',
          message: 'Autenticación no disponible',
        });
        client.disconnect();
        return false;
      }

      // Verificar token
      try {
        const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

        // Guardar datos del usuario en el socket
        client.data.user = payload;

        this.logger.debug(`🔐 Cliente autenticado: ${client.id}`);
        return true;
      } catch (jwtError) {
        this.logger.warn(`⚠️  Token inválido: ${jwtError.message}`);
        client.emit('ERROR', { code: 'INVALID_TOKEN', message: 'Token inválido' });
        client.disconnect();
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ Error en WsJwtGuard: ${error.message}`);

      // Fallar cerrado ante errores inesperados: un fallo silencioso no debe
      // traducirse en acceso concedido a datos electorales en tiempo real.
      client?.emit('ERROR', { code: 'AUTH_ERROR', message: 'Error de autenticación' });
      client?.disconnect();
      return false;
    }
  }
}
