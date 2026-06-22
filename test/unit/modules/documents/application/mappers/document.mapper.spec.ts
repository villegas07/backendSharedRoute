import { DriverDocumentEntity, DocumentType, DocumentStatus } from '@/modules/documents/domain/entities/driver-document.entity';
import { DocumentMapper } from '@/modules/documents/application/mappers/document.mapper';

const buildDoc = () =>
  DriverDocumentEntity.create({
    id: 'doc-1',
    driverId: 'driver-1',
    type: DocumentType.CEDULA,
    fileUrl: 'uploads/docs/cedula.jpg',
    fileOriginalName: 'cedula.jpg',
    identificationNumber: '1020304050',
  });

describe('DocumentMapper', () => {
  it('should map all fields', () => {
    const dto = DocumentMapper.toResponse(buildDoc());
    expect(dto.driverId).toBe('driver-1');
    expect(dto.type).toBe(DocumentType.CEDULA);
    expect(dto.status).toBe(DocumentStatus.PENDING);
  });

  it('toResponseList should map each document', () => {
    const dtos = DocumentMapper.toResponseList([buildDoc(), buildDoc()]);
    expect(dtos).toHaveLength(2);
  });
});
