import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperación recibido por correo electrónico' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NuevaPassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
