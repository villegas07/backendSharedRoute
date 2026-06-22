import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  tripId: string;

  @IsNumber()
  @Min(1)
  seatsReserved: number;
}

export class CancelBookingDto {
  @IsString()
  bookingId: string;
}
