import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { SubscriptionEntity } from '../entities/subscription.entity';

export abstract class SubscriptionRepository extends BaseRepository<SubscriptionEntity> {
  abstract findActiveByDriverId(driverId: string): Promise<SubscriptionEntity | null>;
  abstract findByDriverId(driverId: string): Promise<SubscriptionEntity[]>;
}
