import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export enum PlanType {
  HOURS_24 = 'HOURS_24',
  DAYS = 'DAYS',
  MONTHLY = 'MONTHLY',
}

export interface SubscriptionPlanProps {
  id?: string;
  name: string;
  type: PlanType;
  durationHours: number;
  price: number;
  isActive?: boolean;
}

export class SubscriptionPlanEntity extends BaseEntity {
  name: string;
  type: PlanType;
  durationHours: number;
  price: number;
  isActive: boolean;

  private constructor(props: SubscriptionPlanProps) {
    super(props.id);
    this.name = props.name;
    this.type = props.type;
    this.durationHours = props.durationHours;
    this.price = props.price;
    this.isActive = props.isActive ?? true;
  }

  static create(props: SubscriptionPlanProps): SubscriptionPlanEntity {
    if (props.durationHours <= 0) {
      throw new DomainException('Duration must be positive', 'INVALID_PLAN_DURATION');
    }
    if (props.price < 0) {
      throw new DomainException('Price cannot be negative', 'INVALID_PLAN_PRICE');
    }
    return new SubscriptionPlanEntity(props);
  }

  computeExpirationFrom(startDate: Date): Date {
    const expiration = new Date(startDate);
    expiration.setHours(expiration.getHours() + this.durationHours);
    return expiration;
  }
}
