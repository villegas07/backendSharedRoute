import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { SosAlertEntity } from '../../domain/entities/sos-alert.entity';

@WebSocketGateway({ namespace: '/sos', cors: { origin: '*' } })
export class SosGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SosGateway.name);

  broadcastSosTriggered(alert: SosAlertEntity): void {
    this.server.emit('sos:alert-triggered', {
      alertId: alert.id,
      userId: alert.userId,
      userRole: alert.userRole,
      tripId: alert.tripId,
      latitude: alert.latitude,
      longitude: alert.longitude,
      message: alert.message,
      status: alert.status,
    });
    this.logger.warn(`SOS triggered by user ${alert.userId}`);
  }

  broadcastSosResolved(alertId: string, resolvedById: string): void {
    this.server.emit('sos:alert-resolved', { alertId, resolvedById });
  }
}
