import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { ChatSessionRepository } from '../../domain/ports/chat-session.repository';
import { ChatMessageRepository } from '../../domain/ports/chat-message.repository';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';

interface GetChatHistoryInput {
  tripId: string;
  limit?: number;
  offset?: number;
}

export interface ChatHistoryResult {
  messages: ChatMessageEntity[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class GetChatHistoryUseCase
  implements UseCase<GetChatHistoryInput, ChatHistoryResult>
{
  constructor(
    private readonly sessionRepo: ChatSessionRepository,
    private readonly messageRepo: ChatMessageRepository,
  ) {}

  async execute(input: GetChatHistoryInput): Promise<ChatHistoryResult> {
    const session = await this.sessionRepo.findByTripId(input.tripId);
    if (!session) {
      throw new NotFoundException('Sesión de chat no encontrada');
    }

    const limit = input.limit ?? 50;
    const offset = input.offset ?? 0;

    const [messages, total] = await Promise.all([
      this.messageRepo.findByTripId(input.tripId, limit, offset),
      this.messageRepo.countByTripId(input.tripId),
    ]);

    return { messages, total, limit, offset };
  }
}
