import { Injectable } from '@nestjs/common';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';

@Injectable()
export class SubscriptionRepositoryImpl extends SubscriptionRepository {
  async findById(_id: string): Promise<SubscriptionEntity | null> { throw new Error('Not implemented'); }
  async findAll(): Promise<SubscriptionEntity[]> { throw new Error('Not implemented'); }
  async findActiveByDriverId(_driverId: string): Promise<SubscriptionEntity | null> { throw new Error('Not implemented'); }
  async findByDriverId(_driverId: string): Promise<SubscriptionEntity[]> { throw new Error('Not implemented'); }
  async save(_entity: SubscriptionEntity): Promise<SubscriptionEntity> { throw new Error('Not implemented'); }
  async update(_entity: SubscriptionEntity): Promise<SubscriptionEntity> { throw new Error('Not implemented'); }
  async delete(_id: string): Promise<void> { throw new Error('Not implemented'); }
  async exists(_id: string): Promise<boolean> { throw new Error('Not implemented'); }
}
