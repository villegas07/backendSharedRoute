import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_INSPECTION = 'PENDING_INSPECTION',
}

export interface VehicleProps {
  id?: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  totalSeats: number;
  status?: VehicleStatus;
  photoUrl?: string;
}

export class VehicleEntity extends BaseEntity {
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  totalSeats: number;
  status: VehicleStatus;
  photoUrl?: string;

  private constructor(props: VehicleProps) {
    super(props.id);
    this.ownerId = props.ownerId;
    this.brand = props.brand;
    this.model = props.model;
    this.year = props.year;
    this.plate = props.plate;
    this.color = props.color;
    this.totalSeats = props.totalSeats;
    this.status = props.status ?? VehicleStatus.PENDING_INSPECTION;
    this.photoUrl = props.photoUrl;
  }

  static create(props: VehicleProps): VehicleEntity {
    if (props.totalSeats < 1 || props.totalSeats > 8) {
      throw new DomainException('Vehicle must have between 1 and 8 seats', 'INVALID_SEAT_COUNT');
    }
    return new VehicleEntity(props);
  }

  get displayName(): string {
    return `${this.year} ${this.brand} ${this.model}`;
  }

  isAvailable(): boolean {
    return this.status === VehicleStatus.ACTIVE;
  }
}
