import { IsEnum, IsOptional, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TripHistoryQueryDto {
  @ApiPropertyOptional({ enum: ['DRIVER', 'PASSENGER'], default: 'PASSENGER' })
  @IsOptional()
  @IsEnum(['DRIVER', 'PASSENGER'])
  role?: 'DRIVER' | 'PASSENGER';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ enum: ['COMPLETED', 'CANCELLED'], description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(['COMPLETED', 'CANCELLED'])
  status?: string;
}
