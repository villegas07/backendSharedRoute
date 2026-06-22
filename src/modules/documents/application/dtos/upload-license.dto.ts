import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class UploadLicenseDto {
  @ApiProperty({ example: '123456789', description: 'Número de la licencia de conducción' })
  @IsString()
  identificationNumber: string;

  @ApiProperty({ example: '2030-06-20', description: 'Fecha de vencimiento de la licencia' })
  @IsDateString()
  expiresAt: string;
}
