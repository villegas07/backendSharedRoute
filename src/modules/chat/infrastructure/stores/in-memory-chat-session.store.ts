import { Injectable } from '@nestjs/common';
import { ChatSessionRepository } from '../../domain/ports/chat-session.repository';
import { ChatSessionEntity } from '../../domain/entities/chat-session.entity';

@Injectable()
export class InMemoryChatSessionStore extends ChatSessionRepository {
  private readonly sessions = new Map<string, ChatSessionEntity>();

  async save(session: ChatSessionEntity): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<ChatSessionEntity | null> {
    return this.sessions.get(id) ?? null;
  }

  async findByTripId(tripId: string): Promise<ChatSessionEntity | null> {
    for (const session of this.sessions.values()) {
      if (session.tripId === tripId) return session;
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}
