import { UserEntity } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dtos/user-response.dto';

export class UserMapper {
  static toResponse(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.fullName = entity.fullName;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.role = entity.role;
    dto.status = entity.status;
    dto.profilePhotoUrl = entity.profilePhotoUrl;
    dto.averageRating = entity.averageRating;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toResponseList(entities: UserEntity[]): UserResponseDto[] {
    return entities.map((entity) => UserMapper.toResponse(entity));
  }
}
