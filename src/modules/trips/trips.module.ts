import { Module } from '@nestjs/common';
import { TripRepository } from './domain/repositories/trip.repository.interface';
import { PublishTripUseCase } from './application/use-cases/publish-trip.use-case';
import { GetTripByIdUseCase } from './application/use-cases/get-trip-by-id.use-case';
import { GetMyTripsUseCase } from './application/use-cases/get-my-trips.use-case';
import { UpdateTripUseCase } from './application/use-cases/update-trip.use-case';
import { CancelTripUseCase } from './application/use-cases/cancel-trip.use-case';
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
    GetTripByIdUseCase,
    GetMyTripsUseCase,
    UpdateTripUseCase,
    CancelTripUseCase,
    HasActiveSubscriptionGuard,
  ],
  exports: [TripRepository],
})
export class TripsModule {}
