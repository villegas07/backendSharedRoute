import { DriverDocumentEntity, DocumentType, DocumentStatus } from '@/modules/documents/domain/entities/driver-document.entity';
import { DomainException } from '@/domain/exceptions/domain.exception';

const buildProps = (overrides = {}) => ({
  driverId: 'driver-1',
  type: DocumentType.CEDULA,
  fileUrl: 'uploads/documents/cedula.jpg',
  fileOriginalName: 'cedula.jpg',
  ...overrides,
});

const soatProps = () => buildProps({
  type: DocumentType.SOAT,
  identificationNumber: 'SOA-2024-001',
  expiresAt: new Date('2027-01-01'),
});

describe('DriverDocumentEntity', () => {
  describe('create', () => {
    it('should create with PENDING status by default', () => {
      const doc = DriverDocumentEntity.create(buildProps());
      expect(doc.status).toBe(DocumentStatus.PENDING);
    });

    it('should create CEDULA without identificationNumber requirement', () => {
      expect(() => DriverDocumentEntity.create(buildProps())).not.toThrow();
    });

    it('should throw when SOAT is missing identificationNumber', () => {
      expect(() =>
        DriverDocumentEntity.create(buildProps({ type: DocumentType.SOAT, expiresAt: new Date('2027-01-01') })),
      ).toThrow(DomainException);
    });

    it('should throw when SOAT is missing expiresAt', () => {
      expect(() =>
        DriverDocumentEntity.create(buildProps({ type: DocumentType.SOAT, identificationNumber: 'SOA-001' })),
      ).toThrow(DomainException);
    });

    it('should throw when LICENSE is missing identificationNumber', () => {
      expect(() =>
        DriverDocumentEntity.create(buildProps({ type: DocumentType.LICENSE, expiresAt: new Date('2030-01-01') })),
      ).toThrow(DomainException);
    });
  });

  describe('approve', () => {
    it('should set status to APPROVED and store reviewedBy', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      doc.approve('admin-1');
      expect(doc.status).toBe(DocumentStatus.APPROVED);
      expect(doc.reviewedBy).toBe('admin-1');
    });

    it('should clear reviewNote when approving', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      doc.reject('admin-1', 'blurry image');
      doc.approve('admin-1');
      expect(doc.reviewNote).toBeUndefined();
    });
  });

  describe('reject', () => {
    it('should set status to REJECTED with reason', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      doc.reject('admin-1', 'Document expired');
      expect(doc.status).toBe(DocumentStatus.REJECTED);
      expect(doc.reviewNote).toBe('Document expired');
    });

    it('should throw when rejectionReason is empty', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      expect(() => doc.reject('admin-1', '')).toThrow(DomainException);
    });
  });

  describe('isExpired', () => {
    it('should return false when no expiresAt', () => {
      const doc = DriverDocumentEntity.create(buildProps());
      expect(doc.isExpired()).toBe(false);
    });

    it('should return true when expiresAt is in the past', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      (doc as any).expiresAt = new Date('2020-01-01');
      expect(doc.isExpired()).toBe(true);
    });
  });

  describe('isValid', () => {
    it('should return true when APPROVED and not expired', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      doc.approve('admin-1');
      expect(doc.isValid()).toBe(true);
    });

    it('should return false when still PENDING', () => {
      const doc = DriverDocumentEntity.create(soatProps());
      expect(doc.isValid()).toBe(false);
    });
  });
});
