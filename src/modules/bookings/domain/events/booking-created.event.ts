import { DomainEvent } from '../../../../domain/events/domain.event';

export class BookingCreatedEvent extends DomainEvent {
  constructor(
    bookingId: string,
    readonly tripId: string,
    readonly passengerId: string,
    readonly seatsReserved: number,
  ) {
    super(bookingId);
  }

  get eventName(): string {
    return 'booking.created';
  }
}
