import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard, verifyWsConnectionOrDisconnect, canAccessCampaign } from '../auth/ws-jwt.guard';
import { getAllowedOrigins } from '../config/cors';

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
  namespace: '/conteo',
})
@UseGuards(WsJwtGuard)
export class ConteoGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ConteoGateway.name);

  @WebSocketServer()
  server: Server;

  // @UseGuards(WsJwtGuard) a nivel de clase no protege handleConnection
  // (solo @SubscribeMessage) -ver comentario completo en ws-jwt.guard.ts.
  handleConnection(client: Socket) {
    verifyWsConnectionOrDisconnect(client, this.logger);
  }

  @SubscribeMessage('join-campaign')
  handleJoinCampaign(
    @MessageBody() data: { campaignId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Antes cualquier usuario autenticado podía unirse al room de CUALQUIER
    // campaña con solo adivinar el ID, recibiendo el conteo paralelo de
    // campañas ajenas -sin ningún control equivalente a
    // User::hasAccessToCampana().
    if (!canAccessCampaign(client, data.campaignId)) {
      client.emit('ERROR', { code: 'FORBIDDEN', message: 'No tiene acceso a esta campaña' });
      return { event: 'error', data: { message: 'No tiene acceso a esta campaña' } };
    }

    client.join(`campaign-${data.campaignId}`);
    return { event: 'joined-campaign', data: { campaignId: data.campaignId } };
  }

  @SubscribeMessage('subscribe-circunscripcion')
  handleSubscribeCircunscripcion(
    @MessageBody() data: { circunscripcionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`circunscripcion-${data.circunscripcionId}`);
    return {
      event: 'subscribed-circunscripcion',
      data: { circunscripcionId: data.circunscripcionId },
    };
  }

  notifyConteoActualizado(campaignId: string, data: any) {
    this.server.to(`campaign-${campaignId}`).emit('conteo:actualizado', {
      campaignId,
      timestamp: new Date(),
      data,
    });
  }

  notifyMesaReportada(campaignId: string, mesa: any) {
    this.server.to(`campaign-${campaignId}`).emit('conteo:mesa-reportada', {
      campaignId,
      mesa,
      timestamp: new Date(),
    });
  }
}
