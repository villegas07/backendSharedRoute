import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { TripEntity, TripStatus } from '../../domain/entities/trip.entity';
import { TripRepository, TripSearchFilters } from '../../domain/repositories/trip.repository.interface';
import { LocationValueObject } from '../../domain/value-objects/location.vo';
import { TripOrmEntity } from './entities/trip.orm-entity';

@Injectable()
export class TripRepositoryImpl extends TripRepository {
  constructor(
    @InjectRepository(TripOrmEntity)
    private readonly repo: Repository<TripOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<TripEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<TripEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findAvailable(filters: TripSearchFilters): Promise<TripEntity[]> {
    const where: FindOptionsWhere<TripOrmEntity> = { status: TripStatus.PUBLISHED };
    if (filters.departureDate) {
      where.departureAt = MoreThanOrEqual(filters.departureDate);
    }
    let results = await this.repo.findBy(where);
    if (filters.originCity) {
      results = results.filter((o) => o.origin.city === filters.originCity);
    }
    if (filters.destinationCity) {
      results = results.filter((o) => o.destination.city === filters.destinationCity);
    }
    if (filters.minSeats) {
      results = results.filter((o) => o.availableSeats >= filters.minSeats!);
    }
    return results.map((o) => this.fromOrm(o));
  }

  async findByDriverId(driverId: string): Promise<TripEntity[]> {
    return (await this.repo.findBy({ driverId })).map((o) => this.fromOrm(o));
  }

  async save(entity: TripEntity): Promise<TripEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: TripEntity): Promise<TripEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: TripEntity): TripOrmEntity {
    const orm = new TripOrmEntity();
    orm.id = entity.id;
    orm.driverId = entity.driverId;
    orm.vehicleId = entity.vehicleId;
    orm.origin = {
      latitude: entity.origin.latitude,
      longitude: entity.origin.longitude,
      address: entity.origin.address,
      city: entity.origin.city,
    };
    orm.destination = {
      latitude: entity.destination.latitude,
      longitude: entity.destination.longitude,
      address: entity.destination.address,
      city: entity.destination.city,
    };
    orm.departureAt = entity.departureAt;
    orm.availableSeats = entity.availableSeats;
    orm.pricePerSeat = entity.pricePerSeat;
    orm.status = entity.status;
    orm.notes = entity.notes ?? null;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: TripOrmEntity): TripEntity {
    const entity = TripEntity.create({
      id: orm.id,
      driverId: orm.driverId,
      vehicleId: orm.vehicleId,
      origin: LocationValueObject.create(orm.origin),
      destination: LocationValueObject.create(orm.destination),
      departureAt: orm.departureAt,
      availableSeats: orm.availableSeats,
      pricePerSeat: orm.pricePerSeat,
      status: orm.status,
      notes: orm.notes ?? undefined,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
