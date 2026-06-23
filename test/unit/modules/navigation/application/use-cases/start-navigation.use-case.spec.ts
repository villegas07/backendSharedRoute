import { StartNavigationUseCase } from '@/modules/navigation/application/use-cases/start-navigation.use-case';
import { NavigationSessionRepository } from '@/modules/navigation/domain/ports/navigation-session.repository';
import { DirectionsPort } from '@/modules/navigation/domain/ports/directions.port';
import { NavigationStatus } from '@/modules/navigation/domain/enums/navigation-status.enum';
import { RouteInfo } from '@/modules/navigation/domain/value-objects/route-info.vo';

describe('StartNavigationUseCase', () => {
  let useCase: StartNavigationUseCase;
  let sessionRepo: jest.Mocked<NavigationSessionRepository>;
  let directionsPort: jest.Mocked<DirectionsPort>;

  const mockRoute: RouteInfo = {
    polyline: 'encoded',
    distanceText: '10 km',
    distanceMeters: 10000,
    durationText: '15 min',
    durationSeconds: 900,
    steps: [],
    startAddress: 'Origen',
    endAddress: 'Destino',
  };

  const input = {
    tripId: 'trip-1',
    driverId: 'driver-1',
    passengerIds: ['pass-1'],
    originLat: 4.711,
    originLng: -74.072,
    destinationLat: 4.609,
    destinationLng: -74.081,
  };

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

    useCase = new StartNavigationUseCase(sessionRepo, directionsPort);
  });

  it('should create and start a navigation session', async () => {
    sessionRepo.findByTripId.mockResolvedValue(null);
    directionsPort.getDirections.mockResolvedValue(mockRoute);

    const result = await useCase.execute(input);

    expect(result.status).toBe(NavigationStatus.ACTIVE);
    expect(result.tripId).toBe('trip-1');
    expect(result.route).toEqual(mockRoute);
    expect(sessionRepo.save).toHaveBeenCalled();
    expect(directionsPort.getDirections).toHaveBeenCalledWith(
      4.711, -74.072, 4.609, -74.081,
    );
  });

  it('should return existing session if trip already has one', async () => {
    const existingSession = {
      isFinished: jest.fn().mockReturnValue(false),
      tripId: 'trip-1',
    };
    sessionRepo.findByTripId.mockResolvedValue(existingSession as never);

    const result = await useCase.execute(input);

    expect(result).toBe(existingSession);
    expect(directionsPort.getDirections).not.toHaveBeenCalled();
  });

  it('should create new session if existing is finished', async () => {
    const finishedSession = {
      isFinished: jest.fn().mockReturnValue(true),
    };
    sessionRepo.findByTripId.mockResolvedValue(finishedSession as never);
    directionsPort.getDirections.mockResolvedValue(mockRoute);

    const result = await useCase.execute(input);

    expect(result.status).toBe(NavigationStatus.ACTIVE);
  });
});
