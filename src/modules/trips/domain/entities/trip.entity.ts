import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { LocationValueObject } from '../value-objects/location.vo';

export enum TripStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface TripProps {
  id?: string;
  driverId: string;
  vehicleId: string;
  origin: LocationValueObject;
  destination: LocationValueObject;
  departureAt: Date;
  availableSeats: number;
  pricePerSeat: number;
  status?: TripStatus;
  notes?: string;
}

export class TripEntity extends BaseEntity {
  driverId: string;
  vehicleId: string;
  origin: LocationValueObject;
  destination: LocationValueObject;
  departureAt: Date;
  availableSeats: number;
  pricePerSeat: number;
  status: TripStatus;
  notes?: string;

  private constructor(props: TripProps) {
    super(props.id);
    this.driverId = props.driverId;
    this.vehicleId = props.vehicleId;
    this.origin = props.origin;
    this.destination = props.destination;
    this.departureAt = props.departureAt;
    this.availableSeats = props.availableSeats;
    this.pricePerSeat = props.pricePerSeat;
    this.status = props.status ?? TripStatus.DRAFT;
    this.notes = props.notes;
  }

  static create(props: TripProps): TripEntity {
    if (props.departureAt <= new Date()) {
      throw new DomainException('Departure must be in the future', 'INVALID_DEPARTURE_DATE');
    }
    if (props.availableSeats < 1) {
      throw new DomainException('Must offer at least 1 seat', 'INVALID_SEATS');
    }
    return new TripEntity(props);
  }

  publish(): void {
    if (this.status !== TripStatus.DRAFT) {
      throw new DomainException('Only draft trips can be published', 'INVALID_TRIP_STATE');
    }
    this.status = TripStatus.PUBLISHED;
    this.touch();
  }

  reserveSeat(): void {
    if (this.availableSeats === 0) {
      throw new DomainException('No seats available', 'NO_SEATS_AVAILABLE');
    }
    this.availableSeats -= 1;
    this.touch();
  }

  cancel(): void {
    if (this.status === TripStatus.COMPLETED) {
      throw new DomainException('Cannot cancel a completed trip', 'TRIP_ALREADY_COMPLETED');
    }
    this.status = TripStatus.CANCELLED;
    this.touch();
  }

  hasAvailableSeats(): boolean {
    return this.availableSeats > 0 && this.status === TripStatus.PUBLISHED;
  }
}
