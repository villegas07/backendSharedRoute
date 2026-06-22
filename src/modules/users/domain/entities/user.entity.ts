import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface UserProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
  profilePhotoUrl?: string;
  averageRating?: number;
}

export class UserEntity extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  profilePhotoUrl?: string;
  averageRating: number;

  private constructor(props: UserProps) {
    super(props.id);
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.status = props.status ?? UserStatus.PENDING_VERIFICATION;
    this.profilePhotoUrl = props.profilePhotoUrl;
    this.averageRating = props.averageRating ?? 0;
  }

  static create(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isDriver(): boolean {
    return this.role === UserRole.DRIVER;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
    this.touch();
  }

  suspend(): void {
    if (this.role === UserRole.ADMIN) {
      throw new DomainException('Admins cannot be suspended', 'ADMIN_SUSPENSION_NOT_ALLOWED');
    }
    this.status = UserStatus.SUSPENDED;
    this.touch();
  }
}
