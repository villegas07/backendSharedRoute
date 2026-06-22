import { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingResponseDto } from '../dtos/booking-response.dto';

export class BookingMapper {
  static toResponse(entity: BookingEntity): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = entity.id;
    dto.tripId = entity.tripId;
    dto.passengerId = entity.passengerId;
    dto.seatsReserved = entity.seatsReserved;
    dto.totalPrice = entity.totalPrice;
    dto.status = entity.status;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
