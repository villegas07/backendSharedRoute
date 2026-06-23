import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlaceDetailsDto {
  @ApiProperty({
    description: 'ID del lugar de Google Places',
    example: 'ChIJOwg_06VPwokRYv534QaPC8g',
  })
  @IsString()
  placeId: string;
}
