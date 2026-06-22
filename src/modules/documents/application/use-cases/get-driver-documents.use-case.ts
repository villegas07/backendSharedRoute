import { Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';
import { DocumentResponseDto } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';

@Injectable()
export class GetDriverDocumentsUseCase implements UseCase<string, DocumentResponseDto[]> {
  constructor(private readonly documentRepository: DriverDocumentRepository) {}

  async execute(driverId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.documentRepository.findByDriverId(driverId);
    return DocumentMapper.toResponseList(documents);
  }
}
