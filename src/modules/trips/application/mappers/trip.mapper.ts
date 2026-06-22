import { TripEntity } from '../../domain/entities/trip.entity';
import { TripResponseDto } from '../dtos/trip-response.dto';

export class TripMapper {
  static toResponse(entity: TripEntity): TripResponseDto {
    const dto = new TripResponseDto();
    dto.id = entity.id;
    dto.driverId = entity.driverId;
    dto.vehicleId = entity.vehicleId;
    dto.originAddress = entity.origin.address;
    dto.originCity = entity.origin.city;
    dto.destinationAddress = entity.destination.address;
    dto.destinationCity = entity.destination.city;
    dto.departureAt = entity.departureAt;
    dto.availableSeats = entity.availableSeats;
    dto.pricePerSeat = entity.pricePerSeat;
    dto.status = entity.status;
    dto.notes = entity.notes;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static toResponseList(entities: TripEntity[]): TripResponseDto[] {
    return entities.map((e) => TripMapper.toResponse(e));
  }
}
