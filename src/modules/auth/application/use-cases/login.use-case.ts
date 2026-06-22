import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { UserMapper } from '../../../users/application/mappers/user.mapper';
import { TokenService } from '../../infrastructure/strategies/token.service';

@Injectable()
export class LoginUseCase implements UseCase<LoginDto, AuthResponseDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    await this.verifyCredentials(dto.password, user?.passwordHash);

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user!.id, user!.role),
      this.tokenService.generateRefreshToken(user!.id),
    ]);

    return { accessToken, refreshToken, user: UserMapper.toResponse(user!) };
  }

  private async verifyCredentials(password: string, hash?: string): Promise<void> {
    const isValid = hash ? await bcrypt.compare(password, hash) : false;
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
  }
}
