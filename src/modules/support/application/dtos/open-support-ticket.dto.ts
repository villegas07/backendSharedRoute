import { IsEnum, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportCategory } from '../../domain/enums/support-category.enum';
import { SupportPriority } from '../../domain/enums/support-priority.enum';

export class OpenSupportTicketDto {
  @ApiProperty({
    enum: SupportCategory,
    description: 'Categoría del reporte de soporte',
    example: SupportCategory.DRIVER_REPORT,
  })
  @IsEnum(SupportCategory)
  category: SupportCategory;

  @ApiProperty({ example: 'Conductor con comportamiento inapropiado', minLength: 5, maxLength: 100 })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  subject: string;

  @ApiProperty({
    example: 'El conductor me faltó el respeto durante el viaje y tomó rutas no autorizadas.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({ example: 'trip-uuid-123', description: 'ID del viaje relacionado (si aplica)' })
  @IsOptional()
  @IsString()
  relatedTripId?: string;

  @ApiPropertyOptional({ example: 'user-uuid-456', description: 'ID del usuario reportado (si aplica)' })
  @IsOptional()
  @IsString()
  relatedUserId?: string;

  @ApiPropertyOptional({ enum: SupportPriority, default: SupportPriority.MEDIUM })
  @IsOptional()
  @IsEnum(SupportPriority)
  priority?: SupportPriority;
}
