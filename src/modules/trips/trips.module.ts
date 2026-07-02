import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripRepository } from './domain/repositories/trip.repository.interface';
import { PublishTripUseCase } from './application/use-cases/publish-trip.use-case';
import { GetTripByIdUseCase } from './application/use-cases/get-trip-by-id.use-case';
import { GetMyTripsUseCase } from './application/use-cases/get-my-trips.use-case';
import { UpdateTripUseCase } from './application/use-cases/update-trip.use-case';
import { CancelTripUseCase } from './application/use-cases/cancel-trip.use-case';
import { TripRepositoryImpl } from './infrastructure/persistence/trip.repository';
import { TripOrmEntity } from './infrastructure/persistence/entities/trip.orm-entity';
import { TripsController } from './presentation/controllers/trips.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { HasActiveSubscriptionGuard } from '../../shared/guards/has-active-subscription.guard';

@Module({
  imports: [SubscriptionsModule, TypeOrmModule.forFeature([TripOrmEntity])],
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
