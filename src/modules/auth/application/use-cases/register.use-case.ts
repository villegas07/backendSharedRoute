import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { CreateUserUseCase } from '../../../users/application/use-cases/create-user.use-case';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RegisterDto } from '../dtos/register.dto';
import { UserMapper } from '../../../users/application/mappers/user.mapper';
import { TokenService } from '../../infrastructure/strategies/token.service';

@Injectable()
export class RegisterUseCase implements UseCase<RegisterDto, AuthResponseDto> {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const userDto = await this.createUserUseCase.execute(dto);
    const user = await this.userRepository.findById(userDto.id);

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user!.id, user!.role),
      this.tokenService.generateRefreshToken(user!.id),
    ]);

    return { accessToken, refreshToken, user: UserMapper.toResponse(user!) };
  }
}
