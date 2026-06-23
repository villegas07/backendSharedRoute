import { Injectable, Logger } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { PaymentTransactionRepository } from '../../domain/ports/payment-transaction.repository';
import { WompiPort } from '../../domain/ports/wompi.port';
import { SubscriptionRepository } from '../../../subscriptions/domain/repositories/subscription.repository.interface';
import { SubscriptionPlanRepository } from '../../../subscriptions/domain/repositories/subscription-plan.repository.interface';
import { SubscriptionEntity } from '../../../subscriptions/domain/entities/subscription.entity';

export interface HandleWompiWebhookInput {
  signature: string;
  rawPayload: string;
  wompiTransactionId: string;
  reference: string;
  status: string;
}

@Injectable()
export class HandleWompiWebhookUseCase
  implements UseCase<HandleWompiWebhookInput, void>
{
  private readonly logger = new Logger(HandleWompiWebhookUseCase.name);

  constructor(
    private readonly txRepo: PaymentTransactionRepository,
    private readonly wompiPort: WompiPort,
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly planRepo: SubscriptionPlanRepository,
  ) {}

  async execute(input: HandleWompiWebhookInput): Promise<void> {
    const isValid = this.wompiPort.validateWebhookSignature(
      input.signature,
      input.rawPayload,
    );
    if (!isValid) {
      this.logger.warn('[Wompi] Invalid webhook signature — ignored');
      return;
    }

    const tx = await this.txRepo.findByWompiReference(input.reference);
    if (!tx) {
      this.logger.warn(`[Wompi] Transaction not found for ref: ${input.reference}`);
      return;
    }

    if (input.status === 'APPROVED') {
      tx.approve(input.wompiTransactionId);
      await this.txRepo.save(tx);
      await this.createSubscription(tx.driverId, tx.planId);
      return;
    }

    if (input.status === 'DECLINED' || input.status === 'VOIDED') {
      tx.decline();
      await this.txRepo.save(tx);
    }
  }

  private async createSubscription(
    driverId: string,
    planId: string,
  ): Promise<void> {
    const plan = await this.planRepo.findById(planId);
    if (!plan) return;

    const startAt = new Date();
    const expiresAt = plan.computeExpirationFrom(startAt);

    const subscription = SubscriptionEntity.create({
      driverId,
      planId: plan.id,
      planName: plan.name,
      startAt,
      expiresAt,
    });

    await this.subscriptionRepo.save(subscription);
    this.logger.log(`[Wompi] Subscription created for driver ${driverId}`);
  }
}
