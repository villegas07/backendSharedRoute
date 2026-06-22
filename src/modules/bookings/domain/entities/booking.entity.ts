import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED_BY_PASSENGER = 'CANCELLED_BY_PASSENGER',
  CANCELLED_BY_DRIVER = 'CANCELLED_BY_DRIVER',
  COMPLETED = 'COMPLETED',
}

export interface BookingProps {
  id?: string;
  tripId: string;
  passengerId: string;
  seatsReserved: number;
  totalPrice: number;
  status?: BookingStatus;
}

export class BookingEntity extends BaseEntity {
  tripId: string;
  passengerId: string;
  seatsReserved: number;
  totalPrice: number;
  status: BookingStatus;

  private constructor(props: BookingProps) {
    super(props.id);
    this.tripId = props.tripId;
    this.passengerId = props.passengerId;
    this.seatsReserved = props.seatsReserved;
    this.totalPrice = props.totalPrice;
    this.status = props.status ?? BookingStatus.PENDING;
  }

  static create(props: BookingProps): BookingEntity {
    if (props.seatsReserved < 1) {
      throw new DomainException('Must reserve at least 1 seat', 'INVALID_SEAT_RESERVATION');
    }
    return new BookingEntity(props);
  }

  confirm(): void {
    if (this.status !== BookingStatus.PENDING) {
      throw new DomainException('Only pending bookings can be confirmed', 'INVALID_BOOKING_STATE');
    }
    this.status = BookingStatus.CONFIRMED;
    this.touch();
  }

  cancelByPassenger(): void {
    if (this.status === BookingStatus.COMPLETED) {
      throw new DomainException('Cannot cancel a completed booking', 'BOOKING_ALREADY_COMPLETED');
    }
    this.status = BookingStatus.CANCELLED_BY_PASSENGER;
    this.touch();
  }

  cancelByDriver(): void {
    this.status = BookingStatus.CANCELLED_BY_DRIVER;
    this.touch();
  }

  isCancelled(): boolean {
    return (
      this.status === BookingStatus.CANCELLED_BY_PASSENGER ||
      this.status === BookingStatus.CANCELLED_BY_DRIVER
    );
  }
}
