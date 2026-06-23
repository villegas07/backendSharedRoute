import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersModule } from '../users/users.module';
import { DriverDocumentRepository } from './domain/repositories/driver-document.repository.interface';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.use-case';
import { ReviewDocumentUseCase } from './application/use-cases/review-document.use-case';
import { GetDriverDocumentsUseCase } from './application/use-cases/get-driver-documents.use-case';
import { GetDocumentByIdUseCase } from './application/use-cases/get-document-by-id.use-case';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.use-case';
import { DriverDocumentRepositoryImpl } from './infrastructure/persistence/driver-document.repository';
import { DocumentsController } from './presentation/controllers/documents.controller';
import { FileStorageService } from '../../shared/storage/file-storage.service';
import { LocalFileStorageService } from '../../shared/storage/local-file-storage.service';

@Module({
  imports: [
    UsersModule,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [DocumentsController],
  providers: [
    { provide: DriverDocumentRepository, useClass: DriverDocumentRepositoryImpl },
    { provide: FileStorageService, useClass: LocalFileStorageService },
    UploadDocumentUseCase,
    ReviewDocumentUseCase,
    GetDriverDocumentsUseCase,
    GetDocumentByIdUseCase,
    DeleteDocumentUseCase,
  ],
  exports: [DriverDocumentRepository],
})
export class DocumentsModule {}
