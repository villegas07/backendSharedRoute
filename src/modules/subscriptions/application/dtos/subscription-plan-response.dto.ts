import { ApiProperty } from '@nestjs/swagger';
import { PlanType } from '../../domain/entities/subscription-plan.entity';

export class SubscriptionPlanResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: '24 Horas' })
  name: string;

  @ApiProperty({ enum: PlanType })
  type: PlanType;

  @ApiProperty({ example: 24, description: 'Duración en horas' })
  durationHours: number;

  @ApiProperty({ example: 9900, description: 'Precio en centavos (COP)' })
  price: number;
}
