import { IsString, IsNumber, IsOptional, IsUrl, Min, Max, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '../../domain/entities/vehicle.entity';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional() @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'Corolla' })
  @IsOptional() @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional() @IsNumber() @Min(1990) @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({ example: 'Negro' })
  @IsOptional() @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional() @IsNumber() @Min(1) @Max(8)
  totalSeats?: number;

  @ApiPropertyOptional({ example: 'https://cdn.sharedroute.app/vehicles/foto.jpg' })
  @IsOptional() @IsUrl()
  photoUrl?: string;

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional() @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
