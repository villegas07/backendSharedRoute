import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadCedulaDto {
  @ApiProperty({ example: '1020304050', description: 'Número de cédula del conductor' })
  @IsString()
  identificationNumber: string;
}
