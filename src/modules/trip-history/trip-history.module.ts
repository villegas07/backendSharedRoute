import { Module } from '@nestjs/common';
import { TripHistoryPort } from './domain/ports/trip-history.port';
import { InMemoryTripHistoryAdapter } from './infrastructure/adapters/in-memory-trip-history.adapter';
import { GetTripHistoryUseCase } from './application/use-cases/get-trip-history.use-case';
import { GetTripHistoryDetailUseCase } from './application/use-cases/get-trip-history-detail.use-case';
import { TripHistoryController } from './presentation/controllers/trip-history.controller';

@Module({
  controllers: [TripHistoryController],
  providers: [
    { provide: TripHistoryPort, useClass: InMemoryTripHistoryAdapter },
    GetTripHistoryUseCase,
    GetTripHistoryDetailUseCase,
  ],
  exports: [TripHistoryPort],
})
export class TripHistoryModule {}
