import { GetPaymentStatusUseCase } from '@/modules/payment/application/use-cases/get-payment-status.use-case';
import { InMemoryPaymentTransactionStore } from '@/modules/payment/infrastructure/adapters/in-memory-payment-transaction.store';
import { PaymentTransactionEntity } from '@/modules/payment/domain/entities/payment-transaction.entity';
import { PaymentStatus } from '@/modules/payment/domain/enums/payment-status.enum';
import { PaymentMethod } from '@/modules/payment/domain/enums/payment-method.enum';

const makeTx = (method = PaymentMethod.NEQUI) =>
  PaymentTransactionEntity.create({
    driverId: 'driver-1',
    planId: 'plan-1',
    planName: 'Plan Test',
    amountInCents: 3000000,
    currency: 'COP',
    method,
  });

describe('GetPaymentStatusUseCase', () => {
  let useCase: GetPaymentStatusUseCase;
  let store: InMemoryPaymentTransactionStore;

  beforeEach(() => {
    store = new InMemoryPaymentTransactionStore();
    useCase = new GetPaymentStatusUseCase(store);
  });

  it('should return the transaction with its current status', async () => {
    const tx = makeTx();
    await store.save(tx);

    const result = await useCase.execute(tx.id);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(tx.id);
    expect(result?.status).toBe(PaymentStatus.PENDING);
  });

  it('should return updated status after approval', async () => {
    const tx = makeTx();
    await store.save(tx);
    tx.approve('wompi-tx-001');
    await store.save(tx);

    const result = await useCase.execute(tx.id);

    expect(result?.status).toBe(PaymentStatus.APPROVED);
    expect(result?.wompiTransactionId).toBe('wompi-tx-001');
    expect(result?.approvedAt).toBeInstanceOf(Date);
  });

  it('should return null for unknown transaction id', async () => {
    const result = await useCase.execute('nonexistent');
    expect(result).toBeNull();
  });
});

describe('InMemoryPaymentTransactionStore', () => {
  let store: InMemoryPaymentTransactionStore;

  beforeEach(() => {
    store = new InMemoryPaymentTransactionStore();
  });

  it('should save and find by id', async () => {
    const tx = makeTx();
    await store.save(tx);
    expect(await store.findById(tx.id)).toBe(tx);
  });

  it('should find by wompiReference', async () => {
    const tx = PaymentTransactionEntity.create({
      driverId: 'driver-1',
      planId: 'plan-1',
      planName: 'Plan Test',
      amountInCents: 3000000,
      currency: 'COP',
      method: PaymentMethod.CARD,
      wompiReference: 'SR-ref-unique',
    });
    await store.save(tx);

    const found = await store.findByWompiReference('SR-ref-unique');
    expect(found?.wompiReference).toBe('SR-ref-unique');
  });

  it('should return null for unknown reference', async () => {
    expect(await store.findByWompiReference('unknown')).toBeNull();
  });

  it('should find all transactions by driverId', async () => {
    await store.save(makeTx());
    await store.save(makeTx());
    const otherTx = PaymentTransactionEntity.create({
      driverId: 'driver-2',
      planId: 'plan-1',
      planName: 'Plan Test',
      amountInCents: 1000000,
      currency: 'COP',
      method: PaymentMethod.PSE,
    });
    await store.save(otherTx);

    const results = await store.findByDriverId('driver-1');
    expect(results).toHaveLength(2);
    expect(results.every((t) => t.driverId === 'driver-1')).toBe(true);
  });
});
