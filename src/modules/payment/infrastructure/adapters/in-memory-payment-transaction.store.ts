import { Injectable } from '@nestjs/common';
import { PaymentTransactionRepository } from '../../domain/ports/payment-transaction.repository';
import { PaymentTransactionEntity } from '../../domain/entities/payment-transaction.entity';

@Injectable()
export class InMemoryPaymentTransactionStore
  extends PaymentTransactionRepository
{
  private readonly store = new Map<string, PaymentTransactionEntity>();

  async save(tx: PaymentTransactionEntity): Promise<void> {
    this.store.set(tx.id, tx);
  }

  async findById(id: string): Promise<PaymentTransactionEntity | null> {
    return this.store.get(id) ?? null;
  }

  async findByWompiReference(
    ref: string,
  ): Promise<PaymentTransactionEntity | null> {
    for (const tx of this.store.values()) {
      if (tx.wompiReference === ref) return tx;
    }
    return null;
  }

  async findByDriverId(driverId: string): Promise<PaymentTransactionEntity[]> {
    return [...this.store.values()].filter((tx) => tx.driverId === driverId);
  }
}
