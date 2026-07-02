import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';

export abstract class PasswordResetTokenRepository extends BaseRepository<PasswordResetTokenEntity> {
  abstract findByToken(token: string): Promise<PasswordResetTokenEntity | null>;
  abstract deleteByUserId(userId: string): Promise<void>;
}
