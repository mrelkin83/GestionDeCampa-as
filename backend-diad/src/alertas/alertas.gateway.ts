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
  namespace: '/alertas',
})
@UseGuards(WsJwtGuard)
export class AlertasGateway implements OnGatewayConnection {
  private readonly logger = new Logger(AlertasGateway.name);

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
    // campaña con solo adivinar el ID, recibiendo alertas de campañas
    // ajenas -sin ningún control equivalente a User::hasAccessToCampana().
    if (!canAccessCampaign(client, data.campaignId)) {
      client.emit('ERROR', { code: 'FORBIDDEN', message: 'No tiene acceso a esta campaña' });
      return { event: 'error', data: { message: 'No tiene acceso a esta campaña' } };
    }

    client.join(`campaign-${data.campaignId}`);
    return { event: 'joined-campaign', data: { campaignId: data.campaignId } };
  }

  notifyNewAlerta(alerta: any) {
    this.server.to(`campaign-${alerta.campaign_id}`).emit('alerta:nueva', alerta);

    // Send notification sound for critical alerts
    if (alerta.severidad === 'critica') {
      this.server.to(`campaign-${alerta.campaign_id}`).emit('alerta:critica', alerta);
    }
  }

  notifyAlertaResuelta(alerta: any) {
    this.server.to(`campaign-${alerta.campaign_id}`).emit('alerta:resuelta', alerta);
  }

  notifyAlertaDescartada(alerta: any) {
    this.server.to(`campaign-${alerta.campaign_id}`).emit('alerta:descartada', alerta);
  }
}
