import { NotFoundException } from '@nestjs/common';
import { ReviewDocumentUseCase } from '@/modules/documents/application/use-cases/review-document.use-case';
import { DriverDocumentEntity, DocumentType, DocumentStatus } from '@/modules/documents/domain/entities/driver-document.entity';

const buildMockRepo = () => ({
  findById: jest.fn(), findAll: jest.fn(), findByDriverId: jest.fn(), findByDriverAndType: jest.fn(), findPending: jest.fn(), hasAllApproved: jest.fn(), save: jest.fn(), update: jest.fn(), delete: jest.fn(), exists: jest.fn(),
});

const buildDoc = (status = DocumentStatus.PENDING) =>
  DriverDocumentEntity.create({ id: 'doc-1', driverId: 'driver-1', type: DocumentType.CEDULA, fileUrl: 'uploads/f.jpg', fileOriginalName: 'f.jpg', identificationNumber: '123', status });

describe('ReviewDocumentUseCase', () => {
  let useCase: ReviewDocumentUseCase;
  let mockRepo: ReturnType<typeof buildMockRepo>;

  beforeEach(() => {
    mockRepo = buildMockRepo();
    useCase = new ReviewDocumentUseCase(mockRepo as any);
  });

  it('should approve a document', async () => {
    const doc = buildDoc();
    mockRepo.findById.mockResolvedValue(doc);
    mockRepo.update.mockImplementation(async (d: DriverDocumentEntity) => d);

    const result = await useCase.execute({ documentId: 'doc-1', adminId: 'admin-1', dto: { approved: true } });

    expect(result.status).toBe(DocumentStatus.APPROVED);
    expect(result.reviewedBy).toBe('admin-1');
  });

  it('should reject a document with a reason', async () => {
    const doc = buildDoc();
    mockRepo.findById.mockResolvedValue(doc);
    mockRepo.update.mockImplementation(async (d: DriverDocumentEntity) => d);

    const result = await useCase.execute({ documentId: 'doc-1', adminId: 'admin-1', dto: { approved: false, rejectionReason: 'Imagen borrosa' } });

    expect(result.status).toBe(DocumentStatus.REJECTED);
    expect(result.reviewNote).toBe('Imagen borrosa');
  });

  it('should throw NotFoundException when document not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute({ documentId: 'missing', adminId: 'admin-1', dto: { approved: true } })).rejects.toThrow(NotFoundException);
  });
});
