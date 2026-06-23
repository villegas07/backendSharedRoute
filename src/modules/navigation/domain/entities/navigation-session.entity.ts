import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { NavigationStatus } from '../enums/navigation-status.enum';
import { RouteInfo } from '../value-objects/route-info.vo';
import { DriverLocationUpdate } from '../value-objects/driver-location.vo';

export interface NavigationSessionProps {
  id?: string;
  tripId: string;
  driverId: string;
  passengerIds: string[];
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  route?: RouteInfo;
  status?: NavigationStatus;
}

export class NavigationSessionEntity extends BaseEntity {
  readonly tripId: string;
  readonly driverId: string;
  readonly passengerIds: string[];
  readonly originLat: number;
  readonly originLng: number;
  readonly destinationLat: number;
  readonly destinationLng: number;
  route: RouteInfo | null;
  status: NavigationStatus;
  driverLocation: DriverLocationUpdate | null;
  currentStepIndex: number;
  estimatedArrivalSeconds: number;

  private constructor(props: NavigationSessionProps) {
    super(props.id);
    this.tripId = props.tripId;
    this.driverId = props.driverId;
    this.passengerIds = [...props.passengerIds];
    this.originLat = props.originLat;
    this.originLng = props.originLng;
    this.destinationLat = props.destinationLat;
    this.destinationLng = props.destinationLng;
    this.route = props.route ?? null;
    this.status = props.status ?? NavigationStatus.WAITING;
    this.driverLocation = null;
    this.currentStepIndex = 0;
    this.estimatedArrivalSeconds = 0;
  }

  static create(props: NavigationSessionProps): NavigationSessionEntity {
    if (!props.tripId) {
      throw new DomainException('Trip ID is required', 'MISSING_TRIP_ID');
    }
    if (!props.driverId) {
      throw new DomainException('Driver ID is required', 'MISSING_DRIVER_ID');
    }
    return new NavigationSessionEntity(props);
  }

  start(): void {
    if (this.status !== NavigationStatus.WAITING) {
      throw new DomainException(
        'Only waiting sessions can be started',
        'INVALID_NAVIGATION_STATE',
      );
    }
    this.status = NavigationStatus.ACTIVE;
    this.touch();
  }

  updateDriverLocation(location: DriverLocationUpdate): void {
    if (this.status !== NavigationStatus.ACTIVE) {
      throw new DomainException(
        'Can only update location on active sessions',
        'NAVIGATION_NOT_ACTIVE',
      );
    }
    this.driverLocation = location;
    this.touch();
  }

  advanceStep(): void {
    if (!this.route) return;
    if (this.currentStepIndex < this.route.steps.length - 1) {
      this.currentStepIndex += 1;
    }
  }

  updateEta(seconds: number): void {
    this.estimatedArrivalSeconds = seconds;
  }

  complete(): void {
    if (this.status !== NavigationStatus.ACTIVE) {
      throw new DomainException(
        'Only active sessions can be completed',
        'INVALID_NAVIGATION_STATE',
      );
    }
    this.status = NavigationStatus.COMPLETED;
    this.touch();
  }

  cancel(): void {
    if (this.isFinished()) {
      throw new DomainException(
        'Cannot cancel a finished session',
        'NAVIGATION_ALREADY_FINISHED',
      );
    }
    this.status = NavigationStatus.CANCELLED;
    this.touch();
  }

  isFinished(): boolean {
    return (
      this.status === NavigationStatus.COMPLETED ||
      this.status === NavigationStatus.CANCELLED
    );
  }

  isParticipant(userId: string): boolean {
    return (
      this.driverId === userId || this.passengerIds.includes(userId)
    );
  }
}
