import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { NavigationSessionRepository } from '../../domain/ports/navigation-session.repository';
import { DirectionsPort } from '../../domain/ports/directions.port';
import { NavigationSessionEntity } from '../../domain/entities/navigation-session.entity';
import { DriverLocationUpdate } from '../../domain/value-objects/driver-location.vo';

interface UpdateLocationInput {
  sessionId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
}

export interface LocationUpdateResult {
  session: NavigationSessionEntity;
  etaSeconds: number;
}

@Injectable()
export class UpdateDriverLocationUseCase
  implements UseCase<UpdateLocationInput, LocationUpdateResult>
{
  constructor(
    private readonly sessionRepo: NavigationSessionRepository,
    private readonly directionsPort: DirectionsPort,
  ) {}

  async execute(input: UpdateLocationInput): Promise<LocationUpdateResult> {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de navegación no encontrada');
    }

    const location: DriverLocationUpdate = {
      latitude: input.latitude,
      longitude: input.longitude,
      heading: input.heading,
      speed: input.speed,
      timestamp: new Date(),
    };

    session.updateDriverLocation(location);

    const etaSeconds = await this.directionsPort.getEtaSeconds(
      input.latitude,
      input.longitude,
      session.destinationLat,
      session.destinationLng,
    );

    session.updateEta(etaSeconds);
    await this.sessionRepo.save(session);

    return { session, etaSeconds };
  }
}
