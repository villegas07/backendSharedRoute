import { GetTripHistoryUseCase } from '@/modules/trip-history/application/use-cases/get-trip-history.use-case';
import { GetTripHistoryDetailUseCase } from '@/modules/trip-history/application/use-cases/get-trip-history-detail.use-case';
import { TripHistoryPort, TripHistoryFilter } from '@/modules/trip-history/domain/ports/trip-history.port';
import {
  TripHistoryPage,
  TripHistoryEntry,
} from '@/modules/trip-history/domain/value-objects/trip-history-entry.vo';

const origin = {
  latitude: 4.711,
  longitude: -74.0721,
  address: 'Calle 100 #15-20',
  city: 'Bogotá',
};
const destination = {
  latitude: 4.609,
  longitude: -74.0817,
  address: 'Calle 26 #60-80',
  city: 'Bogotá',
};
const driver = {
  driverId: 'driver-1',
  driverName: 'Carlos Rodríguez',
  driverPhone: '+573001234567',
  vehiclePlate: 'ABC123',
  vehicleModel: 'Renault Logan 2020',
};

const makeEntry = (
  override?: Partial<TripHistoryEntry>,
): TripHistoryEntry => ({
  tripId: 'trip-1',
  role: 'PASSENGER',
  status: 'COMPLETED',
  origin,
  destination,
  departureAt: new Date('2026-06-01T08:00:00Z'),
  arrivedAt: new Date('2026-06-01T08:45:00Z'),
  durationMinutes: 45,
  driver,
  seatsReserved: 1,
  pricePerSeat: 8000,
  totalPaid: 8000,
  passengerCount: 3,
  notes: 'Ruta sin novedades',
  ...override,
});

const makeMockPort = (): jest.Mocked<TripHistoryPort> => ({
  getHistory: jest.fn(),
  getTripDetail: jest.fn(),
} as jest.Mocked<TripHistoryPort>);

describe('GetTripHistoryUseCase', () => {
  let useCase: GetTripHistoryUseCase;
  let port: jest.Mocked<TripHistoryPort>;

  const baseFilter: TripHistoryFilter = {
    userId: 'pass-1',
    role: 'PASSENGER',
    page: 1,
    pageSize: 10,
  };

  beforeEach(() => {
    port = makeMockPort();
    useCase = new GetTripHistoryUseCase(port);
  });

  it('should return paginated history for a passenger', async () => {
    const page: TripHistoryPage = {
      entries: [makeEntry()],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
    port.getHistory.mockResolvedValue(page);

    const result = await useCase.execute(baseFilter);

    expect(result.entries).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(port.getHistory).toHaveBeenCalledWith(baseFilter);
  });

  it('should return paginated history for a driver', async () => {
    const driverEntry = makeEntry({ role: 'DRIVER', seatsReserved: 3, totalPaid: 24000 });
    const page: TripHistoryPage = {
      entries: [driverEntry],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };
    port.getHistory.mockResolvedValue(page);

    const result = await useCase.execute({ ...baseFilter, role: 'DRIVER', userId: 'driver-1' });

    expect(result.entries[0].role).toBe('DRIVER');
    expect(result.entries[0].totalPaid).toBe(24000);
  });

  it('should return empty page when user has no history', async () => {
    const emptyPage: TripHistoryPage = {
      entries: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    };
    port.getHistory.mockResolvedValue(emptyPage);

    const result = await useCase.execute(baseFilter);

    expect(result.entries).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should forward date filters to the port', async () => {
    const emptyPage: TripHistoryPage = { entries: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    port.getHistory.mockResolvedValue(emptyPage);

    const from = new Date('2026-01-01');
    const to = new Date('2026-06-30');

    await useCase.execute({ ...baseFilter, fromDate: from, toDate: to });

    expect(port.getHistory).toHaveBeenCalledWith(
      expect.objectContaining({ fromDate: from, toDate: to }),
    );
  });

  it('should support pagination — second page', async () => {
    const page2: TripHistoryPage = {
      entries: [makeEntry({ tripId: 'trip-11' })],
      total: 11,
      page: 2,
      pageSize: 10,
      totalPages: 2,
    };
    port.getHistory.mockResolvedValue(page2);

    const result = await useCase.execute({ ...baseFilter, page: 2 });

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.entries[0].tripId).toBe('trip-11');
  });

  it('should include rating snapshot when available', async () => {
    const entryWithRating = makeEntry({
      rating: { emoji: '😍', score: 5, comment: 'Excelente!' },
    });
    const page: TripHistoryPage = { entries: [entryWithRating], total: 1, page: 1, pageSize: 10, totalPages: 1 };
    port.getHistory.mockResolvedValue(page);

    const result = await useCase.execute(baseFilter);

    expect(result.entries[0].rating?.emoji).toBe('😍');
    expect(result.entries[0].rating?.score).toBe(5);
  });

  it('should filter by status when provided', async () => {
    const emptyPage: TripHistoryPage = { entries: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
    port.getHistory.mockResolvedValue(emptyPage);

    await useCase.execute({ ...baseFilter, status: 'CANCELLED' });

    expect(port.getHistory).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CANCELLED' }),
    );
  });
});

describe('GetTripHistoryDetailUseCase', () => {
  let useCase: GetTripHistoryDetailUseCase;
  let port: jest.Mocked<TripHistoryPort>;

  beforeEach(() => {
    port = makeMockPort();
    useCase = new GetTripHistoryDetailUseCase(port);
  });

  it('should return trip detail for a participant', async () => {
    const entry = makeEntry();
    port.getTripDetail.mockResolvedValue(entry);

    const result = await useCase.execute({
      tripId: 'trip-1',
      userId: 'pass-1',
    });

    expect(result).not.toBeNull();
    expect(result?.tripId).toBe('trip-1');
    expect(result?.driver.driverName).toBe('Carlos Rodríguez');
    expect(result?.driver.vehiclePlate).toBe('ABC123');
    expect(result?.origin.address).toBe('Calle 100 #15-20');
    expect(result?.destination.address).toBe('Calle 26 #60-80');
    expect(result?.totalPaid).toBe(8000);
    expect(result?.durationMinutes).toBe(45);
    expect(port.getTripDetail).toHaveBeenCalledWith('trip-1', 'pass-1');
  });

  it('should return null when trip not in user history', async () => {
    port.getTripDetail.mockResolvedValue(null);

    const result = await useCase.execute({
      tripId: 'nonexistent',
      userId: 'pass-1',
    });

    expect(result).toBeNull();
  });

  it('should expose full driver info in detail', async () => {
    const entry = makeEntry({
      driver: {
        driverId: 'driver-1',
        driverName: 'Juan Pérez',
        driverPhone: '+573009876543',
        vehiclePlate: 'XYZ789',
        vehicleModel: 'Chevrolet Spark 2022',
      },
    });
    port.getTripDetail.mockResolvedValue(entry);

    const result = await useCase.execute({ tripId: 'trip-1', userId: 'pass-1' });

    expect(result?.driver.driverPhone).toBe('+573009876543');
    expect(result?.driver.vehicleModel).toBe('Chevrolet Spark 2022');
  });

  it('should expose passenger count in detail', async () => {
    const entry = makeEntry({ passengerCount: 4 });
    port.getTripDetail.mockResolvedValue(entry);

    const result = await useCase.execute({ tripId: 'trip-1', userId: 'pass-1' });

    expect(result?.passengerCount).toBe(4);
  });
});
