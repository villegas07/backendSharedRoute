import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { APP_CONSTANTS } from '../../../../shared/constants/app.constants';
import { UserEntity, UserRole } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserDto, UserResponseDto> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureEmailIsUnique(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
    const user = UserEntity.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role ?? UserRole.PASSENGER,
    });

    const savedUser = await this.userRepository.save(user);
    return UserMapper.toResponse(savedUser);
  }

  private async ensureEmailIsUnique(email: string): Promise<void> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new ConflictException('Email already registered');
  }
}
