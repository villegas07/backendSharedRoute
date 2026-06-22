import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { BookingEntity } from '../entities/booking.entity';

export abstract class BookingRepository extends BaseRepository<BookingEntity> {
  abstract findByTripId(tripId: string): Promise<BookingEntity[]>;
  abstract findByPassengerId(passengerId: string): Promise<BookingEntity[]>;
  abstract findByTripAndPassenger(tripId: string, passengerId: string): Promise<BookingEntity | null>;
}
