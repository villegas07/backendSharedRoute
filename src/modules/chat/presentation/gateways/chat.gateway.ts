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
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { GetChatHistoryUseCase } from '../../application/use-cases/get-chat-history.use-case';
import { SenderRole } from '../../domain/enums/sender-role.enum';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly userSockets = new Map<string, string>();

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getHistoryUseCase: GetChatHistoryUseCase,
  ) {}

  handleConnection(client: Socket): void {
    const userId = client.handshake.query['userId'] as string;
    if (userId) this.userSockets.set(userId, client.id);
    this.logger.log(`Chat connected: ${client.id} (user: ${userId})`);
  }

  handleDisconnect(client: Socket): void {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
    this.logger.log(`Chat disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:join')
  handleJoin(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(`chat:${data.tripId}`);
    this.logger.log(`${client.id} joined chat:${data.tripId}`);
  }

  @SubscribeMessage('chat:leave')
  handleLeave(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(`chat:${data.tripId}`);
  }

  @SubscribeMessage('chat:send-message')
  async handleSendMessage(
    @MessageBody()
    data: {
      tripId: string;
      senderId: string;
      senderRole: SenderRole;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const message = await this.sendMessageUseCase.execute({
        tripId: data.tripId,
        senderId: data.senderId,
        senderRole: data.senderRole,
        content: data.content,
      });

      this.server.to(`chat:${data.tripId}`).emit('chat:new-message', {
        id: message.id,
        senderId: message.senderId,
        senderRole: message.senderRole,
        content: message.content,
        messageType: message.messageType,
        sentAt: message.sentAt,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al enviar';
      client.emit('chat:error', { message: msg });
    }
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @MessageBody() data: { tripId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client
      .to(`chat:${data.tripId}`)
      .emit('chat:typing', { userId: data.userId });
  }

  @SubscribeMessage('chat:history')
  async handleGetHistory(
    @MessageBody() data: { tripId: string; offset?: number },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const result = await this.getHistoryUseCase.execute({
        tripId: data.tripId,
        limit: 50,
        offset: data.offset ?? 0,
      });
      client.emit('chat:history-response', result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al cargar';
      client.emit('chat:error', { message: msg });
    }
  }

  broadcastNewImageMessage(tripId: string, message: Record<string, unknown>): void {
    this.server.to(`chat:${tripId}`).emit('chat:new-message', message);
  }

  broadcastSessionClosed(tripId: string): void {
    this.server
      .to(`chat:${tripId}`)
      .emit('chat:session-closed', { tripId });
  }
}
