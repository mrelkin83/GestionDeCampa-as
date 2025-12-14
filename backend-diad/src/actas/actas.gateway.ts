import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
  namespace: '/actas',
})
export class ActasGateway {
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
