import { BookingStatus } from '../../domain/entities/booking.entity';

export class BookingResponseDto {
  id: string;
  tripId: string;
  passengerId: string;
  seatsReserved: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
}
