import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-trip' })
  @IsString()
  tripId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  seatsReserved: number;
}

export class CancelBookingDto {
  @ApiProperty({ example: 'uuid-booking' })
  @IsString()
  bookingId: string;
}
