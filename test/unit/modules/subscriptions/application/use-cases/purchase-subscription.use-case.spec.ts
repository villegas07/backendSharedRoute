import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PurchaseSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/purchase-subscription.use-case';
import { SubscriptionPlanEntity, PlanType } from '@/modules/subscriptions/domain/entities/subscription-plan.entity';
import { SubscriptionEntity } from '@/modules/subscriptions/domain/entities/subscription.entity';

const buildMockSubRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findActiveByDriverId: jest.fn(), findByDriverId: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildMockPlanRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findActive: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildMockDocRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByDriverId: jest.fn(), findByDriverAndType: jest.fn(), findPending: jest.fn(), hasAllApproved: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildPlan = () =>
  SubscriptionPlanEntity.create({ id: 'plan-1', name: '24 Horas', type: PlanType.HOURS_24, durationHours: 24, price: 9900 });

const buildSavedSub = () =>
  SubscriptionEntity.create({ id: 'sub-1', driverId: 'driver-1', planId: 'plan-1', planName: '24 Horas', startAt: new Date(), expiresAt: new Date(Date.now() + 86_400_000) });

describe('PurchaseSubscriptionUseCase', () => {
  let useCase: PurchaseSubscriptionUseCase;
  let subRepo: ReturnType<typeof buildMockSubRepo>;
  let planRepo: ReturnType<typeof buildMockPlanRepo>;
  let docRepo: ReturnType<typeof buildMockDocRepo>;

  beforeEach(() => {
    subRepo = buildMockSubRepo();
    planRepo = buildMockPlanRepo();
    docRepo = buildMockDocRepo();
    useCase = new PurchaseSubscriptionUseCase(subRepo as any, planRepo as any, docRepo as any);
  });

  it('should create a subscription when all docs are approved', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue(buildPlan());
    subRepo.save.mockResolvedValue(buildSavedSub());

    const result = await useCase.execute({ driverId: 'driver-1', dto: { planId: 'plan-1' } });

    expect(result.planName).toBe('24 Horas');
    expect(result.isActive).toBe(true);
  });

  it('should throw ForbiddenException when documents are not approved', async () => {
    docRepo.hasAllApproved.mockResolvedValue(false);
    await expect(useCase.execute({ driverId: 'driver-1', dto: { planId: 'plan-1' } })).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when plan does not exist', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ driverId: 'driver-1', dto: { planId: 'missing' } })).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when plan is inactive', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    const inactivePlan = buildPlan();
    inactivePlan.isActive = false;
    planRepo.findById.mockResolvedValue(inactivePlan);
    await expect(useCase.execute({ driverId: 'driver-1', dto: { planId: 'plan-1' } })).rejects.toThrow(NotFoundException);
  });
});
