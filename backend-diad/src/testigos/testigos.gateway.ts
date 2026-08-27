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
  namespace: '/testigos',
})
@UseGuards(WsJwtGuard)
export class TestigosGateway {
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

  notifyEstadoChanged(testigo: any) {
    this.server.to(`campaign-${testigo.campaign_id}`).emit('testigo:estado-cambio', testigo);
  }

  notifyCheckin(testigo: any) {
    this.server.to(`campaign-${testigo.campaign_id}`).emit('testigo:checkin', testigo);
  }
}
