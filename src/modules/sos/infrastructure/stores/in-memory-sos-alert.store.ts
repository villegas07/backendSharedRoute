import { Injectable } from '@nestjs/common';
import { SosAlertRepository } from '../../domain/ports/sos-alert.repository';
import { SosAlertEntity } from '../../domain/entities/sos-alert.entity';

@Injectable()
export class InMemorySosAlertStore extends SosAlertRepository {
  private readonly alerts = new Map<string, SosAlertEntity>();

  async save(alert: SosAlertEntity): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async findById(id: string): Promise<SosAlertEntity | null> {
    return this.alerts.get(id) ?? null;
  }

  async findActiveByUserId(userId: string): Promise<SosAlertEntity[]> {
    return [...this.alerts.values()].filter(
      (a) => a.userId === userId && a.isActive(),
    );
  }

  async findAllActive(): Promise<SosAlertEntity[]> {
    return [...this.alerts.values()].filter((a) => a.isActive());
  }
}
