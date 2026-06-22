import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class FindUserByIdUseCase implements UseCase<string, UserResponseDto> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return UserMapper.toResponse(user);
  }
}
