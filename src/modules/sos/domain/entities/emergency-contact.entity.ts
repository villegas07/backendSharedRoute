import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export interface EmergencyContactProps {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  relationship?: string;
}

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export class EmergencyContactEntity extends BaseEntity {
  userId: string;
  name: string;
  phone: string;
  relationship?: string;

  private constructor(props: EmergencyContactProps) {
    super(props.id);
    this.userId = props.userId;
    this.name = props.name;
    this.phone = props.phone;
    this.relationship = props.relationship;
  }

  static create(props: EmergencyContactProps): EmergencyContactEntity {
    EmergencyContactEntity.validate(props.userId, props.name, props.phone);
    return new EmergencyContactEntity(props);
  }

  update(name: string, phone: string, relationship?: string): void {
    EmergencyContactEntity.validate(this.userId, name, phone);
    this.name = name;
    this.phone = phone;
    this.relationship = relationship;
    this.touch();
  }

  private static validate(
    userId: string,
    name: string,
    phone: string,
  ): void {
    if (!userId?.trim()) {
      throw new DomainException(
        'User ID is required',
        'MISSING_USER_ID',
      );
    }
    if (!name?.trim()) {
      throw new DomainException(
        'Contact name is required',
        'MISSING_CONTACT_NAME',
      );
    }
    if (!phone?.trim()) {
      throw new DomainException(
        'Phone number is required',
        'MISSING_PHONE',
      );
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      throw new DomainException(
        'Invalid phone format. Use 7–15 digits, optionally prefixed with +',
        'INVALID_PHONE_FORMAT',
      );
    }
  }
}

