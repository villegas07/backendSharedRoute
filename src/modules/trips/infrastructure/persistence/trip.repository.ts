import { Injectable } from '@nestjs/common';
import { TripEntity } from '../../domain/entities/trip.entity';
import { TripRepository, TripSearchFilters } from '../../domain/repositories/trip.repository.interface';

@Injectable()
export class TripRepositoryImpl extends TripRepository {
  async findById(_id: string): Promise<TripEntity | null> { throw new Error('Not implemented'); }
  async findAll(): Promise<TripEntity[]> { throw new Error('Not implemented'); }
  async findAvailable(_filters: TripSearchFilters): Promise<TripEntity[]> { throw new Error('Not implemented'); }
  async findByDriverId(_driverId: string): Promise<TripEntity[]> { throw new Error('Not implemented'); }
  async save(_entity: TripEntity): Promise<TripEntity> { throw new Error('Not implemented'); }
  async update(_entity: TripEntity): Promise<TripEntity> { throw new Error('Not implemented'); }
  async delete(_id: string): Promise<void> { throw new Error('Not implemented'); }
  async exists(_id: string): Promise<boolean> { throw new Error('Not implemented'); }
}
