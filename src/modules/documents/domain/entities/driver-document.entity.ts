import { BaseEntity } from '../../../../domain/entities/base.entity';
import { DomainException } from '../../../../domain/exceptions/domain.exception';

export enum DocumentType {
  SOAT = 'SOAT',
  LICENSE = 'LICENSE',
  CEDULA = 'CEDULA',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface DriverDocumentProps {
  id?: string;
  driverId: string;
  vehicleId?: string;
  type: DocumentType;
  fileUrl: string;
  fileOriginalName: string;
  identificationNumber?: string;
  expiresAt?: Date;
  status?: DocumentStatus;
  reviewNote?: string;
  reviewedBy?: string;
}

export class DriverDocumentEntity extends BaseEntity {
  driverId: string;
  vehicleId?: string;
  type: DocumentType;
  fileUrl: string;
  fileOriginalName: string;
  identificationNumber?: string;
  expiresAt?: Date;
  status: DocumentStatus;
  reviewNote?: string;
  reviewedBy?: string;

  private constructor(props: DriverDocumentProps) {
    super(props.id);
    this.driverId = props.driverId;
    this.vehicleId = props.vehicleId;
    this.type = props.type;
    this.fileUrl = props.fileUrl;
    this.fileOriginalName = props.fileOriginalName;
    this.identificationNumber = props.identificationNumber;
    this.expiresAt = props.expiresAt;
    this.status = props.status ?? DocumentStatus.PENDING;
    this.reviewNote = props.reviewNote;
    this.reviewedBy = props.reviewedBy;
  }

  static create(props: DriverDocumentProps): DriverDocumentEntity {
    const requiresIdentification = [DocumentType.SOAT, DocumentType.LICENSE].includes(props.type);

    if (requiresIdentification && !props.identificationNumber) {
      throw new DomainException(
        `${props.type} requires an identification number`,
        'DOCUMENT_MISSING_IDENTIFICATION',
      );
    }

    if (requiresIdentification && !props.expiresAt) {
      throw new DomainException(
        `${props.type} requires an expiration date`,
        'DOCUMENT_MISSING_EXPIRATION',
      );
    }

    return new DriverDocumentEntity(props);
  }

  approve(adminId: string): void {
    if (this.status === DocumentStatus.APPROVED) return;
    this.status = DocumentStatus.APPROVED;
    this.reviewedBy = adminId;
    this.reviewNote = undefined;
    this.touch();
  }

  reject(adminId: string, reason: string): void {
    if (!reason?.trim()) {
      throw new DomainException('Rejection reason is required', 'DOCUMENT_REJECTION_REASON_REQUIRED');
    }
    this.status = DocumentStatus.REJECTED;
    this.reviewedBy = adminId;
    this.reviewNote = reason;
    this.touch();
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return this.status === DocumentStatus.APPROVED && !this.isExpired();
  }
}
