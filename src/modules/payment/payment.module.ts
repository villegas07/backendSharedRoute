import { Module } from '@nestjs/common';
import { PaymentTransactionRepository } from './domain/ports/payment-transaction.repository';
import { WompiPort } from './domain/ports/wompi.port';
import { InMemoryPaymentTransactionStore } from './infrastructure/adapters/in-memory-payment-transaction.store';
import { WompiAdapter } from './infrastructure/adapters/wompi.adapter';
import { InitiateSubscriptionPaymentUseCase } from './application/use-cases/initiate-subscription-payment.use-case';
import { HandleWompiWebhookUseCase } from './application/use-cases/handle-wompi-webhook.use-case';
import { GetPaymentStatusUseCase } from './application/use-cases/get-payment-status.use-case';
import { PaymentController } from './presentation/controllers/payment.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [SubscriptionsModule, DocumentsModule],
  controllers: [PaymentController],
  providers: [
    { provide: PaymentTransactionRepository, useClass: InMemoryPaymentTransactionStore },
    { provide: WompiPort, useClass: WompiAdapter },
    InitiateSubscriptionPaymentUseCase,
    HandleWompiWebhookUseCase,
    GetPaymentStatusUseCase,
  ],
  exports: [PaymentTransactionRepository],
})
export class PaymentModule {}
