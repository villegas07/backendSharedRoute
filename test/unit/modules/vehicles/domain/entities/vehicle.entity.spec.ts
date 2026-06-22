import { VehicleEntity, VehicleStatus } from '@/modules/vehicles/domain/entities/vehicle.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

const buildProps = (overrides = {}) => ({
  ownerId: 'owner-1',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  plate: 'ABC123',
  color: 'Blanco',
  totalSeats: 4,
  ...overrides,
});

describe('VehicleEntity', () => {
  describe('create', () => {
    it('should create with PENDING_INSPECTION status by default', () => {
      const vehicle = VehicleEntity.create(buildProps());
      expect(vehicle.status).toBe(VehicleStatus.PENDING_INSPECTION);
    });

    it('should build displayName correctly', () => {
      const vehicle = VehicleEntity.create(buildProps());
      expect(vehicle.displayName).toBe('2020 Toyota Corolla');
    });

    it('should throw for totalSeats < 1', () => {
      expect(() => VehicleEntity.create(buildProps({ totalSeats: 0 }))).toThrow(DomainException);
    });

    it('should throw for totalSeats > 8', () => {
      expect(() => VehicleEntity.create(buildProps({ totalSeats: 9 }))).toThrow(DomainException);
    });
  });

  describe('isAvailable', () => {
    it('should return false by default (PENDING_INSPECTION)', () => {
      const vehicle = VehicleEntity.create(buildProps());
      expect(vehicle.isAvailable()).toBe(false);
    });

    it('should return true when status is ACTIVE', () => {
      const vehicle = VehicleEntity.create(buildProps({ status: VehicleStatus.ACTIVE }));
      expect(vehicle.isAvailable()).toBe(true);
    });
  });
});
