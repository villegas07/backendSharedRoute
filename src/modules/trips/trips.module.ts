import { Module } from '@nestjs/common';
import { TripRepository } from './domain/repositories/trip.repository.interface';
import { PublishTripUseCase } from './application/use-cases/publish-trip.use-case';
import { TripRepositoryImpl } from './infrastructure/persistence/trip.repository';
import { TripsController } from './presentation/controllers/trips.controller';

@Module({
  controllers: [TripsController],
  providers: [
    { provide: TripRepository, useClass: TripRepositoryImpl },
    PublishTripUseCase,
  ],
  exports: [TripRepository],
})
export class TripsModule {}
