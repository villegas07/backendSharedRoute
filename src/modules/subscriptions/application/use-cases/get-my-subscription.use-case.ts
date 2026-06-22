import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import { SubscriptionResponseDto } from '../dtos/subscription-response.dto';
import { SubscriptionMapper } from '../mappers/subscription.mapper';

@Injectable()
export class GetMySubscriptionUseCase implements UseCase<string, SubscriptionResponseDto> {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(driverId: string): Promise<SubscriptionResponseDto> {
    const subscription = await this.subscriptionRepository.findActiveByDriverId(driverId);
    if (!subscription) throw new NotFoundException('No active subscription found');
    return SubscriptionMapper.toResponse(subscription);
  }
}
