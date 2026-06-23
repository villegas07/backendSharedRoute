import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { EmergencyContactRepository } from '../../domain/ports/emergency-contact.repository';
import { SosAlertRepository } from '../../domain/ports/sos-alert.repository';
import { SosNotificationPort } from '../../domain/ports/sos-notification.port';
import { SosAlertEntity } from '../../domain/entities/sos-alert.entity';
import { SosUserRole } from '../../domain/enums/sos-user-role.enum';

export interface TriggerSosAlertInput {
  userId: string;
  userRole: SosUserRole;
  tripId?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
}

@Injectable()
export class TriggerSosAlertUseCase
  implements UseCase<TriggerSosAlertInput, SosAlertEntity>
{
  constructor(
    private readonly contactRepo: EmergencyContactRepository,
    private readonly alertRepo: SosAlertRepository,
    private readonly notificationPort: SosNotificationPort,
  ) {}

  async execute(input: TriggerSosAlertInput): Promise<SosAlertEntity> {
    const contacts = await this.contactRepo.findByUserId(input.userId);

    const alert = SosAlertEntity.create({
      userId: input.userId,
      userRole: input.userRole,
      tripId: input.tripId,
      latitude: input.latitude,
      longitude: input.longitude,
      message: input.message,
    });

    await this.alertRepo.save(alert);

    await this.notificationPort.notifyEmergencyContacts(contacts, alert, {
      triggeredByName: input.userId,
      tripId: input.tripId,
      latitude: input.latitude,
      longitude: input.longitude,
      message: input.message,
    });

    return alert;
  }
}
