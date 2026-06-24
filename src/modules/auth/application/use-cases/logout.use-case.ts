import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { LogoutDto } from '../dtos/logout.dto';

@Injectable()
export class LogoutUseCase implements UseCase<LogoutDto, void> {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute(dto: LogoutDto): Promise<void> {
    const token = await this.refreshTokenRepository.findByToken(dto.refreshToken);
    if (!token || !token.isValid()) return;

    token.revoke();
    await this.refreshTokenRepository.update(token);
  }
}
