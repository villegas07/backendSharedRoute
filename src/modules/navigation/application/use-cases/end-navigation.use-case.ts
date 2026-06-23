import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { NavigationSessionRepository } from '../../domain/ports/navigation-session.repository';
import { NavigationSessionEntity } from '../../domain/entities/navigation-session.entity';

interface EndNavigationInput {
  sessionId: string;
  driverId: string;
}

@Injectable()
export class EndNavigationUseCase
  implements UseCase<EndNavigationInput, NavigationSessionEntity>
{
  constructor(
    private readonly sessionRepo: NavigationSessionRepository,
  ) {}

  async execute(
    input: EndNavigationInput,
  ): Promise<NavigationSessionEntity> {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) {
      throw new NotFoundException('Sesión de navegación no encontrada');
    }

    session.complete();
    await this.sessionRepo.save(session);
    return session;
  }
}
