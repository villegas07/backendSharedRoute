import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import { SubscriptionPlanEntity } from '../../domain/entities/subscription-plan.entity';
import { SubscriptionResponseDto } from '../dtos/subscription-response.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';

export class SubscriptionMapper {
  static toResponse(entity: SubscriptionEntity): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();
    dto.id = entity.id;
    dto.driverId = entity.driverId;
    dto.planId = entity.planId;
    dto.planName = entity.planName;
    dto.startAt = entity.startAt;
    dto.expiresAt = entity.expiresAt;
    dto.status = entity.status;
    dto.isActive = entity.isActive();
    return dto;
  }

  static planToResponse(entity: SubscriptionPlanEntity): SubscriptionPlanResponseDto {
    const dto = new SubscriptionPlanResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.durationHours = entity.durationHours;
    dto.price = entity.price;
    return dto;
  }
}
