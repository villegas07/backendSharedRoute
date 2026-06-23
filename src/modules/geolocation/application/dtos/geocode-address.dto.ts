import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeocodeAddressDto {
  @ApiProperty({
    description: 'Dirección a geocodificar',
    example: 'Calle 100 #15-20, Bogotá',
  })
  @IsString()
  @MinLength(3)
  address: string;
}
