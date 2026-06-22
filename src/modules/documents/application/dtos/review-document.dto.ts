import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewDocumentDto {
  @ApiProperty({ description: 'true = aprobar, false = rechazar' })
  @IsBoolean()
  approved: boolean;

  @ApiPropertyOptional({ example: 'El SOAT está vencido', description: 'Motivo del rechazo (requerido si approved = false)' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
