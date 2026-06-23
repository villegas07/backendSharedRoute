import { OpenChatSessionUseCase } from '@/modules/chat/application/use-cases/open-chat-session.use-case';
import { CloseChatSessionUseCase } from '@/modules/chat/application/use-cases/close-chat-session.use-case';
import { ChatSessionRepository } from '@/modules/chat/domain/ports/chat-session.repository';
import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { ChatSessionStatus } from '@/modules/chat/domain/enums/chat-session-status.enum';
import { NotFoundException } from '@nestjs/common';

const makeMockRepo = (): jest.Mocked<ChatSessionRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByTripId: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<ChatSessionRepository>);

const validInput = {
  tripId: 'trip-1',
  driverId: 'driver-1',
  passengerIds: ['pass-1'],
};

describe('OpenChatSessionUseCase', () => {
  let useCase: OpenChatSessionUseCase;
  let repo: jest.Mocked<ChatSessionRepository>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new OpenChatSessionUseCase(repo);
  });

  it('should create and save a new chat session', async () => {
    repo.findByTripId.mockResolvedValue(null);

    const result = await useCase.execute(validInput);

    expect(result.tripId).toBe('trip-1');
    expect(result.status).toBe(ChatSessionStatus.OPEN);
    expect(repo.save).toHaveBeenCalledWith(result);
  });

  it('should return existing session if already exists', async () => {
    const existing = ChatSessionEntity.create(validInput);
    repo.findByTripId.mockResolvedValue(existing);

    const result = await useCase.execute(validInput);

    expect(result).toBe(existing);
    expect(repo.save).not.toHaveBeenCalled();
  });
});

describe('CloseChatSessionUseCase', () => {
  let useCase: CloseChatSessionUseCase;
  let repo: jest.Mocked<ChatSessionRepository>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new CloseChatSessionUseCase(repo);
  });

  it('should close an open session', async () => {
    const session = ChatSessionEntity.create(validInput);
    repo.findById.mockResolvedValue(session);

    const result = await useCase.execute(session.id);

    expect(result.status).toBe(ChatSessionStatus.CLOSED);
    expect(repo.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if session not found', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NotFoundException,
    );
  });
});
