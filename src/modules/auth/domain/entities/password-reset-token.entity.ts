import { randomBytes } from 'crypto';
import { BaseEntity } from '../../../../domain/entities/base.entity';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface PasswordResetTokenProps {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
}

export class PasswordResetTokenEntity extends BaseEntity {
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;

  private constructor(props: PasswordResetTokenProps) {
    super(props.id);
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
  }

  static create(userId: string): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity({
      userId,
      token: randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });
  }

  static restore(props: PasswordResetTokenProps): PasswordResetTokenEntity {
    return new PasswordResetTokenEntity(props);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}
