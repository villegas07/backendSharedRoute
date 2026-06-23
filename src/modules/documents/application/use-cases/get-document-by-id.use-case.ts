import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';
import { DocumentResponseDto } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class GetDocumentByIdUseCase {
  constructor(private readonly documentRepository: DriverDocumentRepository) {}

  async execute(id: string): Promise<DocumentResponseDto> {
    const doc = await this.documentRepository.findById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return DocumentMapper.toResponse(doc);
  }
}
