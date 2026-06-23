import { NavigationSessionEntity } from '../entities/navigation-session.entity';

export abstract class NavigationSessionRepository {
  abstract save(session: NavigationSessionEntity): Promise<void>;
  abstract findById(id: string): Promise<NavigationSessionEntity | null>;
  abstract findByTripId(tripId: string): Promise<NavigationSessionEntity | null>;
  abstract findActiveByDriverId(driverId: string): Promise<NavigationSessionEntity | null>;
  abstract delete(id: string): Promise<void>;
}
