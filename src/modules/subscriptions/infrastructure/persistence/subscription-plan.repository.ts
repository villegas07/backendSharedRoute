import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlanEntity } from '../../domain/entities/subscription-plan.entity';
import { SubscriptionPlanRepository } from '../../domain/repositories/subscription-plan.repository.interface';
import { SubscriptionPlanOrmEntity } from './entities/subscription-plan.orm-entity';

@Injectable()
export class SubscriptionPlanRepositoryImpl extends SubscriptionPlanRepository {
  constructor(
    @InjectRepository(SubscriptionPlanOrmEntity)
    private readonly repo: Repository<SubscriptionPlanOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<SubscriptionPlanEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<SubscriptionPlanEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findActive(): Promise<SubscriptionPlanEntity[]> {
    return (await this.repo.findBy({ isActive: true })).map((o) => this.fromOrm(o));
  }

  async save(entity: SubscriptionPlanEntity): Promise<SubscriptionPlanEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: SubscriptionPlanEntity): Promise<SubscriptionPlanEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: SubscriptionPlanEntity): SubscriptionPlanOrmEntity {
    const orm = new SubscriptionPlanOrmEntity();
    orm.id = entity.id;
    orm.name = entity.name;
    orm.type = entity.type;
    orm.durationHours = entity.durationHours;
    orm.price = entity.price;
    orm.isActive = entity.isActive;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: SubscriptionPlanOrmEntity): SubscriptionPlanEntity {
    const entity = SubscriptionPlanEntity.create({
      id: orm.id,
      name: orm.name,
      type: orm.type,
      durationHours: orm.durationHours,
      price: orm.price,
      isActive: orm.isActive,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
