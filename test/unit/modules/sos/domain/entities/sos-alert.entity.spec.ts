import { SosAlertEntity } from '@/modules/sos/domain/entities/sos-alert.entity';
import { SosAlertStatus } from '@/modules/sos/domain/enums/sos-alert-status.enum';
import { SosUserRole } from '@/modules/sos/domain/enums/sos-user-role.enum';
import { DomainException } from '@/domain/exceptions/domain.exception';

const validProps = {
  userId: 'driver-1',
  userRole: SosUserRole.DRIVER,
  tripId: 'trip-1',
  latitude: 4.711,
  longitude: -74.0721,
  message: 'Necesito ayuda',
};

describe('SosAlertEntity', () => {
  describe('create()', () => {
    it('should create alert with ACTIVE status by default', () => {
      const alert = SosAlertEntity.create(validProps);

      expect(alert.id).toBeDefined();
      expect(alert.status).toBe(SosAlertStatus.ACTIVE);
      expect(alert.userId).toBe('driver-1');
      expect(alert.userRole).toBe(SosUserRole.DRIVER);
      expect(alert.tripId).toBe('trip-1');
    });

    it('should create alert for PASSENGER role', () => {
      const alert = SosAlertEntity.create({
        userId: 'pass-1',
        userRole: SosUserRole.PASSENGER,
      });

      expect(alert.userRole).toBe(SosUserRole.PASSENGER);
      expect(alert.tripId).toBeUndefined();
    });

    it('should create alert without location (location is optional)', () => {
      const alert = SosAlertEntity.create({
        userId: 'user-1',
        userRole: SosUserRole.DRIVER,
      });

      expect(alert.latitude).toBeUndefined();
      expect(alert.longitude).toBeUndefined();
    });

    // RED test — requires validation
    it('should throw DomainException if userId is missing', () => {
      expect(() =>
        SosAlertEntity.create({
          userId: '',
          userRole: SosUserRole.DRIVER,
        }),
      ).toThrow(DomainException);
    });
  });

  describe('resolve()', () => {
    it('should transition ACTIVE → RESOLVED', () => {
      const alert = SosAlertEntity.create(validProps);

      alert.resolve('admin-1');

      expect(alert.status).toBe(SosAlertStatus.RESOLVED);
      expect(alert.resolvedById).toBe('admin-1');
      expect(alert.resolvedAt).toBeInstanceOf(Date);
    });

    it('should throw DomainException if already RESOLVED', () => {
      const alert = SosAlertEntity.create(validProps);
      alert.resolve('admin-1');

      expect(() => alert.resolve('admin-1')).toThrow(DomainException);
    });

    it('should throw DomainException if CANCELLED', () => {
      const alert = SosAlertEntity.create(validProps);
      alert.cancel();

      expect(() => alert.resolve('admin-1')).toThrow(DomainException);
    });
  });

  describe('cancel()', () => {
    it('should transition ACTIVE → CANCELLED', () => {
      const alert = SosAlertEntity.create(validProps);

      alert.cancel();

      expect(alert.status).toBe(SosAlertStatus.CANCELLED);
    });

    it('should throw DomainException if already RESOLVED', () => {
      const alert = SosAlertEntity.create(validProps);
      alert.resolve('admin-1');

      expect(() => alert.cancel()).toThrow(DomainException);
    });

    it('should throw DomainException if already CANCELLED', () => {
      const alert = SosAlertEntity.create(validProps);
      alert.cancel();

      expect(() => alert.cancel()).toThrow(DomainException);
    });
  });

  describe('isActive()', () => {
    it('should return true for ACTIVE status', () => {
      const alert = SosAlertEntity.create(validProps);
      expect(alert.isActive()).toBe(true);
    });

    it('should return false for RESOLVED status', () => {
      const alert = SosAlertEntity.create(validProps);
      alert.resolve('admin-1');
      expect(alert.isActive()).toBe(false);
    });

    it('should return false for CANCELLED status', () => {
      const alert = SosAlertEntity.create(validProps);
      alert.cancel();
      expect(alert.isActive()).toBe(false);
    });
  });
});
