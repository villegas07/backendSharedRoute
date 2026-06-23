import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SosAlertStatus } from '../../domain/enums/sos-alert-status.enum';
import { SosUserRole } from '../../domain/enums/sos-user-role.enum';

export class EmergencyContactResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 'María García' })
  name: string;

  @ApiProperty({ example: '+573001234567' })
  phone: string;

  @ApiPropertyOptional({ example: 'Mamá' })
  relationship?: string;

  @ApiProperty()
  createdAt: Date;
}

export class SosAlertResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'driver-uuid' })
  userId: string;

  @ApiProperty({ enum: SosUserRole })
  userRole: SosUserRole;

  @ApiPropertyOptional({ example: 'trip-uuid' })
  tripId?: string;

  @ApiPropertyOptional({ example: 4.711 })
  latitude?: number;

  @ApiPropertyOptional({ example: -74.0721 })
  longitude?: number;

  @ApiPropertyOptional({ example: 'Necesito ayuda urgente' })
  message?: string;

  @ApiProperty({ enum: SosAlertStatus })
  status: SosAlertStatus;

  @ApiPropertyOptional({ example: 'admin-uuid' })
  resolvedById?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
