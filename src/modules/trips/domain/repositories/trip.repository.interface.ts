import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { TripEntity } from '../entities/trip.entity';

export interface TripSearchFilters {
  originCity?: string;
  destinationCity?: string;
  departureDate?: Date;
  minSeats?: number;
}

export abstract class TripRepository extends BaseRepository<TripEntity> {
  abstract findAvailable(filters: TripSearchFilters): Promise<TripEntity[]>;
  abstract findByDriverId(driverId: string): Promise<TripEntity[]>;
}
