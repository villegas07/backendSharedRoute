import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../domain/entities/booking.entity';

export class BookingResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'uuid-trip' })
  tripId: string;

  @ApiProperty({ example: 'uuid-passenger' })
  passengerId: string;

  @ApiProperty({ example: 1 })
  seatsReserved: number;

  @ApiProperty({ example: 15000 })
  totalPrice: number;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty()
  createdAt: Date;
}
