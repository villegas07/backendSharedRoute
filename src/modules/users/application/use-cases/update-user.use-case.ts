import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

interface UpdateUserInput {
  userId: string;
  dto: UpdateUserDto;
}

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ userId, dto }: UpdateUserInput): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.firstName) user.firstName = dto.firstName;
    if (dto.lastName) user.lastName = dto.lastName;
    if (dto.phone) user.phone = dto.phone;
    if (dto.profilePhotoUrl !== undefined) user.profilePhotoUrl = dto.profilePhotoUrl;
    user.touch();

    const updated = await this.userRepository.update(user);
    return UserMapper.toResponse(updated);
  }
}
