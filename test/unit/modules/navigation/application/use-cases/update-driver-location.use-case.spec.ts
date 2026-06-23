import { UpdateDriverLocationUseCase } from '@/modules/navigation/application/use-cases/update-driver-location.use-case';
import { NavigationSessionRepository } from '@/modules/navigation/domain/ports/navigation-session.repository';
import { DirectionsPort } from '@/modules/navigation/domain/ports/directions.port';
import { NavigationSessionEntity } from '@/modules/navigation/domain/entities/navigation-session.entity';
import { NotFoundException } from '@nestjs/common';

describe('UpdateDriverLocationUseCase', () => {
  let useCase: UpdateDriverLocationUseCase;
  let sessionRepo: jest.Mocked<NavigationSessionRepository>;
  let directionsPort: jest.Mocked<DirectionsPort>;

  beforeEach(() => {
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTripId: jest.fn(),
      findActiveByDriverId: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<NavigationSessionRepository>;

    directionsPort = {
      getDirections: jest.fn(),
      getEtaSeconds: jest.fn(),
    } as jest.Mocked<DirectionsPort>;

    useCase = new UpdateDriverLocationUseCase(sessionRepo, directionsPort);
  });

  it('should update driver location and ETA', async () => {
    const session = NavigationSessionEntity.create({
      tripId: 'trip-1',
      driverId: 'driver-1',
      passengerIds: ['pass-1'],
      originLat: 4.711,
      originLng: -74.072,
      destinationLat: 4.609,
      destinationLng: -74.081,
    });
    session.start();

    sessionRepo.findById.mockResolvedValue(session);
    directionsPort.getEtaSeconds.mockResolvedValue(600);

    const result = await useCase.execute({
      sessionId: session.id,
      driverId: 'driver-1',
      latitude: 4.715,
      longitude: -74.075,
      heading: 90,
      speed: 30,
    });

    expect(result.etaSeconds).toBe(600);
    expect(result.session.driverLocation?.latitude).toBe(4.715);
    expect(sessionRepo.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if session not found', async () => {
    sessionRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        sessionId: 'nonexistent',
        driverId: 'driver-1',
        latitude: 0,
        longitude: 0,
        heading: 0,
        speed: 0,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
