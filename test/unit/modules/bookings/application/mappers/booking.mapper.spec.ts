import { BookingEntity, BookingStatus } from '@/modules/bookings/domain/entities/booking.entity';
import { BookingMapper } from '@/modules/bookings/application/mappers/booking.mapper';

const buildBooking = () =>
  BookingEntity.create({
    id: 'booking-1',
    tripId: 'trip-1',
    passengerId: 'passenger-1',
    seatsReserved: 1,
    totalPrice: 15000,
  });

describe('BookingMapper', () => {
  it('should map all fields', () => {
    const dto = BookingMapper.toResponse(buildBooking());
    expect(dto.tripId).toBe('trip-1');
    expect(dto.totalPrice).toBe(15000);
    expect(dto.status).toBe(BookingStatus.PENDING);
  });
});
