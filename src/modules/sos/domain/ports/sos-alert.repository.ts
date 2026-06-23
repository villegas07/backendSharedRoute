import { SosAlertEntity } from '../entities/sos-alert.entity';

export abstract class SosAlertRepository {
  abstract save(alert: SosAlertEntity): Promise<void>;
  abstract findById(id: string): Promise<SosAlertEntity | null>;
  abstract findActiveByUserId(userId: string): Promise<SosAlertEntity[]>;
  abstract findAllActive(): Promise<SosAlertEntity[]>;
}
