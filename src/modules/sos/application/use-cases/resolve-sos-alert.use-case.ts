import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { SosAlertRepository } from '../../domain/ports/sos-alert.repository';
import { SosAlertEntity } from '../../domain/entities/sos-alert.entity';

interface ResolveSosAlertInput {
  alertId: string;
  resolvedById: string;
}

@Injectable()
export class ResolveSosAlertUseCase
  implements UseCase<ResolveSosAlertInput, SosAlertEntity>
{
  constructor(private readonly alertRepo: SosAlertRepository) {}

  async execute(input: ResolveSosAlertInput): Promise<SosAlertEntity> {
    const alert = await this.alertRepo.findById(input.alertId);
    if (!alert) {
      throw new NotFoundException('Alerta SOS no encontrada');
    }

    alert.resolve(input.resolvedById);
    await this.alertRepo.save(alert);
    return alert;
  }
}
