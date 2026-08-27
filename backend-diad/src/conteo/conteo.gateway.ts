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
  namespace: '/conteo',
})
@UseGuards(WsJwtGuard)
export class ConteoGateway {
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
