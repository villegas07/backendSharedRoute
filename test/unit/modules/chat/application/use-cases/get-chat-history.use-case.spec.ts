import { GetChatHistoryUseCase } from '@/modules/chat/application/use-cases/get-chat-history.use-case';
import { ChatSessionRepository } from '@/modules/chat/domain/ports/chat-session.repository';
import { ChatMessageRepository } from '@/modules/chat/domain/ports/chat-message.repository';
import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { ChatMessageEntity } from '@/modules/chat/domain/entities/chat-message.entity';
import { MessageType } from '@/modules/chat/domain/enums/message-type.enum';
import { SenderRole } from '@/modules/chat/domain/enums/sender-role.enum';
import { NotFoundException } from '@nestjs/common';

const makeMessage = (override?: Partial<{ content: string }>) =>
  ChatMessageEntity.create({
    tripId: 'trip-1',
    senderId: 'driver-1',
    senderRole: SenderRole.DRIVER,
    content: override?.content ?? 'Hola',
    messageType: MessageType.TEXT,
  });

describe('GetChatHistoryUseCase', () => {
  let useCase: GetChatHistoryUseCase;
  let sessionRepo: jest.Mocked<ChatSessionRepository>;
  let messageRepo: jest.Mocked<ChatMessageRepository>;

  beforeEach(() => {
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTripId: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ChatSessionRepository>;

    messageRepo = {
      save: jest.fn(),
      findByTripId: jest.fn(),
      countByTripId: jest.fn(),
    } as jest.Mocked<ChatMessageRepository>;

    useCase = new GetChatHistoryUseCase(sessionRepo, messageRepo);
  });

  it('should return paginated message history', async () => {
    const session = ChatSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
    });
    const msgs = [makeMessage({ content: 'Msg 1' }), makeMessage({ content: 'Msg 2' })];

    sessionRepo.findByTripId.mockResolvedValue(session);
    messageRepo.findByTripId.mockResolvedValue(msgs);
    messageRepo.countByTripId.mockResolvedValue(2);

    const result = await useCase.execute({
      tripId: 'trip-1',
      limit: 50,
      offset: 0,
    });

    expect(result.messages).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('should use default limit=50 offset=0 when not provided', async () => {
    const session = ChatSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: [],
    });
    sessionRepo.findByTripId.mockResolvedValue(session);
    messageRepo.findByTripId.mockResolvedValue([]);
    messageRepo.countByTripId.mockResolvedValue(0);

    const result = await useCase.execute({ tripId: 'trip-1' });

    expect(messageRepo.findByTripId).toHaveBeenCalledWith('trip-1', 50, 0);
    expect(result.limit).toBe(50);
    expect(result.offset).toBe(0);
  });

  it('should throw NotFoundException if no session found', async () => {
    sessionRepo.findByTripId.mockResolvedValue(null);

    await expect(
      useCase.execute({ tripId: 'no-trip' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return empty messages array when no messages', async () => {
    const session = ChatSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'd1',
      passengerIds: [],
    });
    sessionRepo.findByTripId.mockResolvedValue(session);
    messageRepo.findByTripId.mockResolvedValue([]);
    messageRepo.countByTripId.mockResolvedValue(0);

    const result = await useCase.execute({ tripId: 'trip-1' });
    expect(result.messages).toEqual([]);
    expect(result.total).toBe(0);
  });
});
