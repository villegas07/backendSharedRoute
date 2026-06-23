import { IsEnum, IsString, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'ID del plan de suscripción', example: 'plan-monthly-uuid' })
  @IsString()
  planId: string;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Método de pago Wompi',
    example: PaymentMethod.NEQUI,
  })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 'conductor@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: 'Carlos Rodríguez' })
  @IsString()
  customerFullName: string;

  @ApiProperty({
    description: 'URL de redirección tras el pago (puede ser deep-link de la app móvil)',
    example: 'https://app.sharedroute.co/payment/result',
  })
  @IsUrl()
  redirectUrl: string;
}
