import { SubscriptionEntity, SubscriptionStatus } from '@/modules/subscriptions/domain/entities/subscription.entity';
import { SubscriptionPlanEntity, PlanType } from '@/modules/subscriptions/domain/entities/subscription-plan.entity';
import { SubscriptionMapper } from '@/modules/subscriptions/application/mappers/subscription.mapper';

const buildSub = () =>
  SubscriptionEntity.create({
    id: 'sub-1',
    driverId: 'driver-1',
    planId: 'plan-1',
    planName: '24 Horas',
    startAt: new Date(),
    expiresAt: new Date(Date.now() + 86_400_000),
  });

const buildPlan = () =>
  SubscriptionPlanEntity.create({
    id: 'plan-1',
    name: '24 Horas',
    type: PlanType.HOURS_24,
    durationHours: 24,
    price: 9900,
  });

describe('SubscriptionMapper', () => {
  describe('toResponse', () => {
    it('should map subscription correctly', () => {
      const dto = SubscriptionMapper.toResponse(buildSub());
      expect(dto.driverId).toBe('driver-1');
      expect(dto.planName).toBe('24 Horas');
      expect(dto.isActive).toBe(true);
    });
  });

  describe('planToResponse', () => {
    it('should map plan correctly', () => {
      const dto = SubscriptionMapper.planToResponse(buildPlan());
      expect(dto.durationHours).toBe(24);
      expect(dto.price).toBe(9900);
    });
  });
});
