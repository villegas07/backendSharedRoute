import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateBookingUseCase } from '@/modules/bookings/application/use-cases/create-booking.use-case';
import { TripEntity, TripStatus } from '@/modules/trips/domain/entities/trip.entity';
import { BookingEntity, BookingStatus } from '@/modules/bookings/domain/entities/booking.entity';
import { LocationValueObject } from '@/modules/trips/domain/value-objects/location.vo';

const buildMockBookingRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByTripId: jest.fn(), findByPassengerId: jest.fn(), findByTripAndPassenger: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildMockTripRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findAvailable: jest.fn(), findByDriverId: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildPublishedTrip = () => {
  const loc = (c: string) => LocationValueObject.create({ latitude: 4.7, longitude: -74.0, address: 'Cra 7', city: c });
  return TripEntity.create({ id: 'trip-1', driverId: 'driver-1', vehicleId: 'v-1', origin: loc('Bogotá'), destination: loc('Medellín'), departureAt: new Date(Date.now() + 3_600_000), availableSeats: 3, pricePerSeat: 15000, status: TripStatus.PUBLISHED });
};

const buildSavedBooking = () =>
  BookingEntity.create({ id: 'b-1', tripId: 'trip-1', passengerId: 'p-1', seatsReserved: 1, totalPrice: 15000 });

describe('CreateBookingUseCase', () => {
  let useCase: CreateBookingUseCase;
  let bookingRepo: ReturnType<typeof buildMockBookingRepo>;
  let tripRepo: ReturnType<typeof buildMockTripRepo>;

  beforeEach(() => {
    bookingRepo = buildMockBookingRepo();
    tripRepo = buildMockTripRepo();
    useCase = new CreateBookingUseCase(bookingRepo as any, tripRepo as any);
  });

  it('should create a booking successfully', async () => {
    tripRepo.findById.mockResolvedValue(buildPublishedTrip());
    bookingRepo.findByTripAndPassenger.mockResolvedValue(null);
    tripRepo.update.mockResolvedValue(buildPublishedTrip());
    bookingRepo.save.mockResolvedValue(buildSavedBooking());

    const result = await useCase.execute({ passengerId: 'p-1', dto: { tripId: 'trip-1', seatsReserved: 1 } });

    expect(result.status).toBe(BookingStatus.PENDING);
    expect(result.totalPrice).toBe(15000);
  });

  it('should throw NotFoundException when trip does not exist', async () => {
    tripRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ passengerId: 'p-1', dto: { tripId: 'missing', seatsReserved: 1 } })).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when already booked', async () => {
    tripRepo.findById.mockResolvedValue(buildPublishedTrip());
    bookingRepo.findByTripAndPassenger.mockResolvedValue(buildSavedBooking());
    await expect(useCase.execute({ passengerId: 'p-1', dto: { tripId: 'trip-1', seatsReserved: 1 } })).rejects.toThrow(ConflictException);
  });

  it('should throw ConflictException when no seats available', async () => {
    const loc = (c: string) => LocationValueObject.create({ latitude: 4.7, longitude: -74.0, address: 'Cra 7', city: c });
    const fullTrip = TripEntity.create({ driverId: 'd1', vehicleId: 'v1', origin: loc('A'), destination: loc('B'), departureAt: new Date(Date.now() + 3_600_000), availableSeats: 1, pricePerSeat: 10000, status: TripStatus.PUBLISHED });
    fullTrip.reserveSeat();
    tripRepo.findById.mockResolvedValue(fullTrip);
    bookingRepo.findByTripAndPassenger.mockResolvedValue(null);
    await expect(useCase.execute({ passengerId: 'p-1', dto: { tripId: 'trip-1', seatsReserved: 1 } })).rejects.toThrow(ConflictException);
  });
});
