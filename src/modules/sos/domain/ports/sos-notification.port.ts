import { EmergencyContactEntity } from '../entities/emergency-contact.entity';
import { SosAlertEntity } from '../entities/sos-alert.entity';

export interface SosNotificationPayload {
  triggeredByName: string;
  triggeredByPhone?: string;
  tripId?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
}

export abstract class SosNotificationPort {
  abstract notifyEmergencyContacts(
    contacts: EmergencyContactEntity[],
    alert: SosAlertEntity,
    payload: SosNotificationPayload,
  ): Promise<void>;
}
