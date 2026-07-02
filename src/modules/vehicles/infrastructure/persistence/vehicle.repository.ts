import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository.interface';
import { VehicleOrmEntity } from './entities/vehicle.orm-entity';

@Injectable()
export class VehicleRepositoryImpl extends VehicleRepository {
  constructor(
    @InjectRepository(VehicleOrmEntity)
    private readonly repo: Repository<VehicleOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<VehicleEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findByOwnerId(ownerId: string): Promise<VehicleEntity[]> {
    return (await this.repo.findBy({ ownerId })).map((o) => this.fromOrm(o));
  }

  async findByPlate(plate: string): Promise<VehicleEntity | null> {
    const orm = await this.repo.findOneBy({ plate });
    return orm ? this.fromOrm(orm) : null;
  }

  async save(entity: VehicleEntity): Promise<VehicleEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: VehicleEntity): Promise<VehicleEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: VehicleEntity): VehicleOrmEntity {
    const orm = new VehicleOrmEntity();
    orm.id = entity.id;
    orm.ownerId = entity.ownerId;
    orm.brand = entity.brand;
    orm.model = entity.model;
    orm.year = entity.year;
    orm.plate = entity.plate;
    orm.color = entity.color;
    orm.totalSeats = entity.totalSeats;
    orm.status = entity.status;
    orm.photoUrl = entity.photoUrl ?? null;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: VehicleOrmEntity): VehicleEntity {
    const entity = VehicleEntity.create({
      id: orm.id,
      ownerId: orm.ownerId,
      brand: orm.brand,
      model: orm.model,
      year: orm.year,
      plate: orm.plate,
      color: orm.color,
      totalSeats: orm.totalSeats,
      status: orm.status,
      photoUrl: orm.photoUrl ?? undefined,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
