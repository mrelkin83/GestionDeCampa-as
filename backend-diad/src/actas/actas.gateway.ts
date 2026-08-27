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
  namespace: '/actas',
})
@UseGuards(WsJwtGuard)
export class ActasGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ActasGateway.name);

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
    // campaña con solo adivinar el ID, recibiendo en tiempo real actas de
    // campañas ajenas -sin ningún control equivalente a
    // User::hasAccessToCampana() del resto del sistema.
    if (!canAccessCampaign(client, data.campaignId)) {
      client.emit('ERROR', { code: 'FORBIDDEN', message: 'No tiene acceso a esta campaña' });
      return { event: 'error', data: { message: 'No tiene acceso a esta campaña' } };
    }

    client.join(`campaign-${data.campaignId}`);
    return { event: 'joined-campaign', data: { campaignId: data.campaignId } };
  }

  @SubscribeMessage('leave-campaign')
  handleLeaveCampaign(
    @MessageBody() data: { campaignId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`campaign-${data.campaignId}`);
    return { event: 'left-campaign', data: { campaignId: data.campaignId } };
  }

  notifyNewActa(acta: any) {
    this.server.to(`campaign-${acta.campaign_id}`).emit('acta:nueva', acta);
  }

  notifyActaUpdated(acta: any) {
    this.server.to(`campaign-${acta.campaign_id}`).emit('acta:actualizada', acta);
  }

  notifyActaValidated(acta: any) {
    this.server.to(`campaign-${acta.campaign_id}`).emit('acta:validada', acta);
  }

  notifyActaRejected(acta: any) {
    this.server.to(`campaign-${acta.campaign_id}`).emit('acta:rechazada', acta);
  }

  notifyOcrCompleted(acta: any) {
    this.server.to(`campaign-${acta.campaign_id}`).emit('acta:ocr-completado', acta);
  }
}
