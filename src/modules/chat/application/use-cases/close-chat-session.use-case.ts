import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ChatSessionRepository } from '../../domain/ports/chat-session.repository';
import { ChatSessionEntity } from '../../domain/entities/chat-session.entity';

@Injectable()
export class CloseChatSessionUseCase
  implements UseCase<string, ChatSessionEntity>
{
  constructor(private readonly sessionRepo: ChatSessionRepository) {}

  async execute(sessionId: string): Promise<ChatSessionEntity> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de chat no encontrada');
    }

    session.close();
    await this.sessionRepo.save(session);
    return session;
  }
}
