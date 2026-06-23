import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { NavigationSessionEntity } from '../../domain/entities/navigation-session.entity';
import { NavigationSessionRepository } from '../../domain/ports/navigation-session.repository';
import { DirectionsPort } from '../../domain/ports/directions.port';

interface StartNavigationInput {
  tripId: string;
  driverId: string;
  passengerIds: string[];
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
}

@Injectable()
export class StartNavigationUseCase
  implements UseCase<StartNavigationInput, NavigationSessionEntity>
{
  constructor(
    private readonly sessionRepo: NavigationSessionRepository,
    private readonly directionsPort: DirectionsPort,
  ) {}

  async execute(
    input: StartNavigationInput,
  ): Promise<NavigationSessionEntity> {
    const existing = await this.sessionRepo.findByTripId(input.tripId);
    if (existing && !existing.isFinished()) {
      return existing;
    }

    const route = await this.directionsPort.getDirections(
      input.originLat,
      input.originLng,
      input.destinationLat,
      input.destinationLng,
    );

    const session = NavigationSessionEntity.create({
      tripId: input.tripId,
      driverId: input.driverId,
      passengerIds: input.passengerIds,
      originLat: input.originLat,
      originLng: input.originLng,
      destinationLat: input.destinationLat,
      destinationLng: input.destinationLng,
      route,
    });

    session.start();
    await this.sessionRepo.save(session);
    return session;
  }
}
