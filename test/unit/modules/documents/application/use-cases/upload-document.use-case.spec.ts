import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UploadDocumentUseCase } from '@/modules/documents/application/use-cases/upload-document.use-case';
import { DocumentType, DriverDocumentEntity, DocumentStatus } from '@/modules/documents/domain/entities/driver-document.entity';
import { UserEntity, UserRole } from '@/modules/users/domain/entities/user.entity';

const buildMockDocRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByDriverId: jest.fn(), findByDriverAndType: jest.fn(), findPending: jest.fn(), hasAllApproved: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildMockUserRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByEmail: jest.fn(), findByPhone: jest.fn(), findDrivers: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildMockStorage = () => ({ upload: jest.fn().mockResolvedValue('uploads/documents/file.jpg'), delete: jest.fn() });

const buildDriver = () => UserEntity.create({ id: 'driver-1', firstName: 'J', lastName: 'P', email: 'j@t.com', phone: '123', passwordHash: 'h', role: UserRole.DRIVER });

const buildPassenger = () => UserEntity.create({ id: 'p-1', firstName: 'M', lastName: 'G', email: 'm@t.com', phone: '456', passwordHash: 'h', role: UserRole.PASSENGER });

const buildFile = (mimetype = 'image/jpeg', size = 1024): Express.Multer.File => ({
  fieldname: 'file', originalname: 'doc.jpg', encoding: '7bit', mimetype, size, buffer: Buffer.from(''), stream: null as any, destination: '', filename: '', path: '',
});

const buildSavedDoc = () =>
  DriverDocumentEntity.create({ driverId: 'driver-1', type: DocumentType.CEDULA, fileUrl: 'uploads/documents/file.jpg', fileOriginalName: 'doc.jpg', identificationNumber: '123' });

describe('UploadDocumentUseCase', () => {
  let useCase: UploadDocumentUseCase;
  let docRepo: ReturnType<typeof buildMockDocRepo>;
  let userRepo: ReturnType<typeof buildMockUserRepo>;
  let storage: ReturnType<typeof buildMockStorage>;

  beforeEach(() => {
    docRepo = buildMockDocRepo();
    userRepo = buildMockUserRepo();
    storage = buildMockStorage();
    useCase = new UploadDocumentUseCase(docRepo as any, userRepo as any, storage as any);
  });

  it('should upload a document successfully', async () => {
    userRepo.findById.mockResolvedValue(buildDriver());
    docRepo.save.mockResolvedValue(buildSavedDoc());

    const result = await useCase.execute({
      driverId: 'driver-1', type: DocumentType.CEDULA, file: buildFile(), identificationNumber: '1020304050',
    });

    expect(result.status).toBe(DocumentStatus.PENDING);
    expect(storage.upload).toHaveBeenCalledTimes(1);
  });

  it('should throw ForbiddenException when user is not a driver', async () => {
    userRepo.findById.mockResolvedValue(buildPassenger());
    await expect(useCase.execute({ driverId: 'p-1', type: DocumentType.CEDULA, file: buildFile(), identificationNumber: '123' })).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException for invalid MIME type', async () => {
    userRepo.findById.mockResolvedValue(buildDriver());
    await expect(useCase.execute({ driverId: 'driver-1', type: DocumentType.CEDULA, file: buildFile('application/exe'), identificationNumber: '123' })).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for file exceeding 10 MB', async () => {
    userRepo.findById.mockResolvedValue(buildDriver());
    const bigFile = buildFile('image/jpeg', 11 * 1024 * 1024);
    await expect(useCase.execute({ driverId: 'driver-1', type: DocumentType.CEDULA, file: bigFile, identificationNumber: '123' })).rejects.toThrow(BadRequestException);
  });
});
