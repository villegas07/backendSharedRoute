import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../../domain/entities/driver-document.entity';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType, description: 'Tipo de documento' })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({
    example: 'SOA-2024-123456',
    description: 'Número de identificación del documento (requerido para SOAT y Licencia)',
  })
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Fecha de vencimiento (requerida para SOAT y Licencia)',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'uuid-vehicle', description: 'ID del vehículo (para SOAT)' })
  @IsString()
  @IsOptional()
  vehicleId?: string;
}
