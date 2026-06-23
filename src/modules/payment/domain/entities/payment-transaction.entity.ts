import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export interface PaymentTransactionProps {
  id?: string;
  driverId: string;
  planId: string;
  planName: string;
  amountInCents: number;
  currency: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  wompiTransactionId?: string;
  wompiReference?: string;
  redirectUrl?: string;
  paymentLink?: string;
  approvedAt?: Date;
  metadata?: Record<string, unknown>;
}

export class PaymentTransactionEntity extends BaseEntity {
  readonly driverId: string;
  readonly planId: string;
  readonly planName: string;
  readonly amountInCents: number;
  readonly currency: string;
  readonly method: PaymentMethod;
  status: PaymentStatus;
  wompiTransactionId?: string;
  wompiReference?: string;
  redirectUrl?: string;
  paymentLink?: string;
  approvedAt?: Date;
  metadata?: Record<string, unknown>;

  private constructor(props: PaymentTransactionProps) {
    super(props.id);
    this.driverId = props.driverId;
    this.planId = props.planId;
    this.planName = props.planName;
    this.amountInCents = props.amountInCents;
    this.currency = props.currency;
    this.method = props.method;
    this.status = props.status ?? PaymentStatus.PENDING;
    this.wompiTransactionId = props.wompiTransactionId;
    this.wompiReference = props.wompiReference;
    this.redirectUrl = props.redirectUrl;
    this.paymentLink = props.paymentLink;
    this.approvedAt = props.approvedAt;
    this.metadata = props.metadata;
  }

  static create(props: PaymentTransactionProps): PaymentTransactionEntity {
    PaymentTransactionEntity.validate(props);
    return new PaymentTransactionEntity(props);
  }

  approve(wompiTransactionId: string): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new DomainException(
        'Only pending transactions can be approved',
        'TX_NOT_PENDING',
      );
    }
    this.status = PaymentStatus.APPROVED;
    this.wompiTransactionId = wompiTransactionId;
    this.approvedAt = new Date();
    this.touch();
  }

  decline(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new DomainException(
        'Only pending transactions can be declined',
        'TX_NOT_PENDING',
      );
    }
    this.status = PaymentStatus.DECLINED;
    this.touch();
  }

  isApproved(): boolean {
    return this.status === PaymentStatus.APPROVED;
  }

  private static validate(props: PaymentTransactionProps): void {
    if (!props.driverId?.trim()) {
      throw new DomainException('Driver ID is required', 'MISSING_DRIVER_ID');
    }
    if (!props.planId?.trim()) {
      throw new DomainException('Plan ID is required', 'MISSING_PLAN_ID');
    }
    if (!props.currency?.trim()) {
      throw new DomainException('Currency is required', 'MISSING_CURRENCY');
    }
    if (props.amountInCents <= 0) {
      throw new DomainException(
        'Amount must be greater than zero',
        'INVALID_AMOUNT',
      );
    }
  }
}
