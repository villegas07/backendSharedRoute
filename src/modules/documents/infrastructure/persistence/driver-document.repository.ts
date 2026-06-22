import { Injectable } from '@nestjs/common';
import { DriverDocumentEntity, DocumentType } from '../../domain/entities/driver-document.entity';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';

@Injectable()
export class DriverDocumentRepositoryImpl extends DriverDocumentRepository {
  async findById(_id: string): Promise<DriverDocumentEntity | null> { throw new Error('Not implemented'); }
  async findAll(): Promise<DriverDocumentEntity[]> { throw new Error('Not implemented'); }
  async findByDriverId(_driverId: string): Promise<DriverDocumentEntity[]> { throw new Error('Not implemented'); }
  async findByDriverAndType(_driverId: string, _type: DocumentType): Promise<DriverDocumentEntity | null> { throw new Error('Not implemented'); }
  async findPending(): Promise<DriverDocumentEntity[]> { throw new Error('Not implemented'); }
  async hasAllApproved(_driverId: string): Promise<boolean> { throw new Error('Not implemented'); }
  async save(_entity: DriverDocumentEntity): Promise<DriverDocumentEntity> { throw new Error('Not implemented'); }
  async update(_entity: DriverDocumentEntity): Promise<DriverDocumentEntity> { throw new Error('Not implemented'); }
  async delete(_id: string): Promise<void> { throw new Error('Not implemented'); }
  async exists(_id: string): Promise<boolean> { throw new Error('Not implemented'); }
}
