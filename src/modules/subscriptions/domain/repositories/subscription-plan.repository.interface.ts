import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { SubscriptionPlanEntity } from '../entities/subscription-plan.entity';

export abstract class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlanEntity> {
  abstract findActive(): Promise<SubscriptionPlanEntity[]>;
}
