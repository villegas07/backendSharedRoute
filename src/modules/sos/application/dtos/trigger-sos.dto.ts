import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { SosUserRole } from '../../domain/enums/sos-user-role.enum';

export class TriggerSosDto {
  @ApiProperty({ enum: SosUserRole })
  @IsEnum(SosUserRole)
  userRole: SosUserRole;

  @ApiPropertyOptional({ example: 'trip-uuid-123' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({ example: 4.711 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -74.0721 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 'Conductor agresivo, necesito ayuda' })
  @IsOptional()
  @IsString()
  message?: string;
}
