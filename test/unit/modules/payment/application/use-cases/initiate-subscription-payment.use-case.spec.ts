import { InitiateSubscriptionPaymentUseCase } from '@/modules/payment/application/use-cases/initiate-subscription-payment.use-case';
import { PaymentTransactionRepository } from '@/modules/payment/domain/ports/payment-transaction.repository';
import { WompiPort } from '@/modules/payment/domain/ports/wompi.port';
import { SubscriptionPlanRepository } from '@/modules/subscriptions/domain/repositories/subscription-plan.repository.interface';
import { DriverDocumentRepository } from '@/modules/documents/domain/repositories/driver-document.repository.interface';
import { PaymentStatus } from '@/modules/payment/domain/enums/payment-status.enum';
import { PaymentMethod } from '@/modules/payment/domain/enums/payment-method.enum';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const mockPlan = {
  id: 'plan-monthly',
  name: 'Plan Mensual',
  isActive: true,
  price: 30000,
  computeExpirationFrom: jest.fn((d: Date) => {
    const exp = new Date(d);
    exp.setDate(exp.getDate() + 30);
    return exp;
  }),
};

const baseInput = {
  driverId: 'driver-1',
  planId: 'plan-monthly',
  method: PaymentMethod.NEQUI,
  customerEmail: 'driver@test.com',
  customerFullName: 'Carlos R.',
  redirectUrl: 'https://app.sharedroute.co/payment/result',
};

describe('InitiateSubscriptionPaymentUseCase', () => {
  let useCase: InitiateSubscriptionPaymentUseCase;
  let txRepo: jest.Mocked<PaymentTransactionRepository>;
  let wompiPort: jest.Mocked<WompiPort>;
  let planRepo: jest.Mocked<SubscriptionPlanRepository>;
  let docRepo: jest.Mocked<DriverDocumentRepository>;

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

    planRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionPlanRepository>;

    docRepo = {
      hasAllApproved: jest.fn(),
      findByDriverId: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<DriverDocumentRepository>;

    useCase = new InitiateSubscriptionPaymentUseCase(
      txRepo,
      wompiPort,
      planRepo,
      docRepo,
    );
  });

  it('should create a pending transaction and return Wompi payment link', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue(mockPlan as never);
    wompiPort.createCheckout.mockResolvedValue({
      wompiTransactionId: 'wompi-tx-001',
      paymentLink: 'https://checkout.wompi.co/?ref=SR-driver-1-plan-monthly',
      status: 'PENDING',
    });

    const result = await useCase.execute(baseInput);

    expect(result.status).toBe(PaymentStatus.PENDING);
    expect(result.paymentLink).toContain('wompi');
    expect(result.amountInCents).toBe(3000000);
    expect(txRepo.save).toHaveBeenCalled();
    expect(wompiPort.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'COP',
        customerEmail: 'driver@test.com',
        method: PaymentMethod.NEQUI,
      }),
    );
  });

  it('should throw ForbiddenException if documents not approved', async () => {
    docRepo.hasAllApproved.mockResolvedValue(false);

    await expect(useCase.execute(baseInput)).rejects.toThrow(ForbiddenException);
    expect(wompiPort.createCheckout).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if plan does not exist', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(NotFoundException);
    expect(wompiPort.createCheckout).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if plan is inactive', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue({ ...mockPlan, isActive: false } as never);

    await expect(useCase.execute(baseInput)).rejects.toThrow(NotFoundException);
  });

  it('should convert plan price to cents (price * 100)', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue({ ...mockPlan, price: 15000 } as never);
    wompiPort.createCheckout.mockResolvedValue({
      wompiTransactionId: 'wompi-tx-002',
      paymentLink: 'https://checkout.wompi.co/?ref=ref-2',
      status: 'PENDING',
    });

    const result = await useCase.execute(baseInput);

    expect(result.amountInCents).toBe(1500000);
    expect(wompiPort.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ amountInCents: 1500000 }),
    );
  });

  it('should generate a unique wompiReference per transaction', async () => {
    docRepo.hasAllApproved.mockResolvedValue(true);
    planRepo.findById.mockResolvedValue(mockPlan as never);
    wompiPort.createCheckout.mockResolvedValue({
      wompiTransactionId: 'wompi-tx-003',
      paymentLink: 'https://checkout.wompi.co/?ref=ref-3',
      status: 'PENDING',
    });

    const r1 = await useCase.execute(baseInput);
    const r2 = await useCase.execute(baseInput);

    expect(r1.wompiReference).not.toBe(r2.wompiReference);
  });
});
