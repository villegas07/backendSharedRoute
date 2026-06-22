import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface SubscriptionProps {
  id?: string;
  driverId: string;
  planId: string;
  planName: string;
  startAt: Date;
  expiresAt: Date;
  status?: SubscriptionStatus;
}

export class SubscriptionEntity extends BaseEntity {
  driverId: string;
  planId: string;
  planName: string;
  startAt: Date;
  expiresAt: Date;
  status: SubscriptionStatus;

  private constructor(props: SubscriptionProps) {
    super(props.id);
    this.driverId = props.driverId;
    this.planId = props.planId;
    this.planName = props.planName;
    this.startAt = props.startAt;
    this.expiresAt = props.expiresAt;
    this.status = props.status ?? SubscriptionStatus.ACTIVE;
  }

  static create(props: SubscriptionProps): SubscriptionEntity {
    if (props.expiresAt <= props.startAt) {
      throw new DomainException('Expiration must be after start date', 'INVALID_SUBSCRIPTION_DATES');
    }
    return new SubscriptionEntity(props);
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && new Date() < this.expiresAt;
  }

  cancel(): void {
    if (this.status !== SubscriptionStatus.ACTIVE) {
      throw new DomainException('Only active subscriptions can be cancelled', 'SUBSCRIPTION_NOT_ACTIVE');
    }
    this.status = SubscriptionStatus.CANCELLED;
    this.touch();
  }
}
