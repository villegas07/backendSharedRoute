import { Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';
import { ReviewDocumentDto } from '../dtos/review-document.dto';
import { DocumentResponseDto } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';

interface ReviewDocumentInput {
  documentId: string;
  adminId: string;
  dto: ReviewDocumentDto;
}

@Injectable()
export class ReviewDocumentUseCase implements UseCase<ReviewDocumentInput, DocumentResponseDto> {
  constructor(private readonly documentRepository: DriverDocumentRepository) {}

  async execute({ documentId, adminId, dto }: ReviewDocumentInput): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new NotFoundException(`Document ${documentId} not found`);

    if (dto.approved) {
      document.approve(adminId);
    } else {
      document.reject(adminId, dto.rejectionReason ?? '');
    }

    const updated = await this.documentRepository.update(document);
    return DocumentMapper.toResponse(updated);
  }
}
