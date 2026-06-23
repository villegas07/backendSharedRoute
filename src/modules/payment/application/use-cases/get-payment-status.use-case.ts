import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { PaymentTransactionRepository } from '../../domain/ports/payment-transaction.repository';
import { PaymentTransactionEntity } from '../../domain/entities/payment-transaction.entity';

@Injectable()
export class GetPaymentStatusUseCase
  implements UseCase<string, PaymentTransactionEntity | null>
{
  constructor(private readonly txRepo: PaymentTransactionRepository) {}

  async execute(transactionId: string): Promise<PaymentTransactionEntity | null> {
    return this.txRepo.findById(transactionId);
  }
}
