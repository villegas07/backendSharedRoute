import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';
import { FileStorageService } from '../../../../shared/storage/file-storage.service';

interface DeleteDocumentInput {
  documentId: string;
  driverId: string;
}

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: DriverDocumentRepository,
    private readonly fileStorage: FileStorageService,
  ) {}

  async execute({ documentId, driverId }: DeleteDocumentInput): Promise<void> {
    const doc = await this.documentRepository.findById(documentId);
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.driverId !== driverId) throw new ForbiddenException('Document does not belong to you');

    await this.fileStorage.delete(doc.fileUrl);
    await this.documentRepository.delete(documentId);
  }
}
