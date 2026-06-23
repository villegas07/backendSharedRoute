import { IsString, MinLength } from 'class-validator';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchPlacesDto {
  @ApiProperty({
    description: 'Texto de búsqueda del lugar',
    example: 'Centro Comercial Andino',
  })
  @IsString()
  @MinLength(2)
  query: string;

  @ApiPropertyOptional({
    description: 'Latitud para sesgo de proximidad',
    example: 4.711,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitud para sesgo de proximidad',
    example: -74.0721,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
