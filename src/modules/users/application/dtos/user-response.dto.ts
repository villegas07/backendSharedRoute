import { UserRole, UserStatus } from '../../domain/entities/user.entity';

export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  profilePhotoUrl?: string;
  averageRating: number;
  createdAt: Date;
}
