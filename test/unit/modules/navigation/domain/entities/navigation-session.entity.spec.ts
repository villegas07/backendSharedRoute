import { NavigationSessionEntity } from '@/modules/navigation/domain/entities/navigation-session.entity';
import { NavigationStatus } from '@/modules/navigation/domain/enums/navigation-status.enum';
import { DomainException } from '@/domain/exceptions/domain.exception';
import { RouteInfo } from '@/modules/navigation/domain/value-objects/route-info.vo';

const mockRoute: RouteInfo = {
  polyline: 'encoded_polyline',
  distanceText: '10 km',
  distanceMeters: 10000,
  durationText: '15 min',
  durationSeconds: 900,
  steps: [
    {
      instruction: 'Girar a la derecha',
      distance: '200 m',
      duration: '1 min',
      startLat: 4.711,
      startLng: -74.072,
      endLat: 4.712,
      endLng: -74.073,
    },
    {
      instruction: 'Continuar recto',
      distance: '1 km',
      duration: '3 min',
      startLat: 4.712,
      startLng: -74.073,
      endLat: 4.72,
      endLng: -74.08,
    },
  ],
  startAddress: 'Calle 100, Bogotá',
  endAddress: 'Calle 26, Bogotá',
};

const validProps = {
  tripId: 'trip-123',
  driverId: 'driver-1',
  passengerIds: ['pass-1', 'pass-2'],
  originLat: 4.711,
  originLng: -74.072,
  destinationLat: 4.609,
  destinationLng: -74.081,
  route: mockRoute,
};

describe('NavigationSessionEntity', () => {
  it('should create a session in WAITING status', () => {
    const session = NavigationSessionEntity.create(validProps);

    expect(session.tripId).toBe('trip-123');
    expect(session.driverId).toBe('driver-1');
    expect(session.passengerIds).toEqual(['pass-1', 'pass-2']);
    expect(session.status).toBe(NavigationStatus.WAITING);
    expect(session.route).toBeDefined();
  });

  it('should throw if tripId is missing', () => {
    expect(() =>
      NavigationSessionEntity.create({ ...validProps, tripId: '' }),
    ).toThrow(DomainException);
  });

  it('should throw if driverId is missing', () => {
    expect(() =>
      NavigationSessionEntity.create({ ...validProps, driverId: '' }),
    ).toThrow(DomainException);
  });

  describe('start()', () => {
    it('should transition from WAITING to ACTIVE', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.start();
      expect(session.status).toBe(NavigationStatus.ACTIVE);
    });

    it('should throw if not in WAITING status', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.start();
      expect(() => session.start()).toThrow(DomainException);
    });
  });

  describe('updateDriverLocation()', () => {
    it('should update location on active session', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.start();

      session.updateDriverLocation({
        latitude: 4.715,
        longitude: -74.075,
        heading: 90,
        speed: 30,
        timestamp: new Date(),
      });

      expect(session.driverLocation?.latitude).toBe(4.715);
    });

    it('should throw if session is not active', () => {
      const session = NavigationSessionEntity.create(validProps);

      expect(() =>
        session.updateDriverLocation({
          latitude: 4.715,
          longitude: -74.075,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        }),
      ).toThrow(DomainException);
    });
  });

  describe('advanceStep()', () => {
    it('should increment step index', () => {
      const session = NavigationSessionEntity.create(validProps);
      expect(session.currentStepIndex).toBe(0);
      session.advanceStep();
      expect(session.currentStepIndex).toBe(1);
    });

    it('should not exceed max steps', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.advanceStep();
      session.advanceStep();
      expect(session.currentStepIndex).toBe(1);
    });
  });

  describe('complete()', () => {
    it('should transition from ACTIVE to COMPLETED', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.start();
      session.complete();
      expect(session.status).toBe(NavigationStatus.COMPLETED);
    });

    it('should throw if not active', () => {
      const session = NavigationSessionEntity.create(validProps);
      expect(() => session.complete()).toThrow(DomainException);
    });
  });

  describe('cancel()', () => {
    it('should cancel a waiting session', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.cancel();
      expect(session.status).toBe(NavigationStatus.CANCELLED);
    });

    it('should throw if already finished', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.start();
      session.complete();
      expect(() => session.cancel()).toThrow(DomainException);
    });
  });

  describe('isParticipant()', () => {
    it('should return true for the driver', () => {
      const session = NavigationSessionEntity.create(validProps);
      expect(session.isParticipant('driver-1')).toBe(true);
    });

    it('should return true for a passenger', () => {
      const session = NavigationSessionEntity.create(validProps);
      expect(session.isParticipant('pass-1')).toBe(true);
    });

    it('should return false for a stranger', () => {
      const session = NavigationSessionEntity.create(validProps);
      expect(session.isParticipant('stranger')).toBe(false);
    });
  });

  describe('updateEta()', () => {
    it('should set estimated arrival seconds', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.updateEta(600);
      expect(session.estimatedArrivalSeconds).toBe(600);
    });
  });

  describe('isFinished()', () => {
    it('should return false for WAITING', () => {
      const session = NavigationSessionEntity.create(validProps);
      expect(session.isFinished()).toBe(false);
    });

    it('should return true for COMPLETED', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.start();
      session.complete();
      expect(session.isFinished()).toBe(true);
    });

    it('should return true for CANCELLED', () => {
      const session = NavigationSessionEntity.create(validProps);
      session.cancel();
      expect(session.isFinished()).toBe(true);
    });
  });
});
