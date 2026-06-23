import { PaymentTransactionEntity } from '@/modules/payment/domain/entities/payment-transaction.entity';
import { PaymentStatus } from '@/modules/payment/domain/enums/payment-status.enum';
import { PaymentMethod } from '@/modules/payment/domain/enums/payment-method.enum';
import { DomainException } from '@/domain/exceptions/domain.exception';

const validProps = {
  driverId: 'driver-1',
  planId: 'plan-monthly',
  planName: 'Plan Mensual',
  amountInCents: 3000000,
  currency: 'COP',
  method: PaymentMethod.NEQUI,
  wompiReference: 'SR-driver-1-plan-monthly-123',
};

describe('PaymentTransactionEntity', () => {
  describe('create()', () => {
    it('should create a PENDING transaction with valid data', () => {
      const tx = PaymentTransactionEntity.create(validProps);

      expect(tx.id).toBeDefined();
      expect(tx.status).toBe(PaymentStatus.PENDING);
      expect(tx.driverId).toBe('driver-1');
      expect(tx.planId).toBe('plan-monthly');
      expect(tx.planName).toBe('Plan Mensual');
      expect(tx.amountInCents).toBe(3000000);
      expect(tx.currency).toBe('COP');
      expect(tx.method).toBe(PaymentMethod.NEQUI);
    });

    it('should create transaction for all payment methods', () => {
      const methods = Object.values(PaymentMethod);
      for (const method of methods) {
        const tx = PaymentTransactionEntity.create({ ...validProps, method });
        expect(tx.method).toBe(method);
      }
    });

    it('should throw DomainException if driverId is missing', () => {
      expect(() =>
        PaymentTransactionEntity.create({ ...validProps, driverId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if planId is missing', () => {
      expect(() =>
        PaymentTransactionEntity.create({ ...validProps, planId: '' }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if amount is zero or negative', () => {
      expect(() =>
        PaymentTransactionEntity.create({ ...validProps, amountInCents: 0 }),
      ).toThrow(DomainException);

      expect(() =>
        PaymentTransactionEntity.create({ ...validProps, amountInCents: -1000 }),
      ).toThrow(DomainException);
    });

    it('should throw DomainException if currency is empty', () => {
      expect(() =>
        PaymentTransactionEntity.create({ ...validProps, currency: '' }),
      ).toThrow(DomainException);
    });

    it('should generate unique ids per transaction', () => {
      const t1 = PaymentTransactionEntity.create(validProps);
      const t2 = PaymentTransactionEntity.create(validProps);
      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('approve()', () => {
    it('should transition PENDING → APPROVED and set wompiTransactionId + approvedAt', () => {
      const tx = PaymentTransactionEntity.create(validProps);

      tx.approve('wompi-tx-abc123');

      expect(tx.status).toBe(PaymentStatus.APPROVED);
      expect(tx.wompiTransactionId).toBe('wompi-tx-abc123');
      expect(tx.approvedAt).toBeInstanceOf(Date);
    });

    it('should throw DomainException if already APPROVED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.approve('wompi-tx-abc');
      expect(() => tx.approve('wompi-tx-abc')).toThrow(DomainException);
    });

    it('should throw DomainException if already DECLINED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.decline();
      expect(() => tx.approve('wompi-tx-abc')).toThrow(DomainException);
    });
  });

  describe('decline()', () => {
    it('should transition PENDING → DECLINED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.decline();
      expect(tx.status).toBe(PaymentStatus.DECLINED);
    });

    it('should throw DomainException if already APPROVED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.approve('wompi-tx-abc');
      expect(() => tx.decline()).toThrow(DomainException);
    });

    it('should throw DomainException if already DECLINED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.decline();
      expect(() => tx.decline()).toThrow(DomainException);
    });
  });

  describe('isApproved()', () => {
    it('should return false for PENDING', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      expect(tx.isApproved()).toBe(false);
    });

    it('should return true for APPROVED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.approve('wompi-tx-abc');
      expect(tx.isApproved()).toBe(true);
    });

    it('should return false for DECLINED', () => {
      const tx = PaymentTransactionEntity.create(validProps);
      tx.decline();
      expect(tx.isApproved()).toBe(false);
    });
  });
});
