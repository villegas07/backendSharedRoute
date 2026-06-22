import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SubscriptionPlanRepository } from '../../domain/repositories/subscription-plan.repository.interface';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { SubscriptionMapper } from '../mappers/subscription.mapper';

@Injectable()
export class GetPlansUseCase implements UseCase<void, SubscriptionPlanResponseDto[]> {
  constructor(private readonly planRepository: SubscriptionPlanRepository) {}

  async execute(): Promise<SubscriptionPlanResponseDto[]> {
    const plans = await this.planRepository.findActive();
    return plans.map((p) => SubscriptionMapper.planToResponse(p));
  }
}
