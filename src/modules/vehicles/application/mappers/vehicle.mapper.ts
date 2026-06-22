import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleResponseDto } from '../dtos/vehicle-response.dto';

export class VehicleMapper {
  static toResponse(entity: VehicleEntity): VehicleResponseDto {
    const dto = new VehicleResponseDto();
    dto.id = entity.id;
    dto.ownerId = entity.ownerId;
    dto.displayName = entity.displayName;
    dto.brand = entity.brand;
    dto.model = entity.model;
    dto.year = entity.year;
    dto.plate = entity.plate;
    dto.color = entity.color;
    dto.totalSeats = entity.totalSeats;
    dto.status = entity.status;
    dto.photoUrl = entity.photoUrl;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toResponseList(entities: VehicleEntity[]): VehicleResponseDto[] {
    return entities.map((e) => VehicleMapper.toResponse(e));
  }
}
