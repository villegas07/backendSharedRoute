import { TripEntity, TripStatus } from '@/modules/trips/domain/entities/trip.entity';
import { LocationValueObject } from '@/modules/trips/domain/value-objects/location.vo';
import { DomainException } from '@/domain/exceptions/domain.exception';

const buildLocation = (city: string) =>
  LocationValueObject.create({ latitude: 4.711, longitude: -74.072, address: 'Cra 7', city });

const buildProps = (overrides = {}) => ({
  driverId: 'driver-1',
  vehicleId: 'vehicle-1',
  origin: buildLocation('Bogotá'),
  destination: buildLocation('Medellín'),
  departureAt: new Date(Date.now() + 3_600_000),
  availableSeats: 3,
  pricePerSeat: 15000,
  ...overrides,
});

describe('TripEntity', () => {
  describe('create', () => {
    it('should create with DRAFT status by default', () => {
      const trip = TripEntity.create(buildProps());
      expect(trip.status).toBe(TripStatus.DRAFT);
    });

    it('should throw when departure is in the past', () => {
      const past = new Date(Date.now() - 1000);
      expect(() => TripEntity.create(buildProps({ departureAt: past }))).toThrow(DomainException);
    });

    it('should throw when availableSeats < 1', () => {
      expect(() => TripEntity.create(buildProps({ availableSeats: 0 }))).toThrow(DomainException);
    });
  });

  describe('publish', () => {
    it('should change status to PUBLISHED from DRAFT', () => {
      const trip = TripEntity.create(buildProps());
      trip.publish();
      expect(trip.status).toBe(TripStatus.PUBLISHED);
    });

    it('should throw when publishing a non-DRAFT trip', () => {
      const trip = TripEntity.create(buildProps());
      trip.publish();
      expect(() => trip.publish()).toThrow(DomainException);
    });
  });

  describe('reserveSeat', () => {
    it('should decrease availableSeats by 1', () => {
      const trip = TripEntity.create(buildProps({ availableSeats: 2 }));
      trip.reserveSeat();
      expect(trip.availableSeats).toBe(1);
    });

    it('should throw when no seats available', () => {
      const trip = TripEntity.create(buildProps({ availableSeats: 1 }));
      trip.reserveSeat();
      expect(() => trip.reserveSeat()).toThrow(DomainException);
    });
  });

  describe('cancel', () => {
    it('should change status to CANCELLED', () => {
      const trip = TripEntity.create(buildProps());
      trip.cancel();
      expect(trip.status).toBe(TripStatus.CANCELLED);
    });

    it('should throw when trying to cancel a COMPLETED trip', () => {
      const trip = TripEntity.create(buildProps({ status: TripStatus.COMPLETED }));
      expect(() => trip.cancel()).toThrow(DomainException);
    });
  });

  describe('hasAvailableSeats', () => {
    it('should return true when PUBLISHED and seats > 0', () => {
      const trip = TripEntity.create(buildProps());
      trip.publish();
      expect(trip.hasAvailableSeats()).toBe(true);
    });

    it('should return false when DRAFT', () => {
      const trip = TripEntity.create(buildProps());
      expect(trip.hasAvailableSeats()).toBe(false);
    });
  });
});
