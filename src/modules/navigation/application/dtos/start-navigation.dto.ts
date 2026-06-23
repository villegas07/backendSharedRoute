import { IsString, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartNavigationDto {
  @ApiProperty({ description: 'ID del viaje', example: 'trip-uuid-123' })
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'IDs de los pasajeros confirmados', example: ['pass-1', 'pass-2'] })
  @IsArray()
  @IsString({ each: true })
  passengerIds: string[];

  @ApiProperty({ description: 'Latitud de origen', example: 4.711 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat: number;

  @ApiProperty({ description: 'Longitud de origen', example: -74.0721 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng: number;

  @ApiProperty({ description: 'Latitud de destino', example: 4.6097 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLat: number;

  @ApiProperty({ description: 'Longitud de destino', example: -74.0817 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLng: number;
}
