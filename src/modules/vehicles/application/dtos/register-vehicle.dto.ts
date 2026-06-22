import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class RegisterVehicleDto {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2020, minimum: 1990 })
  @IsNumber()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  plate: string;

  @ApiProperty({ example: 'Blanco' })
  @IsString()
  color: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 8 })
  @IsNumber()
  @Min(1)
  @Max(8)
  totalSeats: number;

  @ApiPropertyOptional({ example: 'https://cdn.sharedroute.app/vehicles/foto.jpg' })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
