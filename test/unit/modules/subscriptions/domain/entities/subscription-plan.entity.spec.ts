import { SubscriptionPlanEntity, PlanType } from '@/modules/subscriptions/domain/entities/subscription-plan.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

const buildProps = (overrides = {}) => ({
  name: '24 Horas',
  type: PlanType.HOURS_24,
  durationHours: 24,
  price: 9900,
  ...overrides,
});

describe('SubscriptionPlanEntity', () => {
  it('should create with isActive = true by default', () => {
    const plan = SubscriptionPlanEntity.create(buildProps());
    expect(plan.isActive).toBe(true);
  });

  it('should throw when durationHours <= 0', () => {
    expect(() => SubscriptionPlanEntity.create(buildProps({ durationHours: 0 }))).toThrow(DomainException);
  });

  it('should throw when price < 0', () => {
    expect(() => SubscriptionPlanEntity.create(buildProps({ price: -1 }))).toThrow(DomainException);
  });

  it('computeExpirationFrom should add durationHours to startDate', () => {
    const plan = SubscriptionPlanEntity.create(buildProps({ durationHours: 24 }));
    const start = new Date('2026-01-01T00:00:00Z');
    const expiration = plan.computeExpirationFrom(start);
    expect(expiration.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });
});
