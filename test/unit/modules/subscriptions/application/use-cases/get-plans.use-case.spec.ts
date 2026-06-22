import { GetPlansUseCase } from '@/modules/subscriptions/application/use-cases/get-plans.use-case';
import { SubscriptionPlanEntity, PlanType } from '@/modules/subscriptions/domain/entities/subscription-plan.entity';

const buildMockRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findActive: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildPlans = () => [
  SubscriptionPlanEntity.create({ id: 'p1', name: '24 Horas', type: PlanType.HOURS_24, durationHours: 24, price: 9900 }),
  SubscriptionPlanEntity.create({ id: 'p2', name: '30 Días', type: PlanType.MONTHLY, durationHours: 720, price: 59900 }),
];

describe('GetPlansUseCase', () => {
  let useCase: GetPlansUseCase;
  let mockRepo: ReturnType<typeof buildMockRepo>;

  beforeEach(() => {
    mockRepo = buildMockRepo();
    useCase = new GetPlansUseCase(mockRepo as any);
  });

  it('should return mapped list of active plans', async () => {
    mockRepo.findActive.mockResolvedValue(buildPlans());
    const result = await useCase.execute();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('24 Horas');
    expect(result[1].durationHours).toBe(720);
  });

  it('should return empty array when no plans available', async () => {
    mockRepo.findActive.mockResolvedValue([]);
    const result = await useCase.execute();
    expect(result).toHaveLength(0);
  });
});
