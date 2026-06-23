import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { SosAlertStatus } from '../enums/sos-alert-status.enum';
import { SosUserRole } from '../enums/sos-user-role.enum';

export interface SosAlertProps {
  id?: string;
  userId: string;
  userRole: SosUserRole;
  tripId?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  status?: SosAlertStatus;
}

export class SosAlertEntity extends BaseEntity {
  readonly userId: string;
  readonly userRole: SosUserRole;
  readonly tripId?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
  status: SosAlertStatus;
  resolvedById?: string;
  resolvedAt?: Date;

  private constructor(props: SosAlertProps) {
    super(props.id);
    this.userId = props.userId;
    this.userRole = props.userRole;
    this.tripId = props.tripId;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.message = props.message;
    this.status = props.status ?? SosAlertStatus.ACTIVE;
  }

  static create(props: SosAlertProps): SosAlertEntity {
    if (!props.userId?.trim()) {
      throw new DomainException('User ID is required', 'MISSING_USER_ID');
    }
    return new SosAlertEntity(props);
  }

  resolve(resolvedById: string): void {
    if (this.status !== SosAlertStatus.ACTIVE) {
      throw new DomainException(
        'Only active alerts can be resolved',
        'ALERT_NOT_ACTIVE',
      );
    }
    this.status = SosAlertStatus.RESOLVED;
    this.resolvedById = resolvedById;
    this.resolvedAt = new Date();
    this.touch();
  }

  cancel(): void {
    if (this.status !== SosAlertStatus.ACTIVE) {
      throw new DomainException(
        'Only active alerts can be cancelled',
        'ALERT_NOT_ACTIVE',
      );
    }
    this.status = SosAlertStatus.CANCELLED;
    this.touch();
  }

  isActive(): boolean {
    return this.status === SosAlertStatus.ACTIVE;
  }
}
