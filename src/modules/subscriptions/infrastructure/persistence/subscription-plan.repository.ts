import { Injectable } from '@nestjs/common';
import { SubscriptionPlanEntity } from '../../domain/entities/subscription-plan.entity';
import { SubscriptionPlanRepository } from '../../domain/repositories/subscription-plan.repository.interface';

@Injectable()
export class SubscriptionPlanRepositoryImpl extends SubscriptionPlanRepository {
  async findById(_id: string): Promise<SubscriptionPlanEntity | null> { throw new Error('Not implemented'); }
  async findAll(): Promise<SubscriptionPlanEntity[]> { throw new Error('Not implemented'); }
  async findActive(): Promise<SubscriptionPlanEntity[]> { throw new Error('Not implemented'); }
  async save(_entity: SubscriptionPlanEntity): Promise<SubscriptionPlanEntity> { throw new Error('Not implemented'); }
  async update(_entity: SubscriptionPlanEntity): Promise<SubscriptionPlanEntity> { throw new Error('Not implemented'); }
  async delete(_id: string): Promise<void> { throw new Error('Not implemented'); }
  async exists(_id: string): Promise<boolean> { throw new Error('Not implemented'); }
}
