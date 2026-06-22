import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredOn: Date;

  protected constructor(aggregateId: string) {
    this.eventId = randomUUID();
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
  }

  abstract get eventName(): string;
}
