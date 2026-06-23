import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { PaymentTransactionRepository } from '../../domain/ports/payment-transaction.repository';
import { WompiPort } from '../../domain/ports/wompi.port';
import { SubscriptionPlanRepository } from '../../../subscriptions/domain/repositories/subscription-plan.repository.interface';
import { DriverDocumentRepository } from '../../../documents/domain/repositories/driver-document.repository.interface';
import { PaymentTransactionEntity } from '../../domain/entities/payment-transaction.entity';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { randomUUID } from 'crypto';

export interface InitiatePaymentInput {
  driverId: string;
  planId: string;
  method: PaymentMethod;
  customerEmail: string;
  customerFullName: string;
  redirectUrl: string;
}

export interface InitiatePaymentResult {
  transactionId: string;
  paymentLink: string;
  wompiReference: string;
  amountInCents: number;
  status: PaymentStatus;
}

@Injectable()
export class InitiateSubscriptionPaymentUseCase
  implements UseCase<InitiatePaymentInput, InitiatePaymentResult>
{
  constructor(
    private readonly txRepo: PaymentTransactionRepository,
    private readonly wompiPort: WompiPort,
    private readonly planRepo: SubscriptionPlanRepository,
    private readonly documentRepo: DriverDocumentRepository,
  ) {}

  async execute(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    await this.ensureDocumentsApproved(input.driverId);

    const plan = await this.planRepo.findById(input.planId);
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan de suscripción no encontrado o inactivo');
    }

    const amountInCents = plan.price * 100;
    const reference = `SR-${input.driverId}-${input.planId}-${randomUUID().slice(0, 8)}`;

    const checkout = await this.wompiPort.createCheckout({
      amountInCents,
      currency: 'COP',
      reference,
      redirectUrl: input.redirectUrl,
      method: input.method,
      customerEmail: input.customerEmail,
      customerFullName: input.customerFullName,
    });

    const tx = PaymentTransactionEntity.create({
      driverId: input.driverId,
      planId: plan.id,
      planName: plan.name,
      amountInCents,
      currency: 'COP',
      method: input.method,
      wompiReference: reference,
      wompiTransactionId: checkout.wompiTransactionId,
      paymentLink: checkout.paymentLink,
      redirectUrl: input.redirectUrl,
    });

    await this.txRepo.save(tx);

    return {
      transactionId: tx.id,
      paymentLink: checkout.paymentLink,
      wompiReference: reference,
      amountInCents,
      status: tx.status,
    };
  }

  private async ensureDocumentsApproved(driverId: string): Promise<void> {
    const allApproved = await this.documentRepo.hasAllApproved(driverId);
    if (!allApproved) {
      throw new ForbiddenException(
        'Debes tener SOAT, Licencia y Cédula aprobados antes de comprar una suscripción',
      );
    }
  }
}
