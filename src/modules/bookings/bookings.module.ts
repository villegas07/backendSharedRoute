import { Module } from '@nestjs/common';
import { BookingRepository } from './domain/repositories/booking.repository.interface';
import { CreateBookingUseCase } from './application/use-cases/create-booking.use-case';
import { BookingRepositoryImpl } from './infrastructure/persistence/booking.repository';
import { BookingsController } from './presentation/controllers/bookings.controller';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [TripsModule],
  controllers: [BookingsController],
  providers: [
    { provide: BookingRepository, useClass: BookingRepositoryImpl },
    CreateBookingUseCase,
  ],
  exports: [BookingRepository],
})
export class BookingsModule {}
