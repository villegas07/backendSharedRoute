import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';
import { BookingOrmEntity } from './entities/booking.orm-entity';

@Injectable()
export class BookingRepositoryImpl extends BookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly repo: Repository<BookingOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const orm = await this.repo.findOneBy({ id });
    return orm ? this.fromOrm(orm) : null;
  }

  async findAll(): Promise<BookingEntity[]> {
    return (await this.repo.find()).map((o) => this.fromOrm(o));
  }

  async findByTripId(tripId: string): Promise<BookingEntity[]> {
    return (await this.repo.findBy({ tripId })).map((o) => this.fromOrm(o));
  }

  async findByPassengerId(passengerId: string): Promise<BookingEntity[]> {
    return (await this.repo.findBy({ passengerId })).map((o) => this.fromOrm(o));
  }

  async findByTripAndPassenger(tripId: string, passengerId: string): Promise<BookingEntity | null> {
    const orm = await this.repo.findOneBy({ tripId, passengerId });
    return orm ? this.fromOrm(orm) : null;
  }

  async save(entity: BookingEntity): Promise<BookingEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async update(entity: BookingEntity): Promise<BookingEntity> {
    return this.fromOrm(await this.repo.save(this.toOrm(entity)));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.repo.existsBy({ id });
  }

  private toOrm(entity: BookingEntity): BookingOrmEntity {
    const orm = new BookingOrmEntity();
    orm.id = entity.id;
    orm.tripId = entity.tripId;
    orm.passengerId = entity.passengerId;
    orm.seatsReserved = entity.seatsReserved;
    orm.totalPrice = entity.totalPrice;
    orm.status = entity.status;
    orm.createdAt = entity.createdAt;
    orm.updatedAt = entity.updatedAt;
    return orm;
  }

  private fromOrm(orm: BookingOrmEntity): BookingEntity {
    const entity = BookingEntity.create({
      id: orm.id,
      tripId: orm.tripId,
      passengerId: orm.passengerId,
      seatsReserved: orm.seatsReserved,
      totalPrice: orm.totalPrice,
      status: orm.status,
    });
    Object.assign(entity, { createdAt: orm.createdAt, updatedAt: orm.updatedAt });
    return entity;
  }
}
