import { ChatMessageEntity } from '../entities/chat-message.entity';

export abstract class ChatMessageRepository {
  abstract save(message: ChatMessageEntity): Promise<void>;
  abstract findByTripId(
    tripId: string,
    limit: number,
    offset: number,
  ): Promise<ChatMessageEntity[]>;
  abstract countByTripId(tripId: string): Promise<number>;
}
