import { Module } from '@nestjs/common';
import { TripRepository } from './domain/repositories/trip.repository.interface';
import { PublishTripUseCase } from './application/use-cases/publish-trip.use-case';
import { TripRepositoryImpl } from './infrastructure/persistence/trip.repository';
import { TripsController } from './presentation/controllers/trips.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { HasActiveSubscriptionGuard } from '../../shared/guards/has-active-subscription.guard';

@Module({
  imports: [SubscriptionsModule],
  controllers: [TripsController],
  providers: [
    { provide: TripRepository, useClass: TripRepositoryImpl },
    PublishTripUseCase,
    HasActiveSubscriptionGuard,
  ],
  exports: [TripRepository],
})
export class TripsModule {}
