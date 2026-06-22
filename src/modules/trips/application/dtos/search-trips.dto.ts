import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTripsDto {
  @ApiPropertyOptional({ example: 'Bogotá' })
  @IsString()
  @IsOptional()
  originCity?: string;

  @ApiPropertyOptional({ example: 'Medellín' })
  @IsString()
  @IsOptional()
  destinationCity?: string;

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  departureDate?: Date;

  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  minSeats?: number;
}
