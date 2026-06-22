import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import { SubscriptionPlanRepository } from '../../domain/repositories/subscription-plan.repository.interface';
import { DriverDocumentRepository } from '../../../documents/domain/repositories/driver-document.repository.interface';
import { PurchaseSubscriptionDto } from '../dtos/purchase-subscription.dto';
import { SubscriptionResponseDto } from '../dtos/subscription-response.dto';
import { SubscriptionMapper } from '../mappers/subscription.mapper';

interface PurchaseInput {
  driverId: string;
  dto: PurchaseSubscriptionDto;
}

@Injectable()
export class PurchaseSubscriptionUseCase implements UseCase<PurchaseInput, SubscriptionResponseDto> {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly planRepository: SubscriptionPlanRepository,
    private readonly documentRepository: DriverDocumentRepository,
  ) {}

  async execute({ driverId, dto }: PurchaseInput): Promise<SubscriptionResponseDto> {
    await this.ensureDocumentsApproved(driverId);

    const plan = await this.planRepository.findById(dto.planId);
    if (!plan || !plan.isActive) throw new NotFoundException('Subscription plan not found or inactive');

    const startAt = new Date();
    const expiresAt = plan.computeExpirationFrom(startAt);

    const subscription = SubscriptionEntity.create({
      driverId,
      planId: plan.id,
      planName: plan.name,
      startAt,
      expiresAt,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    return SubscriptionMapper.toResponse(saved);
  }

  private async ensureDocumentsApproved(driverId: string): Promise<void> {
    const allApproved = await this.documentRepository.hasAllApproved(driverId);
    if (!allApproved) {
      throw new ForbiddenException(
        'All required documents (SOAT, License, Cédula) must be approved before purchasing a subscription',
      );
    }
  }
}
