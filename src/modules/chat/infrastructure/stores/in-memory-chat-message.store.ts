import { Injectable } from '@nestjs/common';
import { ChatMessageRepository } from '../../domain/ports/chat-message.repository';
import { ChatMessageEntity } from '../../domain/entities/chat-message.entity';

@Injectable()
export class InMemoryChatMessageStore extends ChatMessageRepository {
  private readonly messages: ChatMessageEntity[] = [];

  async save(message: ChatMessageEntity): Promise<void> {
    this.messages.push(message);
  }

  async findByTripId(
    tripId: string,
    limit: number,
    offset: number,
  ): Promise<ChatMessageEntity[]> {
    return this.messages
      .filter((m) => m.tripId === tripId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
      .slice(offset, offset + limit);
  }

  async countByTripId(tripId: string): Promise<number> {
    return this.messages.filter((m) => m.tripId === tripId).length;
  }
}
