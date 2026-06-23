import { GetNavigationViewUseCase } from '@/modules/navigation/application/use-cases/get-navigation-view.use-case';
import { NavigationSessionRepository } from '@/modules/navigation/domain/ports/navigation-session.repository';
import { NavigationSessionEntity } from '@/modules/navigation/domain/entities/navigation-session.entity';
import { NotFoundException } from '@nestjs/common';
import { RouteInfo } from '@/modules/navigation/domain/value-objects/route-info.vo';

const mockRoute: RouteInfo = {
  polyline: 'encoded_poly',
  distanceText: '10 km',
  distanceMeters: 10000,
  durationText: '15 min',
  durationSeconds: 900,
  steps: [
    {
      instruction: 'Girar derecha',
      distance: '200 m',
      duration: '1 min',
      startLat: 4.711,
      startLng: -74.072,
      endLat: 4.712,
      endLng: -74.073,
    },
  ],
  startAddress: 'Calle 100',
  endAddress: 'Calle 26',
};

describe('GetNavigationViewUseCase', () => {
  let useCase: GetNavigationViewUseCase;
  let sessionRepo: jest.Mocked<NavigationSessionRepository>;

  beforeEach(() => {
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTripId: jest.fn(),
      findActiveByDriverId: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<NavigationSessionRepository>;

    useCase = new GetNavigationViewUseCase(sessionRepo);
  });

  it('should return driver view with full route and steps', async () => {
    const session = NavigationSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
      originLat: 4.711,
      originLng: -74.072,
      destinationLat: 4.609,
      destinationLng: -74.081,
      route: mockRoute,
    });
    session.start();
    sessionRepo.findById.mockResolvedValue(session);

    const result = await useCase.execute({
      sessionId: session.id,
      userId: 'driver-1',
      role: 'DRIVER',
    });

    expect(result).toHaveProperty('route');
    expect(result).toHaveProperty('currentStepIndex');
    expect(result).toHaveProperty('passengers');
    expect((result as { passengers: string[] }).passengers).toEqual([
      'pass-1',
    ]);
  });

  it('should return passenger view with driver location and polyline', async () => {
    const session = NavigationSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
      originLat: 4.711,
      originLng: -74.072,
      destinationLat: 4.609,
      destinationLng: -74.081,
      route: mockRoute,
    });
    session.start();
    session.updateDriverLocation({
      latitude: 4.715,
      longitude: -74.075,
      heading: 90,
      speed: 30,
      timestamp: new Date(),
    });
    sessionRepo.findById.mockResolvedValue(session);

    const result = await useCase.execute({
      sessionId: session.id,
      userId: 'pass-1',
      role: 'PASSENGER',
    });

    expect(result).toHaveProperty('driverLocation');
    expect(result).toHaveProperty('polyline', 'encoded_poly');
    expect(result).not.toHaveProperty('route');
    expect(result).not.toHaveProperty('currentStepIndex');
  });

  it('should throw NotFoundException if session not found', async () => {
    sessionRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        sessionId: 'x',
        userId: 'u1',
        role: 'DRIVER',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
