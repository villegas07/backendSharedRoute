import { PaymentTransactionEntity } from '../entities/payment-transaction.entity';

export abstract class PaymentTransactionRepository {
  abstract save(tx: PaymentTransactionEntity): Promise<void>;
  abstract findById(id: string): Promise<PaymentTransactionEntity | null>;
  abstract findByWompiReference(ref: string): Promise<PaymentTransactionEntity | null>;
  abstract findByDriverId(driverId: string): Promise<PaymentTransactionEntity[]>;
}
