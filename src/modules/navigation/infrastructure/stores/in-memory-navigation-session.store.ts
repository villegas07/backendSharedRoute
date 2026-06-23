import { Injectable } from '@nestjs/common';
import { NavigationSessionRepository } from '../../domain/ports/navigation-session.repository';
import { NavigationSessionEntity } from '../../domain/entities/navigation-session.entity';

@Injectable()
export class InMemoryNavigationSessionStore extends NavigationSessionRepository {
  private readonly sessions = new Map<string, NavigationSessionEntity>();

  async save(session: NavigationSessionEntity): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<NavigationSessionEntity | null> {
    return this.sessions.get(id) ?? null;
  }

  async findByTripId(
    tripId: string,
  ): Promise<NavigationSessionEntity | null> {
    for (const session of this.sessions.values()) {
      if (session.tripId === tripId) return session;
    }
    return null;
  }

  async findActiveByDriverId(
    driverId: string,
  ): Promise<NavigationSessionEntity | null> {
    for (const session of this.sessions.values()) {
      if (session.driverId === driverId && !session.isFinished()) {
        return session;
      }
    }
    return null;
  }

  async delete(id: string): Promise<void> {
    this.sessions.delete(id);
  }
}
