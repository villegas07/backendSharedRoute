import { InMemoryNavigationSessionStore } from '@/modules/navigation/infrastructure/stores/in-memory-navigation-session.store';
import { NavigationSessionEntity } from '@/modules/navigation/domain/entities/navigation-session.entity';

describe('InMemoryNavigationSessionStore', () => {
  let store: InMemoryNavigationSessionStore;

  const createSession = (overrides?: Record<string, unknown>) =>
    NavigationSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
      originLat: 4.711,
      originLng: -74.072,
      destinationLat: 4.609,
      destinationLng: -74.081,
      ...(overrides as Record<string, never>),
    });

  beforeEach(() => {
    store = new InMemoryNavigationSessionStore();
  });

  it('should save and find by id', async () => {
    const session = createSession();
    await store.save(session);

    const found = await store.findById(session.id);
    expect(found).toBe(session);
  });

  it('should return null for non-existent id', async () => {
    const found = await store.findById('nonexistent');
    expect(found).toBeNull();
  });

  it('should find by tripId', async () => {
    const session = createSession();
    await store.save(session);

    const found = await store.findByTripId('trip-1');
    expect(found?.tripId).toBe('trip-1');
  });

  it('should find active session by driverId', async () => {
    const session = createSession();
    await store.save(session);

    const found = await store.findActiveByDriverId('driver-1');
    expect(found?.driverId).toBe('driver-1');
  });

  it('should not find finished session as active', async () => {
    const session = createSession();
    session.start();
    session.complete();
    await store.save(session);

    const found = await store.findActiveByDriverId('driver-1');
    expect(found).toBeNull();
  });

  it('should delete a session', async () => {
    const session = createSession();
    await store.save(session);
    await store.delete(session.id);

    const found = await store.findById(session.id);
    expect(found).toBeNull();
  });
});
