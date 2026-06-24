import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';
import { PasswordResetTokenEntity } from '../../domain/entities/password-reset-token.entity';
import { EmailPort } from '../ports/email.port';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase implements UseCase<ForgotPasswordDto, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetTokenRepository: PasswordResetTokenRepository,
    private readonly emailPort: EmailPort,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) return; // Security: don't reveal if email exists

    await this.resetTokenRepository.deleteByUserId(user.id);

    const resetToken = PasswordResetTokenEntity.create(user.id);
    await this.resetTokenRepository.save(resetToken);

    await this.emailPort.sendPasswordResetEmail({
      to: user.email,
      token: resetToken.token,
      userName: user.firstName,
    });
  }
}
