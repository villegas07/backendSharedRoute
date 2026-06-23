import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { NavigationSessionRepository } from '../../domain/ports/navigation-session.repository';

interface GetSessionInput {
  sessionId: string;
  userId: string;
  role: 'DRIVER' | 'PASSENGER';
}

export interface DriverView {
  sessionId: string;
  status: string;
  route: unknown;
  currentStepIndex: number;
  etaSeconds: number;
  passengers: string[];
}

export interface PassengerView {
  sessionId: string;
  status: string;
  driverLocation: unknown;
  etaSeconds: number;
  polyline: string;
  startAddress: string;
  endAddress: string;
}

@Injectable()
export class GetNavigationViewUseCase
  implements UseCase<GetSessionInput, DriverView | PassengerView>
{
  constructor(
    private readonly sessionRepo: NavigationSessionRepository,
  ) {}

  async execute(
    input: GetSessionInput,
  ): Promise<DriverView | PassengerView> {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de navegación no encontrada');
    }

    if (input.role === 'DRIVER') {
      return this.buildDriverView(session);
    }
    return this.buildPassengerView(session);
  }

  private buildDriverView(session: {
    id: string;
    status: string;
    route: unknown;
    currentStepIndex: number;
    estimatedArrivalSeconds: number;
    passengerIds: string[];
  }): DriverView {
    return {
      sessionId: session.id,
      status: session.status,
      route: session.route,
      currentStepIndex: session.currentStepIndex,
      etaSeconds: session.estimatedArrivalSeconds,
      passengers: session.passengerIds,
    };
  }

  private buildPassengerView(session: {
    id: string;
    status: string;
    driverLocation: unknown;
    estimatedArrivalSeconds: number;
    route: { polyline: string; startAddress: string; endAddress: string } | null;
  }): PassengerView {
    return {
      sessionId: session.id,
      status: session.status,
      driverLocation: session.driverLocation,
      etaSeconds: session.estimatedArrivalSeconds,
      polyline: session.route?.polyline ?? '',
      startAddress: session.route?.startAddress ?? '',
      endAddress: session.route?.endAddress ?? '',
    };
  }
}
