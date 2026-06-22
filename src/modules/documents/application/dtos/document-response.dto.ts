import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentStatus, DocumentType } from '../../domain/entities/driver-document.entity';

export class DocumentResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-driver' })
  driverId: string;

  @ApiPropertyOptional({ example: 'uuid-vehicle' })
  vehicleId?: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty({ example: 'uploads/documents/abc.pdf' })
  fileUrl: string;

  @ApiProperty({ example: 'soat_2026.pdf' })
  fileOriginalName: string;

  @ApiPropertyOptional({ example: 'SOA-2024-123456' })
  identificationNumber?: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  expiresAt?: Date;

  @ApiProperty({ enum: DocumentStatus })
  status: DocumentStatus;

  @ApiPropertyOptional({ example: 'El documento está borroso' })
  reviewNote?: string;

  @ApiPropertyOptional({ example: 'uuid-admin' })
  reviewedBy?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
