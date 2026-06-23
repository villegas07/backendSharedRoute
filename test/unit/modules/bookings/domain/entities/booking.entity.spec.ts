import { BookingEntity, BookingStatus } from '@/modules/bookings/domain/entities/booking.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

const buildProps = (overrides = {}) => ({
  tripId: 'trip-1',
  passengerId: 'passenger-1',
  seatsReserved: 1,
  totalPrice: 15000,
  ...overrides,
});

describe('BookingEntity', () => {
  describe('create', () => {
    it('should create with PENDING status by default', () => {
      const booking = BookingEntity.create(buildProps());
      expect(booking.status).toBe(BookingStatus.PENDING);
    });

    it('should throw when seatsReserved < 1', () => {
      expect(() => BookingEntity.create(buildProps({ seatsReserved: 0 }))).toThrow(DomainException);
    });
  });

  describe('confirm', () => {
    it('should change status to CONFIRMED', () => {
      const booking = BookingEntity.create(buildProps());
      booking.confirm();
      expect(booking.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw when confirming a non-PENDING booking', () => {
      const booking = BookingEntity.create(buildProps());
      booking.confirm();
      expect(() => booking.confirm()).toThrow(DomainException);
    });
  });

  describe('cancelByPassenger', () => {
    it('should set status to CANCELLED_BY_PASSENGER', () => {
      const booking = BookingEntity.create(buildProps());
      booking.cancelByPassenger();
      expect(booking.status).toBe(BookingStatus.CANCELLED_BY_PASSENGER);
    });

    it('should throw when booking is already COMPLETED', () => {
      const booking = BookingEntity.create(buildProps({ status: BookingStatus.COMPLETED }));
      expect(() => booking.cancelByPassenger()).toThrow(DomainException);
    });
  });

  describe('cancelByDriver', () => {
    it('should set status to CANCELLED_BY_DRIVER', () => {
      const booking = BookingEntity.create(buildProps());
      booking.cancelByDriver();
      expect(booking.status).toBe(BookingStatus.CANCELLED_BY_DRIVER);
    });
  });

  describe('isCancelled', () => {
    it('should return true when cancelled by passenger', () => {
      const booking = BookingEntity.create(buildProps());
      booking.cancelByPassenger();
      expect(booking.isCancelled()).toBe(true);
    });

    it('should return false when PENDING', () => {
      const booking = BookingEntity.create(buildProps());
      expect(booking.isCancelled()).toBe(false);
    });
  });
});
