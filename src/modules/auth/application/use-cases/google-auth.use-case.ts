import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { UserEntity, UserRole, UserStatus } from '../../../users/domain/entities/user.entity';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { UserMapper } from '../../../users/application/mappers/user.mapper';
import { TokenService } from '../../infrastructure/strategies/token.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { GoogleProfileData } from '../dtos/google-profile.dto';

@Injectable()
export class GoogleAuthUseCase implements UseCase<GoogleProfileData, AuthResponseDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(profile: GoogleProfileData): Promise<AuthResponseDto> {
    const user = await this.findOrCreateUser(profile);
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user.id, user.role),
      this.tokenService.generateRefreshToken(user.id),
    ]);
    return { accessToken, refreshToken, user: UserMapper.toResponse(user) };
  }

  private async findOrCreateUser(profile: GoogleProfileData): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(profile.email);
    if (existing) return existing;
    return this.createGoogleUser(profile);
  }

  private async createGoogleUser(profile: GoogleProfileData): Promise<UserEntity> {
    const user = UserEntity.create({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: '',
      passwordHash: randomBytes(32).toString('hex'),
      role: UserRole.PASSENGER,
      status: UserStatus.ACTIVE,
      profilePhotoUrl: profile.profilePhotoUrl,
    });
    return this.userRepository.save(user);
  }
}
