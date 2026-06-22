import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '../../domain/entities/subscription.entity';

export class SubscriptionResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-driver' })
  driverId: string;

  @ApiProperty({ example: 'uuid-plan' })
  planId: string;

  @ApiProperty({ example: '30 Días' })
  planName: string;

  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty({ example: true })
  isActive: boolean;
}
