import { ChatGateway } from '@/modules/chat/presentation/gateways/chat.gateway';
import { SendMessageUseCase } from '@/modules/chat/application/use-cases/send-message.use-case';
import { GetChatHistoryUseCase } from '@/modules/chat/application/use-cases/get-chat-history.use-case';
import { ChatMessageEntity } from '@/modules/chat/domain/entities/chat-message.entity';
import { MessageType } from '@/modules/chat/domain/enums/message-type.enum';
import { SenderRole } from '@/modules/chat/domain/enums/sender-role.enum';
import { Server, Socket } from 'socket.io';

const makeMsg = () =>
  ChatMessageEntity.create({
    tripId: 'trip-1',
    senderId: 'driver-1',
    senderRole: SenderRole.DRIVER,
    content: 'Hola',
    messageType: MessageType.TEXT,
  });

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let sendMessageUseCase: jest.Mocked<SendMessageUseCase>;
  let getHistoryUseCase: jest.Mocked<GetChatHistoryUseCase>;
  let mockClient: Partial<Socket>;
  let mockServerRoom: { emit: jest.Mock };

  beforeEach(() => {
    sendMessageUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SendMessageUseCase>;

    getHistoryUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetChatHistoryUseCase>;

    gateway = new ChatGateway(sendMessageUseCase, getHistoryUseCase);

    mockServerRoom = { emit: jest.fn() };
    mockClient = {
      id: 'socket-1',
      handshake: { query: { userId: 'driver-1' } } as never,
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };

    gateway.server = {
      to: jest.fn().mockReturnValue(mockServerRoom),
    } as unknown as Server;
  });

  describe('handleConnection / handleDisconnect', () => {
    it('should register client on connect', () => {
      expect(() =>
        gateway.handleConnection(mockClient as Socket),
      ).not.toThrow();
    });

    it('should clean up on disconnect', () => {
      gateway.handleConnection(mockClient as Socket);
      expect(() =>
        gateway.handleDisconnect(mockClient as Socket),
      ).not.toThrow();
    });
  });

  describe('handleJoin / handleLeave', () => {
    it('should join chat room', () => {
      gateway.handleJoin({ tripId: 'trip-1' }, mockClient as Socket);
      expect(mockClient.join).toHaveBeenCalledWith('chat:trip-1');
    });

    it('should leave chat room', () => {
      gateway.handleLeave({ tripId: 'trip-1' }, mockClient as Socket);
      expect(mockClient.leave).toHaveBeenCalledWith('chat:trip-1');
    });
  });

  describe('handleSendMessage', () => {
    it('should broadcast new message to room', async () => {
      sendMessageUseCase.execute.mockResolvedValue(makeMsg());

      await gateway.handleSendMessage(
        {
          tripId: 'trip-1',
          senderId: 'driver-1',
          senderRole: SenderRole.DRIVER,
          content: 'Hola',
        },
        mockClient as Socket,
      );

      expect(gateway.server.to).toHaveBeenCalledWith('chat:trip-1');
      expect(mockServerRoom.emit).toHaveBeenCalledWith(
        'chat:new-message',
        expect.objectContaining({
          content: 'Hola',
          messageType: MessageType.TEXT,
        }),
      );
    });

    it('should emit chat:error on failure', async () => {
      sendMessageUseCase.execute.mockRejectedValue(
        new Error('Sesión cerrada'),
      );

      await gateway.handleSendMessage(
        {
          tripId: 'trip-1',
          senderId: 'driver-1',
          senderRole: SenderRole.DRIVER,
          content: 'Hola',
        },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith('chat:error', {
        message: 'Sesión cerrada',
      });
    });
  });

  describe('handleTyping', () => {
    it('should forward typing event to other participants', () => {
      const toRoom = { emit: jest.fn() };
      (mockClient.to as jest.Mock).mockReturnValue(toRoom);

      gateway.handleTyping(
        { tripId: 'trip-1', userId: 'driver-1' },
        mockClient as Socket,
      );

      expect(mockClient.to).toHaveBeenCalledWith('chat:trip-1');
      expect(toRoom.emit).toHaveBeenCalledWith('chat:typing', {
        userId: 'driver-1',
      });
    });
  });

  describe('handleGetHistory', () => {
    it('should emit history to requesting client', async () => {
      const historyResult = { messages: [makeMsg()], total: 1, limit: 50, offset: 0 };
      getHistoryUseCase.execute.mockResolvedValue(historyResult);

      await gateway.handleGetHistory(
        { tripId: 'trip-1', offset: 0 },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith(
        'chat:history-response',
        historyResult,
      );
    });

    it('should emit error if history fails', async () => {
      getHistoryUseCase.execute.mockRejectedValue(
        new Error('No encontrado'),
      );

      await gateway.handleGetHistory(
        { tripId: 'bad-trip' },
        mockClient as Socket,
      );

      expect(mockClient.emit).toHaveBeenCalledWith('chat:error', {
        message: 'No encontrado',
      });
    });
  });

  describe('broadcast helpers', () => {
    it('should broadcast new image message to room', () => {
      gateway.broadcastNewImageMessage('trip-1', {
        id: 'msg-1',
        imageUrl: 'uploads/img.jpg',
      });

      expect(gateway.server.to).toHaveBeenCalledWith('chat:trip-1');
      expect(mockServerRoom.emit).toHaveBeenCalledWith(
        'chat:new-message',
        expect.objectContaining({ imageUrl: 'uploads/img.jpg' }),
      );
    });

    it('should broadcast session closed event', () => {
      gateway.broadcastSessionClosed('trip-1');

      expect(gateway.server.to).toHaveBeenCalledWith('chat:trip-1');
      expect(mockServerRoom.emit).toHaveBeenCalledWith(
        'chat:session-closed',
        { tripId: 'trip-1' },
      );
    });
  });
});
