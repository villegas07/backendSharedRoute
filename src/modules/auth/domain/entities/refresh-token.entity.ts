import { BaseEntity } from '../../../../domain/entities/base.entity';

export interface RefreshTokenProps {
  id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked?: boolean;
}

export class RefreshTokenEntity extends BaseEntity {
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;

  private constructor(props: RefreshTokenProps) {
    super(props.id);
    this.userId = props.userId;
    this.token = props.token;
    this.expiresAt = props.expiresAt;
    this.isRevoked = props.isRevoked ?? false;
  }

  static create(props: RefreshTokenProps): RefreshTokenEntity {
    return new RefreshTokenEntity(props);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }

  revoke(): void {
    this.isRevoked = true;
    this.touch();
  }
}
