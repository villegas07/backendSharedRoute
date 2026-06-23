import { IsString, MinLength, Matches } from 'class-validator';
import { IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SosUserRole } from '../../domain/enums/sos-user-role.enum';

export class RegisterEmergencyContactDto {
  @ApiProperty({ description: 'Nombre completo del contacto de emergencia', example: 'María García' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Número de teléfono (7–15 dígitos, puede incluir prefijo +)',
    example: '+573001234567',
  })
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'El teléfono debe tener entre 7 y 15 dígitos (ej: +573001234567)',
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Relación con el contacto', example: 'Mamá' })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({ enum: SosUserRole, description: 'Rol del usuario que registra el contacto' })
  @IsEnum(SosUserRole)
  userRole: SosUserRole;
}
