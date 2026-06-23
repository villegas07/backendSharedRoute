import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeocodedAddressResponseDto {
  @ApiProperty({ example: 'Calle 100 #15-20, Bogotá, Colombia' })
  formattedAddress: string;

  @ApiProperty({ example: 'Bogotá' })
  city: string;

  @ApiProperty({ example: 'Bogotá D.C.' })
  department: string;

  @ApiProperty({ example: 'Colombia' })
  country: string;

  @ApiPropertyOptional({ example: '110111' })
  postalCode: string;

  @ApiProperty({ example: 4.711 })
  latitude: number;

  @ApiProperty({ example: -74.0721 })
  longitude: number;

  @ApiProperty({ example: 'ChIJOwg_06VPwokRYv534QaPC8g' })
  placeId: string;
}

export class PlacePredictionResponseDto {
  @ApiProperty({ example: 'ChIJOwg_06VPwokRYv534QaPC8g' })
  placeId: string;

  @ApiProperty({ example: 'Centro Comercial Andino, Bogotá, Colombia' })
  description: string;

  @ApiProperty({ example: 'Centro Comercial Andino' })
  mainText: string;

  @ApiProperty({ example: 'Bogotá, Colombia' })
  secondaryText: string;
}
