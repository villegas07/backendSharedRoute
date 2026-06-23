import { PublishTripUseCase } from '@/modules/trips/application/use-cases/publish-trip.use-case';
import { TripEntity, TripStatus } from '@/modules/trips/domain/entities/trip.entity';
import { LocationValueObject } from '@/modules/trips/domain/value-objects/location.vo';

const buildMockRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findAvailable: jest.fn(), findByDriverId: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildDto = (overrides = {}) => ({
  vehicleId: 'v-1',
  originAddress: 'Cra 7',
  originCity: 'Bogotá',
  originLatitude: 4.711,
  originLongitude: -74.072,
  destinationAddress: 'Av El Dorado',
  destinationCity: 'Medellín',
  destinationLatitude: 6.244,
  destinationLongitude: -75.58,
  departureAt: new Date(Date.now() + 3_600_000),
  availableSeats: 3,
  pricePerSeat: 15000,
  ...overrides,
});

const buildSavedTrip = () => {
  const origin = LocationValueObject.create({ latitude: 4.711, longitude: -74.072, address: 'Cra 7', city: 'Bogotá' });
  const destination = LocationValueObject.create({ latitude: 6.244, longitude: -75.58, address: 'Av El Dorado', city: 'Medellín' });
  return TripEntity.create({ id: 'trip-1', driverId: 'driver-1', vehicleId: 'v-1', origin, destination, departureAt: new Date(Date.now() + 3_600_000), availableSeats: 3, pricePerSeat: 15000, status: TripStatus.PUBLISHED });
};

describe('PublishTripUseCase', () => {
  let useCase: PublishTripUseCase;
  let mockRepo: ReturnType<typeof buildMockRepo>;

  beforeEach(() => {
    mockRepo = buildMockRepo();
    useCase = new PublishTripUseCase(mockRepo as any);
  });

  it('should publish a trip successfully', async () => {
    mockRepo.save.mockResolvedValue(buildSavedTrip());

    const result = await useCase.execute({ driverId: 'driver-1', dto: buildDto() });

    expect(result.originCity).toBe('Bogotá');
    expect(result.status).toBe(TripStatus.PUBLISHED);
  });

  it('should call save with a PUBLISHED trip', async () => {
    mockRepo.save.mockResolvedValue(buildSavedTrip());
    await useCase.execute({ driverId: 'driver-1', dto: buildDto() });

    const savedTrip = mockRepo.save.mock.calls[0][0] as TripEntity;
    expect(savedTrip.status).toBe(TripStatus.PUBLISHED);
  });
});
