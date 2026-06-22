import { BaseRepository } from '../../../../domain/repositories/base.repository.interface';
import { DriverDocumentEntity, DocumentType } from '../entities/driver-document.entity';

export abstract class DriverDocumentRepository extends BaseRepository<DriverDocumentEntity> {
  abstract findByDriverId(driverId: string): Promise<DriverDocumentEntity[]>;
  abstract findByDriverAndType(driverId: string, type: DocumentType): Promise<DriverDocumentEntity | null>;
  abstract findPending(): Promise<DriverDocumentEntity[]>;
  abstract hasAllApproved(driverId: string): Promise<boolean>;
}
