import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UploadSoatDto {
  @ApiProperty({ example: 'SOA-2024-789456', description: 'Número de póliza del SOAT' })
  @IsString()
  identificationNumber: string;

  @ApiProperty({ example: '2027-01-15', description: 'Fecha de vencimiento del SOAT' })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ example: 'uuid-vehicle', description: 'ID del vehículo al que aplica el SOAT' })
  @IsString()
  @IsOptional()
  vehicleId?: string;
}
