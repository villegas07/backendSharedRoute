import { Injectable, Logger } from '@nestjs/common';
import { SosNotificationPort, SosNotificationPayload } from '../../domain/ports/sos-notification.port';
import { EmergencyContactEntity } from '../../domain/entities/emergency-contact.entity';
import { SosAlertEntity } from '../../domain/entities/sos-alert.entity';

@Injectable()
export class StubSosNotificationAdapter extends SosNotificationPort {
  private readonly logger = new Logger(StubSosNotificationAdapter.name);

  async notifyEmergencyContacts(
    contacts: EmergencyContactEntity[],
    alert: SosAlertEntity,
    payload: SosNotificationPayload,
  ): Promise<void> {
    for (const contact of contacts) {
      this.logger.warn(
        `[SOS] Would send SMS to ${contact.name} (${contact.phone}) ` +
          `— Alert ${alert.id} by ${payload.triggeredByName} ` +
          `at lat:${payload.latitude ?? '?'} lng:${payload.longitude ?? '?'}`,
      );
    }
  }
}
