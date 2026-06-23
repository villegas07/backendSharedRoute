import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Latitud actual del conductor', example: 4.711 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Longitud actual del conductor', example: -74.0721 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ description: 'Dirección del movimiento en grados (0-360)', example: 45 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ description: 'Velocidad en km/h', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;
}
