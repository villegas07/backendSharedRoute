import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ChatSessionRepository } from '../../domain/ports/chat-session.repository';
import { ChatMessageRepository } from '../../domain/ports/chat-message.repository';
import { FileStorageService } from '../../../../shared/storage/file-storage.service';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';
import { MessageType } from '../../domain/enums/message-type.enum';
import { SenderRole } from '../../domain/enums/sender-role.enum';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

interface SendImageMessageInput {
  tripId: string;
  senderId: string;
  senderRole: SenderRole;
  file: Express.Multer.File;
}

@Injectable()
export class SendImageMessageUseCase
  implements UseCase<SendImageMessageInput, ChatMessageEntity>
{
  constructor(
    private readonly sessionRepo: ChatSessionRepository,
    private readonly messageRepo: ChatMessageRepository,
    private readonly fileStorage: FileStorageService,
  ) {}

  async execute(input: SendImageMessageInput): Promise<ChatMessageEntity> {
    this.validateFile(input.file);

    const session = await this.sessionRepo.findByTripId(input.tripId);
    if (!session) {
      throw new NotFoundException('Sesión de chat no encontrada');
    }
    if (!session.canSendMessages()) {
      throw new ForbiddenException('La sesión de chat está cerrada');
    }
    if (!session.isParticipant(input.senderId)) {
      throw new ForbiddenException('No eres participante de esta sesión');
    }

    const imageUrl = await this.fileStorage.upload(
      input.file,
      `chat/${input.tripId}`,
    );

    const message = ChatMessageEntity.create({
      tripId: input.tripId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      content: input.file.originalname,
      messageType: MessageType.IMAGE,
      imageUrl,
    });

    await this.messageRepo.save(message);
    return message;
  }

  private validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de imagen no permitido. Use JPG, PNG, WEBP o GIF.',
      );
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('La imagen no puede superar 10 MB.');
    }
  }
}
