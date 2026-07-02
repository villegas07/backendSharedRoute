import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository.interface';
import { PasswordResetTokenEntity } from '../../domain/entities/password-reset-token.entity';
import { ResetPasswordDto } from '../dtos/reset-password.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class ResetPasswordUseCase implements UseCase<ResetPasswordDto, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly resetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.resetTokenRepository.findByToken(dto.token);
    this.assertTokenValid(resetToken);

    const user = await this.userRepository.findById(resetToken!.userId);
    if (!user) throw new NotFoundException('User not found');

    user.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    user.touch();

    await Promise.all([
      this.userRepository.update(user),
      this.resetTokenRepository.delete(resetToken!.id),
    ]);
  }

  private assertTokenValid(token: PasswordResetTokenEntity | null): void {
    if (!token || token.isExpired()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
  }
}
