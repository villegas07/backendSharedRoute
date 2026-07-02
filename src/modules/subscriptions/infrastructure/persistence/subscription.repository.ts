import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity, SubscriptionStatus } from '../../domain/entities/subscription.entity';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository.interface';
import { SubscriptionOrmEntity } from './entities/subscription.orm-entity';

@Injectable()
export class SubscriptionRepositoryImpl extends SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repo: Repository<SubscriptionOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<SubscriptionEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<SubscriptionEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findActiveByDriverId(driverId: string): Promise<SubscriptionEntity | null> {
    const orm = await this.repo.findOneBy({ driverId, status: SubscriptionStatus.ACTIVE });
    return orm ? this.fromOrm(orm) : null;
  }

  async findByDriverId(driverId: string): Promise<SubscriptionEntity[]> {
    return (await this.repo.findBy({ driverId })).map((o) => this.fromOrm(o));
  }

  async save(entity: SubscriptionEntity): Promise<SubscriptionEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: SubscriptionEntity): Promise<SubscriptionEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: SubscriptionEntity): SubscriptionOrmEntity {
    const orm = new SubscriptionOrmEntity();
    orm.id = entity.id;
    orm.driverId = entity.driverId;
    orm.planId = entity.planId;
    orm.planName = entity.planName;
    orm.startAt = entity.startAt;
    orm.expiresAt = entity.expiresAt;
    orm.status = entity.status;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: SubscriptionOrmEntity): SubscriptionEntity {
    const entity = SubscriptionEntity.create({
      id: orm.id,
      driverId: orm.driverId,
      planId: orm.planId,
      planName: orm.planName,
      startAt: orm.startAt,
      expiresAt: orm.expiresAt,
      status: orm.status,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
