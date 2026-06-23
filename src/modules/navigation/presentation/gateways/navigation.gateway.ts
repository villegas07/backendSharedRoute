import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UpdateDriverLocationUseCase } from '../../application/use-cases/update-driver-location.use-case';
import { GetNavigationViewUseCase } from '../../application/use-cases/get-navigation-view.use-case';

@WebSocketGateway({
  namespace: '/navigation',
  cors: { origin: '*' },
})
export class NavigationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NavigationGateway.name);

  // userId → socketId mapping
  private readonly userSockets = new Map<string, string>();

  constructor(
    private readonly updateLocationUseCase: UpdateDriverLocationUseCase,
    private readonly getViewUseCase: GetNavigationViewUseCase,
  ) {}

  handleConnection(client: Socket): void {
    const userId = client.handshake.query['userId'] as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
    this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-session')
  handleJoinSession(
    @MessageBody() data: { sessionId: string; role: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const room = `session:${data.sessionId}`;
    client.join(room);
    this.logger.log(
      `${client.id} joined room ${room} as ${data.role}`,
    );
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(`session:${data.sessionId}`);
  }

  @SubscribeMessage('driver:update-location')
  async handleDriverLocation(
    @MessageBody()
    data: {
      sessionId: string;
      driverId: string;
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const result = await this.updateLocationUseCase.execute({
        sessionId: data.sessionId,
        driverId: data.driverId,
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading ?? 0,
        speed: data.speed ?? 0,
      });

      // Enviar vista completa al conductor (ruta + pasos + ETA)
      const driverView = await this.getViewUseCase.execute({
        sessionId: data.sessionId,
        userId: data.driverId,
        role: 'DRIVER',
      });

      client.emit('driver:navigation-update', driverView);

      // Enviar vista limitada a los pasajeros (ubicación conductor + ETA)
      const passengerView = {
        driverLocation: {
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading ?? 0,
          speed: data.speed ?? 0,
        },
        etaSeconds: result.etaSeconds,
        status: result.session.status,
      };

      client
        .to(`session:${data.sessionId}`)
        .emit('passenger:location-update', passengerView);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      client.emit('navigation:error', { message });
    }
  }

  @SubscribeMessage('driver:advance-step')
  async handleAdvanceStep(
    @MessageBody() data: { sessionId: string; driverId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const driverView = await this.getViewUseCase.execute({
        sessionId: data.sessionId,
        userId: data.driverId,
        role: 'DRIVER',
      });

      client.emit('driver:navigation-update', driverView);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      client.emit('navigation:error', { message });
    }
  }

  // Broadcast de finalización a todos los participantes
  broadcastSessionEnded(sessionId: string): void {
    this.server
      .to(`session:${sessionId}`)
      .emit('navigation:completed', { sessionId });
  }

  broadcastSessionCancelled(sessionId: string): void {
    this.server
      .to(`session:${sessionId}`)
      .emit('navigation:cancelled', { sessionId });
  }
}
