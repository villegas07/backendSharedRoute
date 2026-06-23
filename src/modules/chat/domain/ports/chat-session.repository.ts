import { ChatSessionEntity } from '../entities/chat-session.entity';

export abstract class ChatSessionRepository {
  abstract save(session: ChatSessionEntity): Promise<void>;
  abstract findById(id: string): Promise<ChatSessionEntity | null>;
  abstract findByTripId(tripId: string): Promise<ChatSessionEntity | null>;
  abstract delete(id: string): Promise<void>;
}
