import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurchaseSubscriptionDto {
  @ApiProperty({ example: 'uuid-plan', description: 'ID del plan de suscripción' })
  @IsString()
  planId: string;
}
