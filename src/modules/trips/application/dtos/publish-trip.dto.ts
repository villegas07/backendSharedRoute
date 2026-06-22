import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PublishTripDto {
  @ApiProperty({ example: 'uuid-vehicle' })
  @IsString()
  vehicleId: string;

  @ApiProperty({ example: 'Cra 7 # 32-18, Bogotá' })
  @IsString()
  originAddress: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  originCity: string;

  @ApiProperty({ example: 4.711 })
  @IsNumber()
  originLatitude: number;

  @ApiProperty({ example: -74.0721 })
  @IsNumber()
  originLongitude: number;

  @ApiProperty({ example: 'Av. El Dorado # 103-23, Bogotá' })
  @IsString()
  destinationAddress: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  destinationCity: string;

  @ApiProperty({ example: 4.701 })
  @IsNumber()
  destinationLatitude: number;

  @ApiProperty({ example: -74.1469 })
  @IsNumber()
  destinationLongitude: number;

  @ApiProperty({ example: '2026-07-01T08:00:00.000Z' })
  @IsDate()
  @Type(() => Date)
  departureAt: Date;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsNumber()
  @Min(1)
  availableSeats: number;

  @ApiProperty({ example: 15000, minimum: 0 })
  @IsNumber()
  @Min(0)
  pricePerSeat: number;

  @ApiPropertyOptional({ example: 'No mascotas. Salida puntual.' })
  @IsString()
  @IsOptional()
  notes?: string;
}
