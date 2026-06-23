import { SendImageMessageUseCase } from '@/modules/chat/application/use-cases/send-image-message.use-case';
import { ChatSessionRepository } from '@/modules/chat/domain/ports/chat-session.repository';
import { ChatMessageRepository } from '@/modules/chat/domain/ports/chat-message.repository';
import { FileStorageService } from '@/shared/storage/file-storage.service';
import { ChatSessionEntity } from '@/modules/chat/domain/entities/chat-session.entity';
import { MessageType } from '@/modules/chat/domain/enums/message-type.enum';
import { SenderRole } from '@/modules/chat/domain/enums/sender-role.enum';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const makeFile = (
  overrides?: Partial<Express.Multer.File>,
): Express.Multer.File =>
  ({
    originalname: 'foto.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 100,
    buffer: Buffer.from('fake-image'),
    ...overrides,
  } as Express.Multer.File);

const baseSession = ChatSessionEntity.create({
  tripId: 'trip-1',
  driverId: 'driver-1',
  passengerIds: ['pass-1'],
});

describe('SendImageMessageUseCase', () => {
  let useCase: SendImageMessageUseCase;
  let sessionRepo: jest.Mocked<ChatSessionRepository>;
  let messageRepo: jest.Mocked<ChatMessageRepository>;
  let fileStorage: jest.Mocked<FileStorageService>;

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

    fileStorage = {
      upload: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<FileStorageService>;

    useCase = new SendImageMessageUseCase(sessionRepo, messageRepo, fileStorage);
  });

  it('should upload image and save an IMAGE message', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);
    fileStorage.upload.mockResolvedValue('uploads/chat/trip-1/uuid.jpg');

    const result = await useCase.execute({
      tripId: 'trip-1',
      senderId: 'driver-1',
      senderRole: SenderRole.DRIVER,
      file: makeFile(),
    });

    expect(result.messageType).toBe(MessageType.IMAGE);
    expect(result.imageUrl).toBe('uploads/chat/trip-1/uuid.jpg');
    expect(fileStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({ mimetype: 'image/jpeg' }),
      'chat/trip-1',
    );
    expect(messageRepo.save).toHaveBeenCalled();
  });

  it('should accept PNG files', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);
    fileStorage.upload.mockResolvedValue('uploads/chat/trip-1/uuid.png');

    const result = await useCase.execute({
      tripId: 'trip-1',
      senderId: 'pass-1',
      senderRole: SenderRole.PASSENGER,
      file: makeFile({ mimetype: 'image/png', originalname: 'pic.png' }),
    });

    expect(result.messageType).toBe(MessageType.IMAGE);
  });

  it('should throw BadRequestException for unsupported file type', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);

    await expect(
      useCase.execute({
        tripId: 'trip-1',
        senderId: 'driver-1',
        senderRole: SenderRole.DRIVER,
        file: makeFile({ mimetype: 'application/pdf' }),
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for files over 10 MB', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);
    const bigFile = makeFile({ size: 11 * 1024 * 1024 });

    await expect(
      useCase.execute({
        tripId: 'trip-1',
        senderId: 'driver-1',
        senderRole: SenderRole.DRIVER,
        file: bigFile,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if no session for trip', async () => {
    sessionRepo.findByTripId.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tripId: 'nonexistent',
        senderId: 'driver-1',
        senderRole: SenderRole.DRIVER,
        file: makeFile(),
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if session is closed', async () => {
    const closed = ChatSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
    });
    closed.close();
    sessionRepo.findByTripId.mockResolvedValue(closed);

    await expect(
      useCase.execute({
        tripId: 'trip-1',
        senderId: 'driver-1',
        senderRole: SenderRole.DRIVER,
        file: makeFile(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for non-participant sender', async () => {
    sessionRepo.findByTripId.mockResolvedValue(baseSession);

    await expect(
      useCase.execute({
        tripId: 'trip-1',
        senderId: 'intruder',
        senderRole: SenderRole.PASSENGER,
        file: makeFile(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
