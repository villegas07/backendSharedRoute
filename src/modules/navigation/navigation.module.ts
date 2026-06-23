import { Module } from '@nestjs/common';
import { DirectionsPort } from './domain/ports/directions.port';
import { NavigationSessionRepository } from './domain/ports/navigation-session.repository';
import { GoogleDirectionsAdapter } from './infrastructure/adapters/google-directions.adapter';
import { InMemoryNavigationSessionStore } from './infrastructure/stores/in-memory-navigation-session.store';
import { StartNavigationUseCase } from './application/use-cases/start-navigation.use-case';
import { UpdateDriverLocationUseCase } from './application/use-cases/update-driver-location.use-case';
import { EndNavigationUseCase } from './application/use-cases/end-navigation.use-case';
import { GetNavigationViewUseCase } from './application/use-cases/get-navigation-view.use-case';
import { NavigationController } from './presentation/controllers/navigation.controller';
import { NavigationGateway } from './presentation/gateways/navigation.gateway';

@Module({
  controllers: [NavigationController],
  providers: [
    {
      provide: DirectionsPort,
      useClass: GoogleDirectionsAdapter,
    },
    {
      provide: NavigationSessionRepository,
      useClass: InMemoryNavigationSessionStore,
    },
    StartNavigationUseCase,
    UpdateDriverLocationUseCase,
    EndNavigationUseCase,
    GetNavigationViewUseCase,
    NavigationGateway,
  ],
  exports: [NavigationGateway],
})
export class NavigationModule {}
