import { SendMessageUseCase } from '@/modules/chat/application/use-cases/send-message.use-case';
import { ChatSessionRepository } from '@/modules/chat/domain/ports/chat-session.repository';
import { ChatMessageRepository } from '@/modules/chat/domain/ports/chat-message.repository';
import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { MessageType } from '@/modules/chat/domain/enums/message-type.enum';
import { SenderRole } from '@/modules/chat/domain/enums/sender-role.enum';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const makeMockSessionRepo = (): jest.Mocked<ChatSessionRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByTripId: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<ChatSessionRepository>);

const makeMockMessageRepo = (): jest.Mocked<ChatMessageRepository> => ({
  save: jest.fn(),
  findByTripId: jest.fn(),
  countByTripId: jest.fn(),
} as jest.Mocked<ChatMessageRepository>);

const baseSession = ChatSessionEntity.create({
  tripId: 'trip-1',
  driverId: 'driver-1',
  passengerIds: ['pass-1'],
});

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let sessionRepo: jest.Mocked<ChatSessionRepository>;
  let messageRepo: jest.Mocked<ChatMessageRepository>;

  beforeEach(() => {
    sessionRepo = makeMockSessionRepo();
    messageRepo = makeMockMessageRepo();
    useCase = new SendMessageUseCase(sessionRepo, messageRepo);
  });

  it('should create and save a text message', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);

    const result = await useCase.execute({
      tripId: 'trip-1',
      senderId: 'driver-1',
      senderRole: SenderRole.DRIVER,
      content: 'Hola pasajero!',
    });

    expect(result.content).toBe('Hola pasajero!');
    expect(result.messageType).toBe(MessageType.TEXT);
    expect(result.senderId).toBe('driver-1');
    expect(messageRepo.save).toHaveBeenCalledWith(result);
  });

  it('should allow passenger to send message', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);

    const result = await useCase.execute({
      tripId: 'trip-1',
      senderId: 'pass-1',
      senderRole: SenderRole.PASSENGER,
      content: 'Estoy listo',
    });

    expect(result.senderRole).toBe(SenderRole.PASSENGER);
  });

  it('should throw NotFoundException if no session for trip', async () => {
    sessionRepo.findByTripId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tripId: 'nonexistent',
        senderId: 'driver-1',
        senderRole: SenderRole.DRIVER,
        content: 'Hola',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if session is closed', async () => {
    const closedSession = ChatSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
    });
    closedSession.close();
    sessionRepo.findByTripId.mockResolvedValue(closedSession);

    await expect(
      useCase.execute({
        tripId: 'trip-1',
        senderId: 'driver-1',
        senderRole: SenderRole.DRIVER,
        content: 'Hola',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if sender is not a participant', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);

    await expect(
      useCase.execute({
        tripId: 'trip-1',
        senderId: 'intruder-99',
        senderRole: SenderRole.PASSENGER,
        content: 'Hola',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
