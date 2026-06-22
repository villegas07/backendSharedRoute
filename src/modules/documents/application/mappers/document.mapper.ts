import { DriverDocumentEntity } from '../../domain/entities/driver-document.entity';
import { DocumentResponseDto } from '../dtos/document-response.dto';

export class DocumentMapper {
  static toResponse(entity: DriverDocumentEntity): DocumentResponseDto {
    const dto = new DocumentResponseDto();
    dto.id = entity.id;
    dto.driverId = entity.driverId;
    dto.vehicleId = entity.vehicleId;
    dto.type = entity.type;
    dto.fileUrl = entity.fileUrl;
    dto.fileOriginalName = entity.fileOriginalName;
    dto.identificationNumber = entity.identificationNumber;
    dto.expiresAt = entity.expiresAt;
    dto.status = entity.status;
    dto.reviewNote = entity.reviewNote;
    dto.reviewedBy = entity.reviewedBy;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  static toResponseList(entities: DriverDocumentEntity[]): DocumentResponseDto[] {
    return entities.map((e) => DocumentMapper.toResponse(e));
  }
}
