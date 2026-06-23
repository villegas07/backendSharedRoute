import { HandleWompiWebhookUseCase } from '@/modules/payment/application/use-cases/handle-wompi-webhook.use-case';
import { PaymentTransactionRepository } from '@/modules/payment/domain/ports/payment-transaction.repository';
import { WompiPort } from '@/modules/payment/domain/ports/wompi.port';
import { SubscriptionRepository } from '@/modules/subscriptions/domain/repositories/subscription.repository.interface';
import { SubscriptionPlanRepository } from '@/modules/subscriptions/domain/repositories/subscription-plan.repository.interface';
import { PaymentTransactionEntity } from '@/modules/payment/domain/entities/payment-transaction.entity';
import { PaymentMethod } from '@/modules/payment/domain/enums/payment-method.enum';
import { PaymentStatus } from '@/modules/payment/domain/enums/payment-status.enum';

const makePendingTx = () =>
  PaymentTransactionEntity.create({
    driverId: 'driver-1',
    planId: 'plan-monthly',
    planName: 'Plan Mensual',
    amountInCents: 3000000,
    currency: 'COP',
    method: PaymentMethod.NEQUI,
    wompiReference: 'SR-ref-001',
  });

const mockPlan = {
  id: 'plan-monthly',
  computeExpirationFrom: (d: Date) => {
    const exp = new Date(d);
    exp.setDate(exp.getDate() + 30);
    return exp;
  },
};

describe('HandleWompiWebhookUseCase', () => {
  let useCase: HandleWompiWebhookUseCase;
  let txRepo: jest.Mocked<PaymentTransactionRepository>;
  let wompiPort: jest.Mocked<WompiPort>;
  let subscriptionRepo: jest.Mocked<SubscriptionRepository>;
  let planRepo: jest.Mocked<SubscriptionPlanRepository>;

  beforeEach(() => {
    txRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByWompiReference: jest.fn(),
      findByDriverId: jest.fn(),
    } as jest.Mocked<PaymentTransactionRepository>;

    wompiPort = {
      createCheckout: jest.fn(),
      getTransactionStatus: jest.fn(),
      validateWebhookSignature: jest.fn(),
    } as jest.Mocked<WompiPort>;

    subscriptionRepo = {
      save: jest.fn(),
      findByDriverId: jest.fn(),
      findActiveByDriverId: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;

    planRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionPlanRepository>;

    useCase = new HandleWompiWebhookUseCase(
      txRepo,
      wompiPort,
      subscriptionRepo,
      planRepo,
    );
  });

  it('should approve transaction and create subscription when payment APPROVED', async () => {
    const tx = makePendingTx();
    txRepo.findByWompiReference.mockResolvedValue(tx);
    wompiPort.validateWebhookSignature.mockReturnValue(true);
    planRepo.findById.mockResolvedValue(mockPlan as never);

    await useCase.execute({
      signature: 'valid-sig',
      rawPayload: '{"data":{}}',
      wompiTransactionId: 'wompi-tx-abc',
      reference: 'SR-ref-001',
      status: 'APPROVED',
    });

    expect(tx.status).toBe(PaymentStatus.APPROVED);
    expect(tx.approvedAt).toBeInstanceOf(Date);
    expect(txRepo.save).toHaveBeenCalled();
    expect(subscriptionRepo.save).toHaveBeenCalled();
  });

  it('should decline transaction when payment DECLINED', async () => {
    const tx = makePendingTx();
    txRepo.findByWompiReference.mockResolvedValue(tx);
    wompiPort.validateWebhookSignature.mockReturnValue(true);

    await useCase.execute({
      signature: 'valid-sig',
      rawPayload: '{}',
      wompiTransactionId: 'wompi-tx-abc',
      reference: 'SR-ref-001',
      status: 'DECLINED',
    });

    expect(tx.status).toBe(PaymentStatus.DECLINED);
    expect(subscriptionRepo.save).not.toHaveBeenCalled();
  });

  it('should ignore webhook with invalid signature', async () => {
    wompiPort.validateWebhookSignature.mockReturnValue(false);

    await useCase.execute({
      signature: 'bad-sig',
      rawPayload: '{}',
      wompiTransactionId: 'wompi-tx-abc',
      reference: 'SR-ref-001',
      status: 'APPROVED',
    });

    expect(txRepo.findByWompiReference).not.toHaveBeenCalled();
    expect(subscriptionRepo.save).not.toHaveBeenCalled();
  });

  it('should silently ignore webhook when transaction not found', async () => {
    wompiPort.validateWebhookSignature.mockReturnValue(true);
    txRepo.findByWompiReference.mockResolvedValue(null);

    await expect(
      useCase.execute({
        signature: 'valid-sig',
        rawPayload: '{}',
        wompiTransactionId: 'wompi-tx-abc',
        reference: 'SR-unknown-ref',
        status: 'APPROVED',
      }),
    ).resolves.not.toThrow();
  });

  it('should not create subscription for non-APPROVED statuses', async () => {
    const tx = makePendingTx();
    txRepo.findByWompiReference.mockResolvedValue(tx);
    wompiPort.validateWebhookSignature.mockReturnValue(true);

    await useCase.execute({
      signature: 'valid-sig',
      rawPayload: '{}',
      wompiTransactionId: 'wompi-tx-abc',
      reference: 'SR-ref-001',
      status: 'VOIDED',
    });

    expect(subscriptionRepo.save).not.toHaveBeenCalled();
  });
});
