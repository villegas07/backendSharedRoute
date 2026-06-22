import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ example: 'Juan Pérez' })
  fullName: string;

  @ApiProperty({ example: 'juan.perez@correo.com' })
  email: string;

  @ApiProperty({ example: '+573001234567' })
  phone: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiPropertyOptional({ example: 'https://cdn.sharedroute.app/photos/user.jpg' })
  profilePhotoUrl?: string;

  @ApiProperty({ example: 4.8 })
  averageRating: number;

  @ApiProperty()
  createdAt: Date;
}
