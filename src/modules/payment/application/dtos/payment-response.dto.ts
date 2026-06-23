import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class InitiatePaymentResponseDto {
  @ApiProperty({ example: 'tx-uuid' })
  transactionId: string;

  @ApiProperty({ example: 'https://checkout.wompi.co/?public-key=...&amount-in-cents=3000000' })
  paymentLink: string;

  @ApiProperty({ example: 'SR-driver1-plan-monthly-a1b2c3d4' })
  wompiReference: string;

  @ApiProperty({ example: 3000000, description: 'Monto en centavos (COP)' })
  amountInCents: number;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;
}

export class PaymentTransactionResponseDto {
  @ApiProperty({ example: 'tx-uuid' })
  id: string;

  @ApiProperty({ example: 'driver-uuid' })
  driverId: string;

  @ApiProperty({ example: 'plan-uuid' })
  planId: string;

  @ApiProperty({ example: 'Plan Mensual' })
  planName: string;

  @ApiProperty({ example: 3000000 })
  amountInCents: number;

  @ApiProperty({ example: 'COP' })
  currency: string;

  @ApiProperty({ enum: PaymentMethod })
  method: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiPropertyOptional({ example: 'wompi-tx-abc123' })
  wompiTransactionId?: string;

  @ApiPropertyOptional({ example: 'SR-driver1-plan-monthly-a1b2c3d4' })
  wompiReference?: string;

  @ApiPropertyOptional({ example: 'https://checkout.wompi.co/...' })
  paymentLink?: string;

  @ApiPropertyOptional()
  approvedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
