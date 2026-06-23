import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ChatSessionRepository } from '../../domain/ports/chat-session.repository';
import { ChatMessageRepository } from '../../domain/ports/chat-message.repository';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';
import { MessageType } from '../../domain/enums/message-type.enum';
import { SenderRole } from '../../domain/enums/sender-role.enum';

interface SendMessageInput {
  tripId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
}

@Injectable()
export class SendMessageUseCase
  implements UseCase<SendMessageInput, ChatMessageEntity>
{
  constructor(
    private readonly sessionRepo: ChatSessionRepository,
    private readonly messageRepo: ChatMessageRepository,
  ) {}

  async execute(input: SendMessageInput): Promise<ChatMessageEntity> {
    const session = await this.sessionRepo.findByTripId(input.tripId);
    if (!session) {
      throw new NotFoundException('Sesión de chat no encontrada para este viaje');
    }
    if (!session.canSendMessages()) {
      throw new ForbiddenException('La sesión de chat está cerrada');
    }
    if (!session.isParticipant(input.senderId)) {
      throw new ForbiddenException(
        'No eres participante de esta sesión de chat',
      );
    }

    const message = ChatMessageEntity.create({
      tripId: input.tripId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      content: input.content,
      messageType: MessageType.TEXT,
    });

    await this.messageRepo.save(message);
    return message;
  }
}
