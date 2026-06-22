import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export abstract class RefreshTokenRepository extends BaseRepository<RefreshTokenEntity> {
  abstract findByToken(token: string): Promise<RefreshTokenEntity | null>;
  abstract revokeAllForUser(userId: string): Promise<void>;
}
