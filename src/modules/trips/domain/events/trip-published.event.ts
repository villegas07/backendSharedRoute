import { DomainEvent } from '../../../../domain/events/domain.event';

export class TripPublishedEvent extends DomainEvent {
  constructor(
    tripId: string,
    readonly driverId: string,
    readonly availableSeats: number,
  ) {
    super(tripId);
  }

  get eventName(): string {
    return 'trip.published';
  }
}
