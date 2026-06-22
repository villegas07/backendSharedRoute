import { Injectable } from '@nestjs/common';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingRepository } from '../../domain/repositories/booking.repository.interface';

@Injectable()
export class BookingRepositoryImpl extends BookingRepository {
  async findById(_id: string): Promise<BookingEntity | null> { throw new Error('Not implemented'); }
  async findAll(): Promise<BookingEntity[]> { throw new Error('Not implemented'); }
  async findByTripId(_tripId: string): Promise<BookingEntity[]> { throw new Error('Not implemented'); }
  async findByPassengerId(_passengerId: string): Promise<BookingEntity[]> { throw new Error('Not implemented'); }
  async findByTripAndPassenger(_tripId: string, _passengerId: string): Promise<BookingEntity | null> { throw new Error('Not implemented'); }
  async save(_entity: BookingEntity): Promise<BookingEntity> { throw new Error('Not implemented'); }
  async update(_entity: BookingEntity): Promise<BookingEntity> { throw new Error('Not implemented'); }
  async delete(_id: string): Promise<void> { throw new Error('Not implemented'); }
  async exists(_id: string): Promise<boolean> { throw new Error('Not implemented'); }
}
