import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../application/use-cases/use-case.interface';
import { FileStorageService } from '../../../../shared/storage/file-storage.service';
import { DriverDocumentEntity, DocumentType } from '../../domain/entities/driver-document.entity';
import { DriverDocumentRepository } from '../../domain/repositories/driver-document.repository.interface';
import { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { DocumentResponseDto } from '../dtos/document-response.dto';
import { DocumentMapper } from '../mappers/document.mapper';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface UploadDocumentInput {
  driverId: string;
  type: DocumentType;
  file: Express.Multer.File;
  identificationNumber?: string;
  expiresAt?: string;
  vehicleId?: string;
}

@Injectable()
export class UploadDocumentUseCase implements UseCase<UploadDocumentInput, DocumentResponseDto> {
  constructor(
    private readonly documentRepository: DriverDocumentRepository,
    private readonly userRepository: UserRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute(input: UploadDocumentInput): Promise<DocumentResponseDto> {
    await this.validateDriver(input.driverId);
    this.validateFile(input.file);

    const fileUrl = await this.fileStorageService.upload(input.file, 'documents');

    const document = DriverDocumentEntity.create({
      driverId: input.driverId,
      vehicleId: input.vehicleId,
      type: input.type,
      fileUrl,
      fileOriginalName: input.file.originalname,
      identificationNumber: input.identificationNumber,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    });

    const saved = await this.documentRepository.save(document);
    return DocumentMapper.toResponse(saved);
  }

  private async validateDriver(driverId: string): Promise<void> {
    const user = await this.userRepository.findById(driverId);
    if (!user || !user.isDriver()) {
      throw new ForbiddenException('Only drivers can upload documents');
    }
  }

  private validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('File is required');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, WEBP or PDF files are allowed');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File must not exceed 10 MB');
    }
  }
}
