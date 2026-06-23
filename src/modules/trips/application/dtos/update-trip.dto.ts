import { IsString, IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateTripDto {
  @ApiPropertyOptional({ example: 'Cra 7 # 32-18, Bogotá' })
  @IsOptional() @IsString()
  originAddress?: string;

  @ApiPropertyOptional({ example: 'Bogotá' })
  @IsOptional() @IsString()
  originCity?: string;

  @ApiPropertyOptional({ example: 4.711 })
  @IsOptional() @IsNumber()
  originLatitude?: number;

  @ApiPropertyOptional({ example: -74.0721 })
  @IsOptional() @IsNumber()
  originLongitude?: number;

  @ApiPropertyOptional({ example: 'Av. El Dorado # 103-23, Bogotá' })
  @IsOptional() @IsString()
  destinationAddress?: string;

  @ApiPropertyOptional({ example: 'Bogotá' })
  @IsOptional() @IsString()
  destinationCity?: string;

  @ApiPropertyOptional({ example: 4.701 })
  @IsOptional() @IsNumber()
  destinationLatitude?: number;

  @ApiPropertyOptional({ example: -74.1469 })
  @IsOptional() @IsNumber()
  destinationLongitude?: number;

  @ApiPropertyOptional({ example: '2026-07-01T08:00:00.000Z' })
  @IsOptional() @IsDate() @Type(() => Date)
  departureAt?: Date;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional() @IsNumber() @Min(1)
  availableSeats?: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional() @IsNumber() @Min(0)
  pricePerSeat?: number;

  @ApiPropertyOptional({ example: 'No mascotas. Salida puntual.' })
  @IsOptional() @IsString()
  notes?: string;
}
