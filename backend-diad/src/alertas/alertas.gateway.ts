import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { getAllowedOrigins } from '../config/cors';

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
  namespace: '/alertas',
})
@UseGuards(WsJwtGuard)
export class AlertasGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-campaign')
  handleJoinCampaign(
    @MessageBody() data: { campaignId: string },
    @ConnectedSocket() client: Socket,
  ) {
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
