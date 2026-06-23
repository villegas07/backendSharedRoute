import { SubscriptionEntity, SubscriptionStatus } from '@/modules/subscriptions/domain/entities/subscription.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

const future = (hours = 1) => new Date(Date.now() + hours * 3_600_000);
const past = () => new Date(Date.now() - 3_600_000);

const buildProps = (overrides = {}) => ({
  driverId: 'driver-1',
  planId: 'plan-1',
  planName: '24 Horas',
  startAt: new Date(),
  expiresAt: future(24),
  ...overrides,
});

describe('SubscriptionEntity', () => {
  it('should create with ACTIVE status by default', () => {
    const sub = SubscriptionEntity.create(buildProps());
    expect(sub.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('should throw when expiresAt is not after startAt', () => {
    const start = new Date();
    expect(() => SubscriptionEntity.create(buildProps({ startAt: start, expiresAt: start }))).toThrow(DomainException);
  });

  describe('isActive', () => {
    it('should return true when ACTIVE and not expired', () => {
      const sub = SubscriptionEntity.create(buildProps());
      expect(sub.isActive()).toBe(true);
    });

    it('should return false when expiresAt is in the past', () => {
      const sub = SubscriptionEntity.create(buildProps({ expiresAt: future(1) }));
      (sub as any).expiresAt = past();
      expect(sub.isActive()).toBe(false);
    });

    it('should return false when CANCELLED', () => {
      const sub = SubscriptionEntity.create(buildProps());
      sub.cancel();
      expect(sub.isActive()).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should change status to CANCELLED', () => {
      const sub = SubscriptionEntity.create(buildProps());
      sub.cancel();
      expect(sub.status).toBe(SubscriptionStatus.CANCELLED);
    });

    it('should throw when subscription is not ACTIVE', () => {
      const sub = SubscriptionEntity.create(buildProps());
      sub.cancel();
      expect(() => sub.cancel()).toThrow(DomainException);
    });
  });
});
